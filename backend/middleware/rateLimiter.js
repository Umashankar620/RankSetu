// =============================================================================
// middleware/rateLimiter.js  —  Tiered rate limiting
// =============================================================================
const rateLimit = require('express-rate-limit');

// ── Dev/localhost detection ──────────────────────────────────────────────
// req.ip on "localhost" is usually the IPv6 loopback "::1" (sometimes
// "::ffff:127.0.0.1"), NOT the string "127.0.0.1" — so the old
// `req.ip === '127.0.0.1'` skip NEVER matched in local dev, and the full
// production limit was silently being applied while developing. That is
// what produced the 429 flood from a single browser tab. We now skip the
// limiter entirely outside production, and also recognize every loopback
// form when running in production on a single box.
const isLoopback = (ip) =>
  ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
const skipInDev = (req) =>
  process.env.NODE_ENV !== 'production' || isLoopback(req.ip);

// A single page load fires ~7-8 parallel filter calls (counseling-types,
// states, authorities, institute-types, years, rounds, courses, quotas,
// categories, colleges...). With React StrictMode in dev this can DOUBLE.
// The old apiLimiter (150/min flat) + every failed call being retried by
// the frontend was enough to blow through the budget in seconds — that's
// the actual cause of the 429 flood you saw, not real abuse.

// General: all /api routes — raised so normal cascade + occasional retries
// don't get blocked. Does NOT count requests that errored out (e.g. while
// TiDB was unreachable) against the budget, so a DB hiccup can't also lock
// users out with 429s on top of it.
const apiLimiter = rateLimit({
  windowMs: 60_000, max: 300,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please wait a moment.' },
  skip: skipInDev,
  skipFailedRequests: true,
});

// Filter cascade specifically (counseling-types/states/authorities/years/
// rounds/courses/quotas/categories/institute-types): cheap, cached, fired
// in bursts on every page load/filter change. Needs real headroom.
const filterLimiter = rateLimit({
  windowMs: 60_000, max: 240,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many filter requests. Please wait a moment.' },
  skip: skipInDev,
  skipFailedRequests: true,
});

// Search: heavier DB queries (colleges/eligibility/cutoffs/trends) — per
// real user via trust-proxy. Raised slightly to cover normal rapid
// filter-pill clicking without false positives.
const searchLimiter = rateLimit({
  windowMs: 60_000, max: 120,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Search limit reached. Please slow down.' },
  skip: skipInDev,
  skipFailedRequests: true,
});

// Strict: admin endpoints — 5 req/min per IP
const strictLimiter = rateLimit({
  windowMs: 60_000, max: 5,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Admin rate limit reached.' },
  skip: (req) => process.env.NODE_ENV !== 'production' && isLoopback(req.ip),
});

module.exports = { apiLimiter, filterLimiter, searchLimiter, strictLimiter };