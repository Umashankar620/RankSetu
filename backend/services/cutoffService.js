// =============================================================================
// services/cutoffService.js  —  Production, 20L+ rows, facets-based filtering
// =============================================================================
const db    = require('../config/db');
const cache = require('../config/cache');

const PAGE_DEFAULT = 25;
const PAGE_MAX     = 100;
const TTL_LONG  = 24 * 60 * 60_000;  // 24h — lookup / facet data
const TTL_MED   = 10 * 60_000;        // 10m — filter blobs
const TTL_SHORT =  5 * 60_000;        // 5m  — search / eligibility

// ── helpers ──────────────────────────────────────────────────────────────────
function paginate(page, pageSize) {
  const ps = Math.min(Math.max(1, parseInt(pageSize) || PAGE_DEFAULT), PAGE_MAX);
  const pg = Math.max(1, parseInt(page) || 1);
  return { ps, pg, offset: (pg - 1) * ps };
}

async function vKey(base) {
  const v = await cache.getImportVersion();
  return `v${v}:${base}`;
}

async function q(sql, params = []) {
  const [rows] = await db.query(sql, params);
  return rows;
}

// Process-local name→id cache (avoids repeated single-row lookups)
const _idMap = new Map();
async function nameToId(table, name) {
  if (!name || name === '' || name === 'ALL') return null;
  const k = `${table}:${name.toLowerCase()}`;
  if (_idMap.has(k)) return _idMap.get(k);
  const rows = await q(`SELECT id FROM \`${table}\` WHERE LOWER(name)=LOWER(?) LIMIT 1`, [name]);
  const id   = rows.length ? rows[0].id : null;
  _idMap.set(k, id);
  return id;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. COUNSELING TYPES
// ─────────────────────────────────────────────────────────────────────────────
async function getCounselingTypes() {
  const key = await vKey('ct_list');
  const hit = await cache.get(key);
  if (hit) return hit;
  const rows = await q(`SELECT id, name FROM counseling_types ORDER BY name`);
  await cache.set(key, rows, TTL_LONG);
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. AUTHORITIES — scoped to counseling_type
// ─────────────────────────────────────────────────────────────────────────────
async function getAuthorities(counselingTypeId, stateId) {
  const key = await vKey(`auth:${counselingTypeId||'ALL'}:${stateId||'x'}`);
  const hit = await cache.get(key);
  if (hit) return hit;

  const conds = [], params = [];
  if (counselingTypeId) { conds.push('c.counseling_type_id = ?'); params.push(counselingTypeId); }
  if (stateId)          { conds.push('c.state_id = ?');           params.push(stateId); }
  const WHERE = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const rows   = await q(
    `SELECT DISTINCT a.id, a.name
     FROM cutoffs c
     JOIN authorities a ON a.id = c.authority_id
     ${WHERE}
     ORDER BY a.name`,
    params
  );
  await cache.set(key, rows, TTL_LONG);
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. STATES — scoped to counseling_type + authority
// ─────────────────────────────────────────────────────────────────────────────
async function getStates(counselingTypeId) {
  const key = await vKey(`states:${counselingTypeId||'ALL'}`);
  const hit = await cache.get(key);
  if (hit) return hit;

  const WHERE  = counselingTypeId ? 'WHERE c.counseling_type_id = ?' : '';
  const params = counselingTypeId ? [counselingTypeId] : [];

  const rows = await q(
    `SELECT DISTINCT s.id, s.name
     FROM cutoffs c
     JOIN states s ON s.id = c.state_id
     ${WHERE}
     ORDER BY s.name`,
    params
  );
  await cache.set(key, rows, TTL_LONG);
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. YEARS — scoped to counseling_type + authority
// ─────────────────────────────────────────────────────────────────────────────
async function getYears(counselingTypeId, authorityId, stateId, instituteTypeId) {
  const key = await vKey(`years:${counselingTypeId||'ALL'}:${authorityId||'ALL'}:${stateId||'x'}:${instituteTypeId||'x'}`);
  const hit = await cache.get(key);
  if (hit) return hit;

  const conds = [], params = [];
  if (counselingTypeId) { conds.push('counseling_type_id = ?');  params.push(counselingTypeId); }
  if (authorityId)      { conds.push('authority_id = ?');        params.push(authorityId); }
  if (stateId)          { conds.push('state_id = ?');            params.push(stateId); }
  if (instituteTypeId)  { conds.push('institute_type_id = ?');   params.push(instituteTypeId); }
  const WHERE = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

  const rows = await q(`SELECT DISTINCT year FROM cutoffs ${WHERE} ORDER BY year DESC`, params);
  const data = rows.map(r => r.year);
  await cache.set(key, data, TTL_LONG);
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ROUNDS — scoped to counseling_type + authority
// ─────────────────────────────────────────────────────────────────────────────
async function getRounds(counselingTypeId, authorityId, stateId, instituteTypeId) {
  const key = await vKey(`rounds:${counselingTypeId||'ALL'}:${authorityId||'ALL'}:${stateId||'x'}:${instituteTypeId||'x'}`);
  const hit = await cache.get(key);
  if (hit) return hit;

  const conds = [], params = [];
  if (counselingTypeId) { conds.push('c.counseling_type_id = ?'); params.push(counselingTypeId); }
  if (authorityId)      { conds.push('c.authority_id = ?');       params.push(authorityId); }
  if (stateId)          { conds.push('c.state_id = ?');           params.push(stateId); }
  if (instituteTypeId)  { conds.push('c.institute_type_id = ?');  params.push(instituteTypeId); }
  const WHERE = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

  const rows = await q(
    `SELECT DISTINCT r.id, r.name
     FROM cutoffs c JOIN rounds r ON r.id = c.round_id
     ${WHERE} ORDER BY r.name`,
    params
  );
  await cache.set(key, rows, TTL_LONG);
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. COURSES — from cutoffs, scoped to ct + authority
//    NOTE: facets table stores COALESCE(state_id,0) which breaks joins
//    when state_id is NULL in cutoffs. We query cutoffs directly instead.
// ─────────────────────────────────────────────────────────────────────────────
async function getCourses(counselingTypeId, authorityId, stateId, instituteTypeId) {
  const key = await vKey(`courses:${counselingTypeId||'ALL'}:${authorityId||'ALL'}:${stateId||'x'}:${instituteTypeId||'x'}`);
  const hit = await cache.get(key);
  if (hit) return hit;

  const conds = [], params = [];
  if (counselingTypeId) { conds.push('c.counseling_type_id = ?'); params.push(counselingTypeId); }
  if (authorityId)      { conds.push('c.authority_id = ?');       params.push(authorityId); }
  if (stateId)          { conds.push('c.state_id = ?');           params.push(stateId); }
  if (instituteTypeId)  { conds.push('c.institute_type_id = ?');  params.push(instituteTypeId); }
  const WHERE = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

  const rows = await q(
    `SELECT DISTINCT crs.id, crs.name
     FROM cutoffs c
     JOIN courses crs ON crs.id = c.course_id
     ${WHERE}
     ORDER BY crs.name`,
    params
  );
  await cache.set(key, rows, TTL_LONG);
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. QUOTAS — scoped to ct + authority + course
// ─────────────────────────────────────────────────────────────────────────────
async function getQuotas(counselingTypeId, authorityId, courseId, stateId, instituteTypeId) {
  const key = await vKey(`quotas:${counselingTypeId||'ALL'}:${authorityId||'x'}:${courseId||'x'}:${stateId||'x'}:${instituteTypeId||'x'}`);
  const hit = await cache.get(key);
  if (hit) return hit;

  const conds = [], params = [];
  if (counselingTypeId) { conds.push('c.counseling_type_id = ?'); params.push(counselingTypeId); }
  if (authorityId)      { conds.push('c.authority_id = ?');       params.push(authorityId); }
  if (courseId)         { conds.push('c.course_id = ?');          params.push(courseId); }
  if (stateId)          { conds.push('c.state_id = ?');           params.push(stateId); }
  if (instituteTypeId)  { conds.push('c.institute_type_id = ?');  params.push(instituteTypeId); }
  const WHERE = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

  const rows = await q(
    `SELECT DISTINCT qt.id, qt.name
     FROM cutoffs c
     JOIN quotas qt ON qt.id = c.quota_id
     ${WHERE}
     ORDER BY qt.name`,
    params
  );
  await cache.set(key, rows, TTL_LONG);
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. CATEGORIES — scoped to ct + authority
// ─────────────────────────────────────────────────────────────────────────────
async function getCategories(counselingTypeId, authorityId, stateId, instituteTypeId) {
  const key = await vKey(`cats:${counselingTypeId||'ALL'}:${authorityId||'ALL'}:${stateId||'x'}:${instituteTypeId||'x'}`);
  const hit = await cache.get(key);
  if (hit) return hit;

  const conds = [], params = [];
  if (counselingTypeId) { conds.push('c.counseling_type_id = ?'); params.push(counselingTypeId); }
  if (authorityId)      { conds.push('c.authority_id = ?');       params.push(authorityId); }
  if (stateId)          { conds.push('c.state_id = ?');           params.push(stateId); }
  if (instituteTypeId)  { conds.push('c.institute_type_id = ?');  params.push(instituteTypeId); }
  const WHERE = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

  const rows = await q(
    `SELECT DISTINCT cat.id, cat.name
     FROM cutoffs c JOIN categories cat ON cat.id = c.category_id
     ${WHERE} ORDER BY cat.name`,
    params
  );
  await cache.set(key, rows, TTL_LONG);
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8b. INSTITUTE TYPES — scoped to ct + authority + state
//     (only some datasets populate institute_type_id, e.g. UP files; MCC/AYUSH
//     leave it NULL, so this naturally returns empty for those and the
//     frontend hides the pill row entirely — exactly the "real DB data" rule.)
// ─────────────────────────────────────────────────────────────────────────────
async function getInstituteTypes(counselingTypeId, authorityId, stateId) {
  const key = await vKey(`itypes:${counselingTypeId||'ALL'}:${authorityId||'x'}:${stateId||'x'}`);
  const hit = await cache.get(key);
  if (hit) return hit;

  const conds = ['c.institute_type_id IS NOT NULL'], params = [];
  if (counselingTypeId) { conds.push('c.counseling_type_id = ?'); params.push(counselingTypeId); }
  if (authorityId)      { conds.push('c.authority_id = ?');       params.push(authorityId); }
  if (stateId)          { conds.push('c.state_id = ?');           params.push(stateId); }
  const WHERE = `WHERE ${conds.join(' AND ')}`;

  const rows = await q(
    `SELECT DISTINCT it.id, it.name
     FROM cutoffs c JOIN institute_types it ON it.id = c.institute_type_id
     ${WHERE} ORDER BY it.name`,
    params
  );
  await cache.set(key, rows, TTL_LONG);
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. COLLEGES — filtered by ct + authority + course + quota, NO category/round
// ─────────────────────────────────────────────────────────────────────────────
async function getColleges({ counselingTypeId, authorityId, courseId, quotaId, stateId, instituteTypeId, search, page, pageSize }) {
  const { ps, pg, offset } = paginate(page, pageSize || 50);
  const safeSearch = (search||'').trim();

  const key = await vKey(`colleges:${counselingTypeId||'x'}:${authorityId||'x'}:${courseId||'x'}:${quotaId||'x'}:${stateId||'x'}:${instituteTypeId||'x'}:${pg}:${safeSearch}`);
  const hit = await cache.get(key);
  if (hit) return hit;

  const conds = [], params = [];
  if (counselingTypeId) { conds.push('co.counseling_type_id = ?'); params.push(counselingTypeId); }
  if (authorityId)      { conds.push('co.authority_id = ?');       params.push(authorityId); }
  if (courseId)         { conds.push('co.course_id = ?');          params.push(courseId); }
  if (quotaId)          { conds.push('co.quota_id = ?');           params.push(quotaId); }
  if (stateId)          { conds.push('co.state_id = ?');           params.push(stateId); }
  if (instituteTypeId)  { conds.push('co.institute_type_id = ?');  params.push(instituteTypeId); }

  const nameClause = safeSearch.length >= 2 ? ' AND i.name LIKE ?' : '';
  if (nameClause) params.push(`%${safeSearch}%`);

  const WHERE = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

  const [colleges, countRows] = await Promise.all([
    q(
      `SELECT DISTINCT i.id, i.name
       FROM cutoffs co
       JOIN institutes i ON i.id = co.institute_id
       ${WHERE}${nameClause}
       ORDER BY i.name
       LIMIT ? OFFSET ?`,
      [...params, ps, offset]
    ),
    q(
      `SELECT COUNT(DISTINCT co.institute_id) AS total
       FROM cutoffs co
       JOIN institutes i ON i.id = co.institute_id
       ${WHERE}${nameClause}`,
      params
    ),
  ]);

  const total  = Number(countRows[0]?.total || 0);
  const result = {
    data: colleges, totalItems: total,
    totalPages: Math.ceil(total / ps), currentPage: pg,
    pageSize: ps, hasNext: pg * ps < total, hasPrevious: pg > 1,
  };
  await cache.set(key, result, TTL_MED);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. COLLEGE CUTOFFS — category × round matrix for one college
// ─────────────────────────────────────────────────────────────────────────────
async function getCollegeCutoffs({ instituteId, counselingTypeId, authorityId, courseId, quotaId, stateId, instituteTypeId }) {
  const key = await vKey(`cc:${instituteId}:${counselingTypeId||'x'}:${authorityId||'x'}:${courseId||'x'}:${quotaId||'x'}:${stateId||'x'}:${instituteTypeId||'x'}`);
  const hit = await cache.get(key);
  if (hit) return hit;

  const conds = ['co.institute_id = ?'], params = [instituteId];
  if (counselingTypeId) { conds.push('co.counseling_type_id = ?'); params.push(counselingTypeId); }
  if (authorityId)      { conds.push('co.authority_id = ?');       params.push(authorityId); }
  if (courseId)         { conds.push('co.course_id = ?');          params.push(courseId); }
  if (quotaId)          { conds.push('co.quota_id = ?');           params.push(quotaId); }
  if (stateId)          { conds.push('co.state_id = ?');           params.push(stateId); }
  if (instituteTypeId)  { conds.push('co.institute_type_id = ?');  params.push(instituteTypeId); }

  const rows = await q(
    `SELECT cat.name AS category, r.name AS round, co.year,
            co.opening_rank AS openRank, co.closing_rank AS closeRank,
            co.score, co.fees, co.bond_years AS bondYears, g.name AS gender
     FROM cutoffs co
     JOIN categories cat ON cat.id = co.category_id
     JOIN rounds     r   ON r.id   = co.round_id
     LEFT JOIN genders g ON g.id   = co.gender_id
     WHERE ${conds.join(' AND ')}
     ORDER BY co.year DESC, r.id ASC, cat.id ASC`,
    params
  );
  await cache.set(key, rows, TTL_MED);
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. ELIGIBILITY — core product feature
// ─────────────────────────────────────────────────────────────────────────────
async function getEligibility({ counselingTypeId, authorityId, categoryId, courseId, roundId, stateId, instituteTypeId, rank, page, pageSize }) {
  if (!categoryId) throw new Error('category_id is required');
  if (!rank || isNaN(Number(rank))) throw new Error('rank is required');

  const { ps, pg, offset } = paginate(page, pageSize || 50);

  let effectiveRoundId = roundId;
  if (!effectiveRoundId && counselingTypeId) {
    const rndRows = await q(
      `SELECT round_id FROM cutoffs WHERE counseling_type_id = ?
       ORDER BY year DESC, round_id DESC LIMIT 1`,
      [counselingTypeId]
    );
    effectiveRoundId = rndRows.length ? rndRows[0].round_id : null;
  }

  const key = await vKey(`elig:${counselingTypeId||'x'}:${authorityId||'x'}:${categoryId}:${courseId||'x'}:${effectiveRoundId||'x'}:${stateId||'x'}:${instituteTypeId||'x'}:${rank}:${pg}`);
  const hit = await cache.get(key);
  if (hit) return hit;

  const conds = ['co.category_id = ?', 'co.closing_rank >= ?'];
  const params = [categoryId, Number(rank)];
  if (counselingTypeId) { conds.push('co.counseling_type_id = ?'); params.push(counselingTypeId); }
  if (authorityId)      { conds.push('co.authority_id = ?');       params.push(authorityId); }
  if (courseId)         { conds.push('co.course_id = ?');          params.push(courseId); }
  if (effectiveRoundId) { conds.push('co.round_id = ?');           params.push(effectiveRoundId); }
  if (stateId)          { conds.push('co.state_id = ?');           params.push(stateId); }
  if (instituteTypeId)  { conds.push('co.institute_type_id = ?');  params.push(instituteTypeId); }

  const WHERE = `WHERE ${conds.join(' AND ')}`;
  const [rows, countRows] = await Promise.all([
    q(`SELECT i.id AS instituteId, i.name AS institute, crs.name AS course,
              qt.name AS quota, ct.name AS counselingType,
              co.closing_rank AS closeRank, co.opening_rank AS openRank,
              co.year, co.fees, co.bond_years AS bondYears
       FROM cutoffs co
       JOIN institutes i ON i.id = co.institute_id
       JOIN courses crs ON crs.id = co.course_id
       JOIN quotas qt ON qt.id = co.quota_id
       JOIN counseling_types ct ON ct.id = co.counseling_type_id
       ${WHERE} ORDER BY co.closing_rank ASC LIMIT ? OFFSET ?`,
      [...params, ps, offset]),
    q(`SELECT COUNT(*) AS total FROM cutoffs co ${WHERE}`, params),
  ]);

  const total  = Number(countRows[0]?.total || 0);
  const result = {
    data: rows, totalItems: total,
    totalPages: Math.ceil(total / ps), currentPage: pg,
    pageSize: ps, hasNext: pg * ps < total, hasPrevious: pg > 1,
    usedRoundId: effectiveRoundId,
  };
  await cache.set(key, result, TTL_SHORT);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. getCutoffs — POST /api/cutoffs — table search
// ─────────────────────────────────────────────────────────────────────────────
async function getCutoffs(filters) {
  const { ps, pg, offset } = paginate(filters.page, filters.pageSize);

  const [ctId, stId, authId, qId, catId, genId, rndId, crsId, itId] = await Promise.all([
    nameToId('counseling_types', filters.counselingType),
    nameToId('states',           filters.state),
    nameToId('authorities',      filters.authority),
    nameToId('quotas',           filters.quota),
    nameToId('categories',       filters.category),
    nameToId('genders',          filters.gender),
    nameToId('rounds',           filters.round),
    nameToId('courses',          filters.program),
    nameToId('institute_types',  filters.instituteType),
  ]);

  const conds = [], params = [];
  if (ctId)   { conds.push('c.counseling_type_id = ?'); params.push(ctId); }
  if (stId)   { conds.push('c.state_id = ?');           params.push(stId); }
  if (authId) { conds.push('c.authority_id = ?');       params.push(authId); }
  if (qId)    { conds.push('c.quota_id = ?');           params.push(qId); }
  if (catId)  { conds.push('c.category_id = ?');        params.push(catId); }
  if (genId)  { conds.push('c.gender_id = ?');          params.push(genId); }
  if (rndId)  { conds.push('c.round_id = ?');           params.push(rndId); }
  if (crsId)  { conds.push('c.course_id = ?');          params.push(crsId); }
  if (itId)   { conds.push('c.institute_type_id = ?');  params.push(itId); }

  if (filters.year) { const y = parseInt(filters.year); if (!isNaN(y)) { conds.push('c.year = ?'); params.push(y); } }

  if (filters.institute) {
    const iRows = await q('SELECT id FROM institutes WHERE LOWER(name)=LOWER(?) LIMIT 1', [filters.institute]);
    if (iRows.length) { conds.push('c.institute_id = ?'); params.push(iRows[0].id); }
  }

  const addNum = (col, val) => { if (val !== undefined && val !== '' && !isNaN(+val)) { conds.push(col); params.push(+val); } };
  addNum('c.closing_rank >= ?', filters.minRank);
  addNum('c.closing_rank <= ?', filters.maxRank);
  addNum('c.fees >= ?',         filters.minFees);
  addNum('c.fees <= ?',         filters.maxFees);
  addNum('c.bond_years = ?',    filters.bondYears);
  addNum('c.score >= ?',        filters.minScore);
  addNum('c.score <= ?',        filters.maxScore);

  const WHERE = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

  const [rows, countRows] = await Promise.all([
    q(`SELECT c.id, c.year,
              r.name AS round, q.name AS quota, cat.name AS category, gen.name AS gender,
              ct.name AS counselingType, st.name AS state, auth.name AS authority,
              i.name AS institute, crs.name AS program, it.name AS instituteType,
              c.opening_rank AS openRank, c.closing_rank AS closeRank,
              c.fees, c.bond_years AS bondYears, c.score
       FROM cutoffs c
       JOIN institutes i ON i.id = c.institute_id
       JOIN counseling_types ct ON ct.id = c.counseling_type_id
       LEFT JOIN states st ON st.id = c.state_id
       LEFT JOIN authorities auth ON auth.id = c.authority_id
       LEFT JOIN courses crs ON crs.id = c.course_id
       LEFT JOIN quotas q ON q.id = c.quota_id
       LEFT JOIN categories cat ON cat.id = c.category_id
       LEFT JOIN genders gen ON gen.id = c.gender_id
       LEFT JOIN rounds r ON r.id = c.round_id
       LEFT JOIN institute_types it ON it.id = c.institute_type_id
       ${WHERE} ORDER BY c.closing_rank ASC LIMIT ? OFFSET ?`,
      [...params, ps, offset]),
    q(`SELECT COUNT(*) AS total FROM cutoffs c ${WHERE}`, params),
  ]);

  const total = Number(countRows[0]?.total || 0);
  return {
    data: rows, totalItems: total,
    totalPages: Math.ceil(total / ps), currentPage: pg,
    pageSize: ps, hasNext: pg * ps < total, hasPrevious: pg > 1,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Explicit filter-applicability overrides per counselling type.
// The raw DB "IS NOT NULL" checks below are a blunt instrument — a single
// placeholder/empty value in a column is enough to make a filter appear even
// when it's meaningless for that counselling type (e.g. State quota data has
// no gender-wise or score-wise cutoffs). List the types here that should
// force a filter OFF regardless of what the raw query finds. Leave a type
// out of this map entirely to keep the DB-driven auto-detection behaviour.
const FILTER_META_OVERRIDES = {
  STATE: { hasGender: false, hasScore: false },
};

// 13. getFilterOptions — GET /api/filters (legacy full blob)
// ─────────────────────────────────────────────────────────────────────────────
async function getFilterOptions(counselingTypeName) {
  const key = await vKey(`filters:${counselingTypeName || 'ALL'}`);
  const hit = await cache.get(key);
  if (hit) return hit;

  let ctId = null;
  if (counselingTypeName && counselingTypeName !== 'ALL' && counselingTypeName !== '') {
    const rows = await q('SELECT id FROM counseling_types WHERE name = ? LIMIT 1', [counselingTypeName]);
    if (rows.length) ctId = rows[0].id;
  }
  const ctWhere = ctId ? 'WHERE c.counseling_type_id = ?' : '';
  const ctParam = ctId ? [ctId] : [];
  const andOr   = ctId ? 'AND' : 'WHERE';

  const [years, rounds, categories, quotas, programs, states, authorities, genders,
    instituteTypes, counselingTypes, hasFeesMeta, hasBondMeta, hasScoreMeta,
    hasGenderMeta, hasStateMeta, hasTypeMeta] = await Promise.all([
    q(`SELECT DISTINCT c.year FROM cutoffs c ${ctWhere} ORDER BY c.year DESC`, ctParam),
    q(`SELECT DISTINCT r.name FROM cutoffs c JOIN rounds r ON r.id=c.round_id ${ctWhere} ORDER BY r.name`, ctParam),
    q(`SELECT DISTINCT cat.name FROM cutoffs c JOIN categories cat ON cat.id=c.category_id ${ctWhere} ORDER BY cat.name`, ctParam),
    q(`SELECT DISTINCT qt.name FROM cutoffs c JOIN quotas qt ON qt.id=c.quota_id ${ctWhere} ORDER BY qt.name`, ctParam),
    q(`SELECT DISTINCT crs.name FROM cutoffs c JOIN courses crs ON crs.id=c.course_id ${ctWhere} ORDER BY crs.name`, ctParam),
    q(`SELECT DISTINCT s.name FROM cutoffs c JOIN states s ON s.id=c.state_id ${ctWhere} ORDER BY s.name`, ctParam),
    q(`SELECT DISTINCT a.name FROM cutoffs c JOIN authorities a ON a.id=c.authority_id ${ctWhere} ORDER BY a.name`, ctParam),
    q(`SELECT DISTINCT g.name FROM cutoffs c JOIN genders g ON g.id=c.gender_id ${ctWhere} ORDER BY g.name`, ctParam),
    q(`SELECT DISTINCT it.name FROM cutoffs c JOIN institute_types it ON it.id=c.institute_type_id ${ctWhere} ORDER BY it.name`, ctParam),
    q(`SELECT id, name FROM counseling_types ORDER BY name`),
    q(`SELECT 1 FROM cutoffs c ${ctWhere ? ctWhere+' AND' : 'WHERE'} c.fees IS NOT NULL LIMIT 1`, ctParam),
    q(`SELECT 1 FROM cutoffs c ${ctWhere ? ctWhere+' AND' : 'WHERE'} c.bond_years IS NOT NULL LIMIT 1`, ctParam),
    q(`SELECT 1 FROM cutoffs c ${ctWhere ? ctWhere+' AND' : 'WHERE'} c.score IS NOT NULL LIMIT 1`, ctParam),
    q(`SELECT 1 FROM cutoffs c JOIN genders g ON g.id=c.gender_id ${ctWhere} LIMIT 1`, ctParam),
    q(`SELECT 1 FROM cutoffs c JOIN states s ON s.id=c.state_id ${ctWhere} LIMIT 1`, ctParam),
    q(`SELECT 1 FROM cutoffs c JOIN institute_types it ON it.id=c.institute_type_id ${ctWhere} LIMIT 1`, ctParam),
  ]);

  const result = {
    years: years.map(r=>r.year), rounds: rounds.map(r=>r.name),
    categories: categories.map(r=>r.name), quotas: quotas.map(r=>r.name),
    programs: programs.map(r=>r.name), states: states.map(r=>r.name),
    authorities: authorities.map(r=>r.name), genders: genders.map(r=>r.name),
    types: instituteTypes.map(r=>r.name), counselingTypes: counselingTypes.map(r=>r.name),
    institutes: [], quotaInstituteMap: {},
    filterMeta: {
      ...{
        hasGender: hasGenderMeta.length>0, hasFees: hasFeesMeta.length>0,
        hasBond: hasBondMeta.length>0, hasScore: hasScoreMeta.length>0,
        hasState: hasStateMeta.length>0, hasInstituteType: hasTypeMeta.length>0,
      },
      ...(Object.entries(FILTER_META_OVERRIDES).find(
        ([key]) => (counselingTypeName||'').toUpperCase().includes(key)
      )?.[1] || {}),
    },
  };
  await cache.set(key, result, TTL_MED);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. searchInstitutes — autocomplete
// ─────────────────────────────────────────────────────────────────────────────
async function searchInstitutes({ query, counselingType, authorityId, courseId, quotaId, stateId, instituteTypeId, limit = 15 }) {
  if (!query || query.trim().length < 2) return [];
  const safeLimit = Math.min(Math.max(1, parseInt(limit) || 15), 50);
  const partial = `%${query.trim()}%`;
  const prefix  = `${query.trim()}%`;

  const conds = ['i.name LIKE ?'], params = [partial];

  if (counselingType && counselingType !== 'ALL') {
    conds.push(`EXISTS(SELECT 1 FROM cutoffs co2 JOIN counseling_types ct2 ON ct2.id=co2.counseling_type_id WHERE co2.institute_id=i.id AND ct2.name=?)`);
    params.push(counselingType);
  }
  if (authorityId) {
    conds.push(`EXISTS(SELECT 1 FROM cutoffs co3 WHERE co3.institute_id=i.id AND co3.authority_id=?)`);
    params.push(authorityId);
  }
  if (courseId) {
    conds.push(`EXISTS(SELECT 1 FROM cutoffs co4 WHERE co4.institute_id=i.id AND co4.course_id=?)`);
    params.push(courseId);
  }
  if (quotaId) {
    conds.push(`EXISTS(SELECT 1 FROM cutoffs co5 WHERE co5.institute_id=i.id AND co5.quota_id=?)`);
    params.push(quotaId);
  }
  if (stateId) {
    conds.push(`EXISTS(SELECT 1 FROM cutoffs co6 WHERE co6.institute_id=i.id AND co6.state_id=?)`);
    params.push(stateId);
  }
  if (instituteTypeId) {
    conds.push(`EXISTS(SELECT 1 FROM cutoffs co7 WHERE co7.institute_id=i.id AND co7.institute_type_id=?)`);
    params.push(instituteTypeId);
  }

  const rows = await q(
    `SELECT DISTINCT i.id, i.name FROM institutes i WHERE ${conds.join(' AND ')}
     ORDER BY CASE WHEN i.name LIKE ? THEN 0 ELSE 1 END, i.name LIMIT ?`,
    [...params, prefix, safeLimit]
  );
  return rows.map(r => ({ id: r.id, name: r.name }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. getInstituteTrends
// ─────────────────────────────────────────────────────────────────────────────
async function getInstituteTrends({ institute, category, counselingType }) {
  if (!institute) throw new Error('institute is required');

  const iRows = await q('SELECT id FROM institutes WHERE LOWER(name)=LOWER(?) LIMIT 1', [institute]);
  if (!iRows.length) return { categories: [], chartData: [], tableRecords: [] };
  const instituteId = iRows[0].id;

  let ctId = null;
  if (counselingType && counselingType !== 'ALL') {
    const ctRows = await q('SELECT id FROM counseling_types WHERE name=? LIMIT 1', [counselingType]);
    if (ctRows.length) ctId = ctRows[0].id;
  }
  const ctCond  = ctId ? 'AND c.counseling_type_id = ?' : '';
  const ctParam = ctId ? [ctId] : [];

  const catRows = await q(
    `SELECT DISTINCT cat.name FROM cutoffs c JOIN categories cat ON cat.id=c.category_id
     WHERE c.institute_id=? ${ctCond} ORDER BY cat.name`,
    [instituteId, ...ctParam]
  );
  const categories     = catRows.map(r => r.name);
  const activeCategory = category || categories[0] || null;

  let chartData = [], tableRecords = [];
  if (activeCategory) {
    const catIdRows = await q('SELECT id FROM categories WHERE name=? LIMIT 1', [activeCategory]);
    if (!catIdRows.length) return { categories, chartData: [], tableRecords: [] };
    const categoryId = catIdRows[0].id;

    const trendRows = await q(
      `SELECT c.year, r.name AS round, MIN(c.closing_rank) AS minCloseRank
       FROM cutoffs c JOIN rounds r ON r.id=c.round_id
       WHERE c.institute_id=? AND c.category_id=? ${ctCond} AND c.closing_rank IS NOT NULL
       GROUP BY c.year, c.round_id ORDER BY c.year ASC, r.name ASC`,
      [instituteId, categoryId, ...ctParam]
    );
    const byYear = {};
    trendRows.forEach(({ year, round, minCloseRank }) => {
      if (!byYear[year]) byYear[year] = { year };
      byYear[year][round] = minCloseRank;
    });
    chartData = Object.values(byYear);

    tableRecords = await q(
      `SELECT c.year, r.name AS round, cat.name AS category, q.name AS quota,
              g.name AS gender, ct.name AS counselingType,
              c.opening_rank AS openRank, c.closing_rank AS closeRank,
              c.fees, c.bond_years AS bondYears
       FROM cutoffs c
       JOIN rounds r ON r.id=c.round_id
       JOIN categories cat ON cat.id=c.category_id
       JOIN counseling_types ct ON ct.id=c.counseling_type_id
       LEFT JOIN quotas q ON q.id=c.quota_id
       LEFT JOIN genders g ON g.id=c.gender_id
       WHERE c.institute_id=? AND c.category_id=? ${ctCond}
       ORDER BY c.year DESC, r.name ASC`,
      [instituteId, categoryId, ...ctParam]
    );
  }
  return { categories, chartData, tableRecords };
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. getUpgradeProbability
// ─────────────────────────────────────────────────────────────────────────────
async function getUpgradeProbability({ institute, category, quota, currentRank, round, counselingType }) {
  if (!institute || !category || !currentRank) throw new Error('institute, category, currentRank required');

  const [iRows, catRows] = await Promise.all([
    q('SELECT id FROM institutes WHERE LOWER(name)=LOWER(?) LIMIT 1', [institute]),
    q('SELECT id FROM categories WHERE LOWER(name)=LOWER(?) LIMIT 1', [category]),
  ]);
  if (!iRows.length || !catRows.length) return { probability: null, historicalData: [], sampleSize: 0 };

  const conds = ['c.institute_id=?','c.category_id=?'];
  const params = [iRows[0].id, catRows[0].id];
  for (const [tbl, val, col] of [['quotas',quota,'quota_id'],['rounds',round,'round_id'],['counseling_types',counselingType,'counseling_type_id']]) {
    if (val && val !== 'ALL') {
      const rows = await q(`SELECT id FROM ${tbl} WHERE name=? LIMIT 1`, [val]);
      if (rows.length) { conds.push(`c.${col}=?`); params.push(rows[0].id); }
    }
  }

  const rows = await q(
    `SELECT c.year, r.name AS round, c.closing_rank AS closeRank, c.opening_rank AS openRank
     FROM cutoffs c JOIN rounds r ON r.id=c.round_id
     WHERE ${conds.join(' AND ')} ORDER BY c.year DESC, r.name ASC`,
    params
  );
  if (!rows.length) return { probability: null, historicalData: [], sampleSize: 0 };
  const rank = parseInt(currentRank);
  const fav  = rows.filter(r => r.closeRank >= rank).length;
  return { probability: Math.round((fav/rows.length)*100), historicalData: rows, sampleSize: rows.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. FACETS REBUILD
// ─────────────────────────────────────────────────────────────────────────────
async function rebuildFacets() {
  console.log('🔄 Rebuilding facets table…');
  await db.query(`CREATE TABLE IF NOT EXISTS facets (
    counseling_type_id INT NOT NULL, state_id INT NOT NULL,
    course_id INT NOT NULL, quota_id INT NOT NULL,
    PRIMARY KEY (counseling_type_id, state_id, course_id, quota_id)
  )`);
  await db.query(`TRUNCATE TABLE facets`);
  await db.query(`INSERT INTO facets (counseling_type_id, state_id, course_id, quota_id)
    SELECT DISTINCT counseling_type_id, COALESCE(state_id,0), COALESCE(course_id,0), COALESCE(quota_id,0)
    FROM cutoffs WHERE counseling_type_id IS NOT NULL`);
  const [cnt] = await db.query('SELECT COUNT(*) AS n FROM facets');
  console.log(`✅ Facets rebuilt: ${cnt[0].n} rows`);
  await cache.bumpImportVersion();
  return cnt[0].n;
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. CACHE INVALIDATE
// ─────────────────────────────────────────────────────────────────────────────
async function invalidateCacheAfterImport(secret) {
  // CHANGED: fail-closed — an unset IMPORT_SECRET used to mean both sides
  // of the comparison were `undefined`, so the check silently passed and
  // anyone could flush the cache. See collegeInfoController.js for the
  // same fix (this backports main.py's already-correct pattern).
  if (!process.env.IMPORT_SECRET) throw Object.assign(new Error('IMPORT_SECRET not configured on this server.'), { statusCode: 503 });
  if (secret !== process.env.IMPORT_SECRET) throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
  const version = await cache.bumpImportVersion();
  return { ok: true, version };
}

module.exports = {
  getCounselingTypes, getAuthorities, getStates, getInstituteTypes, getYears, getRounds,
  getCourses, getQuotas, getCategories, getColleges, getCollegeCutoffs,
  getEligibility, getCutoffs, getFilterOptions, searchInstitutes,
  getInstituteTrends, getUpgradeProbability, rebuildFacets, invalidateCacheAfterImport,
};