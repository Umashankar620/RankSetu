// =============================================================================
// services/collegeInfoService.js  —  NEW, ADDITIVE ONLY
// =============================================================================
// Backs the College Directory (/college-info) + College Detail (/college/:slug)
// pages. Reads the EXISTING `institutes`, `cutoffs`, `institute_fees`,
// `institute_seat_matrix` tables (already extended/created by
// uploader_unified_v5.py) — does NOT touch cutoffService.js, does NOT
// change any existing table shape.
//
// Caching: piggy-backs on the SAME cache.js wrapper + the SAME
// import-version mechanism (cache.bumpImportVersion()) that the rest of the
// app already uses — i.e. cache.getImportVersion() is folded into every key,
// so a normal import run (which already calls bumpImportVersion()) silently
// invalidates these new keys too. No second invalidation pathway invented.
//
// Pagination: real SQL LIMIT/OFFSET, never SELECT * + paginate in JS.
// Indexes assumed (all created by uploader_unified_v5.py):
//   institutes:  idx_s, idx_ct, idx_s_ct, ftx_name (FULLTEXT), uq_slug
//   cutoffs:     idx_i, idx_inst_year, idx_inst_course
//   institute_fees / institute_seat_matrix: idx_i, idx_ic
// =============================================================================
const db    = require('../config/db');
const cache = require('../config/cache');

const PAGE_DEFAULT = 30;
const PAGE_MAX      = 100;
const TTL_LIST   = 10 * 60_000;        // 10m — directory list / autocomplete
const TTL_DETAIL =  60 * 60_000;       // 1h  — single college detail payload

async function q(sql, params = []) {
  const [rows] = await db.query(sql, params);
  return rows;
}

async function vKey(base) {
  const v = await cache.getImportVersion();
  return `v${v}:collegeinfo:${base}`;
}

function paginate(page, pageSize) {
  const ps = Math.min(Math.max(1, parseInt(pageSize) || PAGE_DEFAULT), PAGE_MAX);
  const pg = Math.max(1, parseInt(page) || 1);
  return { ps, pg, offset: (pg - 1) * ps };
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: getStates() / getCollegeTypes() / getCounselingTypes() were removed
// from here — they returned a single global, unscoped list no matter what
// was selected upstream, which is why the College Directory filters never
// actually narrowed down. The frontend (CollegeInfoPage.jsx) now gets these
// lookups — correctly scoped to Counselling Type / State — from
// cutoffService.js instead (getStates, getInstituteTypes, getCounselingTypes
// there, exposed via /api/filters/* — the same endpoints CutoffPage.jsx
// already used correctly).
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// 3. INSTITUTES LIST (directory) — paginated, filtered, server-side
// ─────────────────────────────────────────────────────────────────────────────
async function getInstitutesList({ stateId, collegeTypeId, courseId, counselingTypeId, search, page, pageSize }) {
  const { ps, pg, offset } = paginate(page, pageSize);
  const key = await vKey(`list:${stateId||'x'}:${collegeTypeId||'x'}:${courseId||'x'}:${counselingTypeId||'x'}:${(search||'').toLowerCase()}:${pg}:${ps}`);
  const hit = await cache.get(key);
  if (hit) return hit;

  const conds = [], params = [];
  if (stateId)       { conds.push('i.state_id = ?');        params.push(stateId); }
  // FIX: match EITHER institutes.college_type_id OR cutoffs.institute_type_id
  // (same institute_types table) — see getCollegeTypes() above for why a
  // single-column check silently dropped colleges out of every type filter.
  // Uses a plain (non-correlated) UNION subquery + IN — TiDB choked on the
  // earlier `OR EXISTS(...)` version with a 500 error.
  if (collegeTypeId) {
    conds.push(`i.id IN (
      SELECT id FROM institutes WHERE college_type_id = ?
      UNION
      SELECT institute_id FROM cutoffs WHERE institute_type_id = ?
    )`);
    params.push(collegeTypeId, collegeTypeId);
  }
  if (courseId) {
    conds.push('EXISTS (SELECT 1 FROM cutoffs cc WHERE cc.institute_id = i.id AND cc.course_id = ?)');
    params.push(courseId);
  }
  if (counselingTypeId) {
    conds.push('EXISTS (SELECT 1 FROM cutoffs cc2 WHERE cc2.institute_id = i.id AND cc2.counseling_type_id = ?)');
    params.push(counselingTypeId);
  }
  if (search && search.trim()) {
    // FULLTEXT index (ftx_name) — never LIKE '%...%' table scan at this scale.
    conds.push('MATCH(i.name) AGAINST (? IN BOOLEAN MODE)');
    params.push(`${search.trim().replace(/[+\-<>()~*"@]/g, ' ')}*`);
  }
  const WHERE = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

  // CHANGED: was Promise.all([COUNT query, SELECT query]) — both ran the
  // full WHERE clause independently, meaning the EXISTS/UNION subqueries
  // above got evaluated twice per request on a cache miss. COUNT(*)
  // OVER() folds the count into the same query/execution plan as the
  // page of rows, so the WHERE conditions are evaluated once.
  // Edge case: if the requested page is past the last row (e.g. stale
  // pagination after filters change), 0 rows come back and OVER() can't
  // tell us the true total — fall back to a real COUNT only in that case.
  let rows = await q(
    `SELECT i.id, i.name, i.slug, s.name AS state,
            COALESCE(it.name, fb.name) AS college_type,
            COUNT(*) OVER() AS total_n
     FROM institutes i
     LEFT JOIN states s          ON s.id = i.state_id
     LEFT JOIN institute_types it ON it.id = i.college_type_id
     LEFT JOIN (
       SELECT cc3.institute_id, MIN(cc3.institute_type_id) AS type_id
       FROM cutoffs cc3
       WHERE cc3.institute_type_id IS NOT NULL
       GROUP BY cc3.institute_id
     ) fbid ON fbid.institute_id = i.id
     LEFT JOIN institute_types fb ON fb.id = fbid.type_id
     ${WHERE}
     ORDER BY i.name ASC
     LIMIT ? OFFSET ?`,
    [...params, ps, offset]
  );

  let totalItems = rows[0]?.total_n || 0;
  if (rows.length === 0 && offset > 0) {
    // Only hit when the page itself is empty (e.g. filters changed and
    // the client is still on an old page number) — rare, so a second
    // query here is cheap relative to always paying for it up front.
    const countRows = await q(`SELECT COUNT(*) AS n FROM institutes i ${WHERE}`, params);
    totalItems = countRows[0]?.n || 0;
  }
  const totalPages  = Math.max(1, Math.ceil(totalItems / ps));

  // courses-offered chips — one batched query for the whole page (not N+1)
  let coursesByInstitute = {};
  if (rows.length) {
    const ids = rows.map(r => r.id);
    const placeholders = ids.map(() => '?').join(',');
    const courseRows = await q(
      `SELECT DISTINCT c.institute_id, crs.name
       FROM cutoffs c JOIN courses crs ON crs.id = c.course_id
       WHERE c.institute_id IN (${placeholders})`,
      ids
    );
    courseRows.forEach(r => {
      (coursesByInstitute[r.institute_id] ||= []).push(r.name);
    });
  }

  const data = rows.map(r => ({
    id: r.id, name: r.name, slug: r.slug,
    state: r.state || null, college_type: r.college_type || null,
    courses: coursesByInstitute[r.id] || [],
  }));

  const result = { data, totalItems, totalPages, page: pg, pageSize: ps };
  await cache.set(key, result, TTL_LIST);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. AUTOCOMPLETE — lightweight, FULLTEXT-backed, LIMIT 10
// ─────────────────────────────────────────────────────────────────────────────
async function autocomplete(query) {
  if (!query || query.trim().length < 2) return [];
  const term = query.trim().replace(/[+\-<>()~*"@]/g, ' ');
  const rows = await q(
    `SELECT i.name, i.slug, s.name AS state
     FROM institutes i
     LEFT JOIN states s ON s.id = i.state_id
     WHERE MATCH(i.name) AGAINST (? IN BOOLEAN MODE)
     ORDER BY i.name ASC
     LIMIT 10`,
    [`${term}*`]
  );
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. COLLEGE DETAIL — full payload by slug, batched/parallel queries
// ─────────────────────────────────────────────────────────────────────────────
async function getCollegeDetail(slug) {
  if (!slug) return null;
  const key = await vKey(`detail:${slug}`);
  const hit = await cache.get(key);
  if (hit) return hit;

  const instRows = await q(
    `SELECT i.id, i.name, i.slug, i.address, i.website, i.affiliated_university,
            i.college_type_id,
            COALESCE(it.name, fb.name) AS college_type,
            i.state_id, s.name AS state
     FROM institutes i
     LEFT JOIN institute_types it ON it.id = i.college_type_id
     LEFT JOIN (
       SELECT cc3.institute_id, MIN(cc3.institute_type_id) AS type_id
       FROM cutoffs cc3
       WHERE cc3.institute_type_id IS NOT NULL
       GROUP BY cc3.institute_id
     ) fbid ON fbid.institute_id = i.id
     LEFT JOIN institute_types fb ON fb.id = fbid.type_id
     LEFT JOIN states s ON s.id = i.state_id
     WHERE i.slug = ? LIMIT 1`,
    [slug]
  );
  if (!instRows.length) return null;
  const inst = instRows[0];
  const instituteId = inst.id;

  const [courseRows, cutoffRows, feeRows, seatRows, admissionRows, ctRows] = await Promise.all([
    q(`SELECT DISTINCT crs.id, crs.name
       FROM cutoffs c JOIN courses crs ON crs.id = c.course_id
       WHERE c.institute_id = ? ORDER BY crs.name`, [instituteId]),

    q(`SELECT c.year, r.name AS round, cat.name AS category, q.name AS quota,
              crs.name AS course, ct.name AS counseling_type,
              c.opening_rank, c.closing_rank
       FROM cutoffs c
       JOIN rounds r       ON r.id = c.round_id
       JOIN categories cat ON cat.id = c.category_id
       JOIN courses crs    ON crs.id = c.course_id
       JOIN counseling_types ct ON ct.id = c.counseling_type_id
       LEFT JOIN quotas q  ON q.id = c.quota_id
       WHERE c.institute_id = ?
       ORDER BY c.year DESC, r.name ASC
       LIMIT 2000`, [instituteId]),

    q(`SELECT crs.name AS course, f.year, f.annual_fee, f.admission_fee,
              f.annual_hostel_fee, f.hostel_type,
              f.bond_years, f.bond_condition,
              f.bond_reimbursement_amount, f.bond_reimbursement_days
       FROM institute_fees f
       LEFT JOIN courses crs ON crs.id = f.course_id
       WHERE f.institute_id = ?
       ORDER BY f.year DESC`, [instituteId]),

    q(`SELECT crs.name AS course, sm.year, sm.seat_total_intake,
              sm.seat_state_quota_seats, sm.seat_aiq_seats, sm.seat_college_type
       FROM institute_seat_matrix sm
       LEFT JOIN courses crs ON crs.id = sm.course_id
       WHERE sm.institute_id = ?
       ORDER BY sm.year DESC`, [instituteId]),

    // institution_admission_info — admin-authored, optional. Table is created
    // defensively here (IF NOT EXISTS) since it isn't part of the uploader.
    // Returns null gracefully if no row exists yet — see admin endpoint below.
    q(`SELECT content FROM institute_admission_info WHERE institute_id = ? LIMIT 1`, [instituteId])
      .catch(() => []),

    q(`SELECT DISTINCT ct.name
       FROM cutoffs c JOIN counseling_types ct ON ct.id = c.counseling_type_id
       WHERE c.institute_id = ?`, [instituteId]),
  ]);

  const bond = feeRows
    .filter(f => f.bond_years != null || f.bond_condition)
    .map(f => ({
      course: f.course, bond_years: f.bond_years, bond_condition: f.bond_condition,
      bond_reimbursement_amount: f.bond_reimbursement_amount,
      bond_reimbursement_days: f.bond_reimbursement_days,
    }));

  const result = {
    institute: {
      id: inst.id, name: inst.name, slug: inst.slug,
      state: inst.state || null, address: inst.address || null,
      website: inst.website || null,
      affiliated_university: inst.affiliated_university || null,
      college_type: inst.college_type || null,
    },
    courses: courseRows,
    counselingTypes: ctRows.map(r => r.name),
    cutoffs: cutoffRows,
    fees: feeRows.map(({ bond_years, bond_condition, bond_reimbursement_amount, bond_reimbursement_days, ...rest }) => rest),
    seatMatrix: seatRows,
    bond,
    admissionInfo: admissionRows.length ? admissionRows[0].content : null,
  };

  await cache.set(key, result, TTL_DETAIL);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. ALL SLUGS — for sitemap generation
// ─────────────────────────────────────────────────────────────────────────────
async function getAllSlugs() {
  const key = await vKey('all_slugs');
  const hit = await cache.get(key);
  if (hit) return hit;
  const rows = await q(`SELECT slug, updated_at FROM institutes WHERE slug IS NOT NULL`);
  await cache.set(key, rows, TTL_LIST);
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. ADMIN — write admission info (TODO: no admin UI yet, read path only is
//    required by spec; this write path reuses the same x-import-secret
//    pattern as the existing admin endpoints for when an admin UI lands)
// ─────────────────────────────────────────────────────────────────────────────
async function ensureAdmissionInfoTable() {
  await db.query(`CREATE TABLE IF NOT EXISTS institute_admission_info (
    institute_id INT PRIMARY KEY,
    content TEXT,
    updated_at DATETIME
  )`);
}

async function setAdmissionInfo(instituteId, content) {
  await ensureAdmissionInfoTable();
  await db.query(
    `INSERT INTO institute_admission_info (institute_id, content, updated_at)
     VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = VALUES(updated_at)`,
    [instituteId, content]
  );
  await cache.bumpImportVersion(); // simplest correct invalidation — reuses existing mechanism
}

// CHANGED: was also fired fire-and-forget at module load (i.e. on every
// server boot, on every horizontally-scaled instance) — harmless since
// it's idempotent, but unnecessary DDL traffic against TiDB on every
// deploy/restart for a table that's only ever written to via the admin
// endpoint below. setAdmissionInfo() already calls ensureAdmissionInfoTable()
// itself before every write, which is enough — the read path
// (getCollegeDetail) already tolerates the table being absent.

module.exports = {
  getInstitutesList, autocomplete,
  getCollegeDetail, getAllSlugs, ensureAdmissionInfoTable, setAdmissionInfo,
};