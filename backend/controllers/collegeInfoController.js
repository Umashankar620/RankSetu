// =============================================================================
// controllers/collegeInfoController.js  —  NEW, ADDITIVE ONLY
// =============================================================================
const svc = require('../services/collegeInfoService');

const handle = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (err) {
    console.error('[collegeInfoCtrl]', err);
    const status = err.statusCode || 500;
    const message = (status === 500 && process.env.NODE_ENV === 'production')
      ? 'Server Error. Please try again.'
      : (err.message || 'Server Error.');
    res.status(status).json({ success: false, message });
  }
};

const toInt = (v) => (v !== undefined && v !== null && v !== '' ? parseInt(v) : null);

// NOTE: getStates / getCollegeTypes / getCounselingTypes were removed here —
// they returned a single global, unscoped list no matter what was selected,
// which is why filters never narrowed. The frontend (CollegeInfoPage.jsx)
// now uses the cascading /api/filters/states, /api/filters/institute-types,
// /api/filters/counseling-types endpoints from cutoffController.js instead
// (same ones CutoffPage.jsx already used correctly).

// GET /api/college-info/institutes
const getInstitutesList = handle(async (req, res) => {
  const { state_id, college_type_id, course_id, counseling_type_id, search, page, pageSize } = req.query;
  const result = await svc.getInstitutesList({
    stateId:          toInt(state_id),
    collegeTypeId:    toInt(college_type_id),
    courseId:         toInt(course_id),
    counselingTypeId: toInt(counseling_type_id),
    search:           search || '',
    page, pageSize,
  });
  res.json({ success: true, ...result });
});

// GET /api/college-info/institutes/autocomplete?q=
const autocomplete = handle(async (req, res) => {
  const { q } = req.query;
  const data = await svc.autocomplete(q);
  res.json({ success: true, data });
});

// GET /api/college-info/:slug   (mounted AFTER /institutes routes — see routes file)
const getCollegeDetail = handle(async (req, res) => {
  const { slug } = req.params;
  const data = await svc.getCollegeDetail(slug);
  if (!data) {
    return res.status(404).json({ success: false, message: 'College not found' });
  }
  res.json({ success: true, ...data });
});

// GET /api/college-info/_sitemap/slugs — internal use by Next.js sitemap.js
const getAllSlugs = handle(async (req, res) => {
  const data = await svc.getAllSlugs();
  res.json({ success: true, data });
});

// POST /api/college-info/admin/admission-info — admin write (x-import-secret)
const setAdmissionInfo = handle(async (req, res) => {
  // CHANGED: fail-closed if IMPORT_SECRET isn't configured. Previously,
  // an unset env var meant process.env.IMPORT_SECRET was undefined, and a
  // request sent with no secret header also resolved to undefined —
  // undefined !== undefined is false, so the check passed and this write
  // endpoint was open to anyone. main.py already guards this correctly;
  // this backports the same guard.
  if (!process.env.IMPORT_SECRET) {
    return res.status(503).json({ success: false, message: 'IMPORT_SECRET not configured on this server.' });
  }
  const secret = req.headers['x-import-secret'] || req.body?.secret;
  if (secret !== process.env.IMPORT_SECRET) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }
  const { institute_id, content } = req.body;
  if (!institute_id) return res.status(400).json({ success: false, message: 'institute_id required' });
  await svc.setAdmissionInfo(parseInt(institute_id), content || '');
  res.json({ success: true });
});

module.exports = {
  getInstitutesList, autocomplete,
  getCollegeDetail, getAllSlugs, setAdmissionInfo,
};