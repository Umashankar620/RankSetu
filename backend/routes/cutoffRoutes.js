// =============================================================================
// routes/cutoffRoutes.js  —  All production routes
// =============================================================================
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/cutoffController');
const { apiLimiter, filterLimiter, searchLimiter, strictLimiter } = require('../middleware/rateLimiter');

// NOTE: apiLimiter no longer applied globally here — it was stacking with
// filterLimiter/searchLimiter on the SAME request (two counters consuming
// budget for one call), which made the real per-route limit lower than it
// looked. Each route now has exactly ONE limiter.

// Filter cascade — bursty, cheap, cached reads
router.get('/filters/counseling-types', filterLimiter, ctrl.getCounselingTypes);
router.get('/filters/states',           filterLimiter, ctrl.getStates);
router.get('/filters/authorities',      filterLimiter, ctrl.getAuthorities);
router.get('/filters/institute-types',  filterLimiter, ctrl.getInstituteTypes);
router.get('/filters/years',            filterLimiter, ctrl.getYears);
router.get('/filters/rounds',           filterLimiter, ctrl.getRounds);
router.get('/filters/courses',          filterLimiter, ctrl.getCourses);
router.get('/filters/quotas',           filterLimiter, ctrl.getQuotas);
router.get('/filters/categories',       filterLimiter, ctrl.getCategories);

// Legacy full blob (must come AFTER specific routes)
router.get('/filters',                  filterLimiter, ctrl.getFilterOptions);

// Colleges
router.get('/colleges',                 searchLimiter, ctrl.getColleges);
router.get('/colleges/:id/cutoffs',     searchLimiter, ctrl.getCollegeCutoffs);

// Core feature
router.get('/eligibility',              searchLimiter, ctrl.getEligibility);

// Search
router.post('/cutoffs',                 searchLimiter, ctrl.getCutoffs);

// Autocomplete
router.get('/institutes/search',        searchLimiter, ctrl.searchInstitutes);

// Charts
router.get('/trends',                   searchLimiter, ctrl.getInstituteTrends);

// Upgrade
router.post('/upgrade-probability',     searchLimiter, ctrl.getUpgradeProbability);

// Admin
router.post('/admin/cache-invalidate',  strictLimiter, ctrl.invalidateCache);
router.post('/admin/rebuild-facets',    strictLimiter, ctrl.rebuildFacets);

// Health
router.get('/health/cache',             apiLimiter, ctrl.getCacheHealth);
router.get('/health/db',                apiLimiter, (req, res) => {
  const db = require('../config/db');
  const healthy = typeof db.getDbHealth === 'function' ? db.getDbHealth() : true;
  res.status(healthy ? 200 : 503).json({ success: healthy, dbConnected: healthy });
});

module.exports = router;