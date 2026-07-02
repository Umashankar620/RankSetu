// =============================================================================
// controllers/cutoffController.js  —  Complete, all endpoints, state + authority
// + institute_type aware (so College/Course/Quota/Category/Round/Year lists all
// genuinely narrow down when State or Institute Type pills are selected).
// =============================================================================
const svc = require('../services/cutoffService');

const handle = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (err) {
    // CHANGED: log the full error server-side always, but only send the
    // raw message to the client outside production — err.message can
    // include DB/internal details (query fragments, connection info)
    // that shouldn't be exposed publicly. 4xx messages we throw ourselves
    // (Unauthorized, not configured, etc.) are already safe to show as-is.
    console.error('[ctrl]', err);
    const status = err.statusCode || 500;
    const message = (status === 500 && process.env.NODE_ENV === 'production')
      ? 'Server Error. Please try again.'
      : (err.message || 'Server Error.');
    res.status(status).json({ success: false, message });
  }
};

const toInt = (v) => (v !== undefined && v !== null && v !== '' ? parseInt(v) : null);

// ── FILTER CASCADE ────────────────────────────────────────────────────────────
// Step 1: GET /api/filters/counseling-types
const getCounselingTypes = handle(async (req, res) => {
  const data = await svc.getCounselingTypes();
  res.json({ success: true, data });
});

// Step 2: GET /api/filters/states?counseling_type_id=1
//   State comes right after Counselling Type, before Authority — because
//   in this dataset Authority itself depends on State (e.g. UP -> UPDGME /
//   UP_Ayush, All India -> MCC / AACCC).
const getStates = handle(async (req, res) => {
  const { counseling_type_id } = req.query;
  const data = await svc.getStates(toInt(counseling_type_id));
  res.json({ success: true, data });
});

// Step 3: GET /api/filters/authorities?counseling_type_id=1&state_id=2
const getAuthorities = handle(async (req, res) => {
  const { counseling_type_id, state_id } = req.query;
  const data = await svc.getAuthorities(toInt(counseling_type_id), toInt(state_id));
  res.json({ success: true, data });
});

// GET /api/filters/institute-types?counseling_type_id=&authority_id=&state_id=
//   Only datasets that actually populate the `type` column (UP files) will
//   return rows here — MCC/AYUSH correctly return an empty list, so the
//   frontend hides this pill row entirely for those, instead of showing a
//   stale/static list that doesn't match real data.
const getInstituteTypes = handle(async (req, res) => {
  const { counseling_type_id, authority_id, state_id } = req.query;
  const data = await svc.getInstituteTypes(
    toInt(counseling_type_id), toInt(authority_id), toInt(state_id)
  );
  res.json({ success: true, data });
});

// Step 4: GET /api/filters/years?counseling_type_id=1&authority_id=2&state_id=&institute_type_id=
const getYears = handle(async (req, res) => {
  const { counseling_type_id, authority_id, state_id, institute_type_id } = req.query;
  const data = await svc.getYears(
    toInt(counseling_type_id), toInt(authority_id), toInt(state_id), toInt(institute_type_id)
  );
  res.json({ success: true, data });
});

// Step 4: GET /api/filters/rounds?counseling_type_id=1&authority_id=2&state_id=&institute_type_id=
const getRounds = handle(async (req, res) => {
  const { counseling_type_id, authority_id, state_id, institute_type_id } = req.query;
  const data = await svc.getRounds(
    toInt(counseling_type_id), toInt(authority_id), toInt(state_id), toInt(institute_type_id)
  );
  res.json({ success: true, data });
});

// Step 5: GET /api/filters/courses?counseling_type_id=1&authority_id=2&state_id=&institute_type_id=
const getCourses = handle(async (req, res) => {
  const { counseling_type_id, authority_id, state_id, institute_type_id } = req.query;
  const data = await svc.getCourses(
    toInt(counseling_type_id), toInt(authority_id), toInt(state_id), toInt(institute_type_id)
  );
  res.json({ success: true, data });
});

// Step 6: GET /api/filters/quotas?counseling_type_id=1&authority_id=2&course_id=3&state_id=&institute_type_id=
const getQuotas = handle(async (req, res) => {
  const { counseling_type_id, authority_id, course_id, state_id, institute_type_id } = req.query;
  const data = await svc.getQuotas(
    toInt(counseling_type_id), toInt(authority_id), toInt(course_id),
    toInt(state_id), toInt(institute_type_id)
  );
  res.json({ success: true, data });
});

// Step 6: GET /api/filters/categories?counseling_type_id=1&authority_id=2&state_id=&institute_type_id=
const getCategories = handle(async (req, res) => {
  const { counseling_type_id, authority_id, state_id, institute_type_id } = req.query;
  const data = await svc.getCategories(
    toInt(counseling_type_id), toInt(authority_id), toInt(state_id), toInt(institute_type_id)
  );
  res.json({ success: true, data });
});

// ── COLLEGES ──────────────────────────────────────────────────────────────────
// GET /api/colleges?counseling_type_id=&authority_id=&course_id=&quota_id=&state_id=&institute_type_id=&search=&page=
// THE CORE FIX: state_id + institute_type_id are now passed through, so the
// college list returned here genuinely shrinks to only colleges that have at
// least one cutoffs row matching every selected filter — exactly matching
// what's actually in the uploaded CSVs (e.g. selecting "State" institute type
// only shows the UP government college rows, not MCC/AYUSH ones).
const getColleges = handle(async (req, res) => {
  const { counseling_type_id, authority_id, course_id, quota_id,
          state_id, institute_type_id, search, page, pageSize } = req.query;
  const data = await svc.getColleges({
    counselingTypeId: toInt(counseling_type_id),
    authorityId:      toInt(authority_id),
    courseId:         toInt(course_id),
    quotaId:          toInt(quota_id),
    stateId:          toInt(state_id),
    instituteTypeId:  toInt(institute_type_id),
    search:           search  || '',
    page:             page    || 1,
    pageSize:         pageSize || 50,
  });
  res.json({ success: true, ...data });
});

// GET /api/colleges/:id/cutoffs
const getCollegeCutoffs = handle(async (req, res) => {
  const { id } = req.params;
  const { counseling_type_id, authority_id, course_id, quota_id,
          state_id, institute_type_id } = req.query;
  if (!id) return res.status(400).json({ success: false, message: 'id required' });
  const data = await svc.getCollegeCutoffs({
    instituteId:      parseInt(id),
    counselingTypeId: toInt(counseling_type_id),
    authorityId:      toInt(authority_id),
    courseId:         toInt(course_id),
    quotaId:          toInt(quota_id),
    stateId:          toInt(state_id),
    instituteTypeId:  toInt(institute_type_id),
  });
  res.json({ success: true, data });
});

// ── ELIGIBILITY ───────────────────────────────────────────────────────────────
// GET /api/eligibility?counseling_type_id=&authority_id=&category_id=&course_id=&rank=&round_id=&state_id=&institute_type_id=&page=
const getEligibility = handle(async (req, res) => {
  const { counseling_type_id, authority_id, category_id, course_id, round_id,
          state_id, institute_type_id, rank, page, pageSize } = req.query;
  if (!category_id) return res.status(400).json({ success: false, message: 'category_id required' });
  if (!rank)        return res.status(400).json({ success: false, message: 'rank required' });
  const data = await svc.getEligibility({
    counselingTypeId: toInt(counseling_type_id),
    authorityId:      toInt(authority_id),
    categoryId:       parseInt(category_id),
    courseId:         toInt(course_id),
    roundId:          toInt(round_id),
    stateId:          toInt(state_id),
    instituteTypeId:  toInt(institute_type_id),
    rank:             parseInt(rank),
    page:             page     || 1,
    pageSize:         pageSize || 50,
  });
  res.json({ success: true, ...data });
});

// ── MAIN SEARCH ───────────────────────────────────────────────────────────────
// POST /api/cutoffs  — body already supports `state` and `instituteType` by
// name (resolved to ids inside svc.getCutoffs via nameToId()), unchanged.
const getCutoffs = handle(async (req, res) => {
  const result = await svc.getCutoffs(req.body);
  res.json({ success: true, ...result });
});

// ── LEGACY FULL FILTER BLOB ───────────────────────────────────────────────────
// GET /api/filters?counselingType=MCC
const getFilterOptions = handle(async (req, res) => {
  const { counselingType } = req.query;
  const filters = await svc.getFilterOptions(counselingType || '');
  res.json({ success: true, filters });
});

// ── INSTITUTE AUTOCOMPLETE ────────────────────────────────────────────────────
// GET /api/institutes/search?q=&counselingType=&authorityId=&courseId=&quotaId=&stateId=&instituteTypeId=&limit=
const searchInstitutes = handle(async (req, res) => {
  const { q, counselingType, authorityId, courseId, quotaId, stateId, instituteTypeId, limit } = req.query;
  const results = await svc.searchInstitutes({
    query:           q,
    counselingType,
    authorityId:     toInt(authorityId),
    courseId:        toInt(courseId),
    quotaId:         toInt(quotaId),
    stateId:         toInt(stateId),
    instituteTypeId: toInt(instituteTypeId),
    limit:           parseInt(limit) || 15,
  });
  res.json({ success: true, institutes: results });
});

// ── TRENDS ────────────────────────────────────────────────────────────────────
// GET /api/trends?institute=&category=&counselingType=
const getInstituteTrends = handle(async (req, res) => {
  const { institute, category, counselingType } = req.query;
  if (!institute) return res.status(400).json({ success: false, message: 'institute required' });
  const data = await svc.getInstituteTrends({ institute, category, counselingType });
  res.json({ success: true, data });
});

// ── UPGRADE PROBABILITY ───────────────────────────────────────────────────────
// POST /api/upgrade-probability
const getUpgradeProbability = handle(async (req, res) => {
  const { institute, category, quota, currentRank, round, counselingType } = req.body;
  if (!institute || !category || !currentRank) {
    return res.status(400).json({ success: false, message: 'institute, category, currentRank required' });
  }
  const result = await svc.getUpgradeProbability({ institute, category, quota, currentRank, round, counselingType });
  res.json({ success: true, ...result });
});

// ── ADMIN ─────────────────────────────────────────────────────────────────────
const invalidateCache = handle(async (req, res) => {
  const secret = req.headers['x-import-secret'] || req.body?.secret;
  const result = await svc.invalidateCacheAfterImport(secret);
  res.json(result);
});

const rebuildFacets = handle(async (req, res) => {
  if (!process.env.IMPORT_SECRET) {
    return res.status(503).json({ success: false, message: 'IMPORT_SECRET not configured on this server.' });
  }
  const secret = req.headers['x-import-secret'] || req.body?.secret;
  if (secret !== process.env.IMPORT_SECRET) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }
  const count = await svc.rebuildFacets();
  res.json({ success: true, facetRows: count });
});

const getCacheHealth = handle(async (req, res) => {
  const version = await require('../config/cache').getImportVersion();
  res.json({ success: true, importVersion: version });
});

module.exports = {
  getCounselingTypes, getStates, getAuthorities, getInstituteTypes, getYears, getRounds,
  getCourses, getQuotas, getCategories,
  getColleges, getCollegeCutoffs, getEligibility,
  getCutoffs, getFilterOptions, searchInstitutes,
  getInstituteTrends, getUpgradeProbability,
  invalidateCache, rebuildFacets, getCacheHealth,
};