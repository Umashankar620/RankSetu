// =============================================================================
// routes/collegeInfoRoutes.js  —  NEW, ADDITIVE ONLY
// =============================================================================
// Mounted in server.js as: app.use('/api/college-info', require('./routes/collegeInfoRoutes'))
// Reuses the EXISTING rate-limit middleware tiers exactly like cutoffRoutes.js.
//
// Route order matters: specific routes (/states, /college-types, /institutes,
// /institutes/autocomplete, /admin/*) MUST come before the catch-all
// GET /:slug route, or they'll be swallowed by it.
// =============================================================================
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/collegeInfoController');
const { apiLimiter, searchLimiter, strictLimiter } = require('../middleware/rateLimiter');

router.use(apiLimiter);

// NOTE: /states, /college-types, /counseling-types were removed — they
// returned a single global, unscoped list. The frontend now gets these
// (properly narrowed by Counselling Type / State) from cutoffRoutes.js:
// /api/filters/states, /api/filters/institute-types, /api/filters/counseling-types.

// Directory list + autocomplete (heavier — searchLimiter)
router.get('/institutes/autocomplete', searchLimiter, ctrl.autocomplete);
router.get('/institutes',              searchLimiter, ctrl.getInstitutesList);

// Internal — consumed by Next.js sitemap generation, not user-facing UI
router.get('/_sitemap/slugs',          ctrl.getAllSlugs);

// Admin — write admission info (TODO: wire to a real admin UI later)
router.post('/admin/admission-info',   strictLimiter, ctrl.setAdmissionInfo);

// Detail by slug — MUST be last (catch-all single-segment param)
router.get('/:slug',                   searchLimiter, ctrl.getCollegeDetail);

module.exports = router;