// =============================================================================
// routes/cutoffRoutes.js
// =============================================================================
// Route Map:
//   GET  /api/filters          — dropdown options (cached)
//   POST /api/cutoffs          — paginated search (body: filters + page)
//   GET  /api/trends           — institute trend chart data
//   POST /api/upgrade-probability — upgrade chance calculator
// =============================================================================

const express = require('express');
const router  = express.Router();
const {
  getCutoffs,
  getFilterOptions,
  getInstituteTrends,
  getUpgradeProbability,


} = require('../controllers/cutoffController');
const { apiLimiter, searchLimiter } = require('../middleware/rateLimiter');

// Apply general limiter to all /api routes
router.use(apiLimiter);

// ── Filter options (GET — called once on page load) ────────
router.get('/filters', getFilterOptions);

// ── Cutoff search (POST — body carries all filter params) ──
// FIX: Must be POST because frontend sends JSON body via fetchCutoffs()
router.post('/cutoffs', searchLimiter, getCutoffs);

// ── Institute trend data (GET — query: ?institute=...) ─────
router.get('/trends', searchLimiter, getInstituteTrends);

// ── Upgrade probability (POST) ─────────────────────────────
router.post('/upgrade-probability', searchLimiter, getUpgradeProbability);


module.exports = router;
