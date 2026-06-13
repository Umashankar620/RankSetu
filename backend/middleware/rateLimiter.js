// =============================================================================
// middleware/rateLimiter.js — Tiered Rate Limiting
// =============================================================================
// Uses express-rate-limit (no Redis required for single-server).
// For multi-server deployments, add rate-limit-redis store.
// =============================================================================

const rateLimit = require('express-rate-limit');

// General limiter applied to ALL /api routes — 120 req/min per IP
const apiLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             120,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Too many requests. Please wait a moment and try again.',
  },
});

// Stricter limiter for search/trend endpoints — 30 req/min per IP
const searchLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             30,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Search limit reached. Please wait a moment.',
  },
});

module.exports = { apiLimiter, searchLimiter };
