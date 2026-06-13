// =============================================================================
// routes/ayushRoutes.js
// Route Map:
//   GET  /api/ayush/filters   — dropdown options (cached)
//   POST /api/ayush/cutoffs   — paginated search (body: filters + page)
//   GET  /api/ayush/trends    — institute trend chart data
// =============================================================================

const express = require('express');
const router  = express.Router();
const {
  getAyushCutoffs,
  getAyushFilterOptions,
  getAyushInstituteTrends,
} = require('../controllers/ayushCutoffController');
const { apiLimiter, searchLimiter } = require('../middleware/rateLimiter');

// Apply general limiter to all /api/ayush routes
router.use(apiLimiter);

// ── Filter options (GET — called once on page load) ────────
router.get('/filters', getAyushFilterOptions);

// ── Cutoff search (POST — body carries all filter params) ──
router.post('/cutoffs', searchLimiter, getAyushCutoffs);

// ── Institute trend data (GET — query: ?institute=...) ─────
router.get('/trends', searchLimiter, getAyushInstituteTrends);

module.exports = router;
