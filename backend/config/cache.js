// =============================================================================
// config/cache.js — In-Memory TTL Cache
// =============================================================================
// Simple key-value store with automatic expiry.
// Used to cache /api/filters (rarely changes) so repeated page loads
// don't hammer MySQL.
// For multi-server deployments, replace store with Redis.
// =============================================================================

const store = new Map(); // key → { value, expiresAt }

const cache = {
  /** Retrieve a cached value, or null if missing/expired */
  get(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.value;
  },

  /** Store a value with TTL in milliseconds (default: 60s) */
  set(key, value, ttlMs = 60_000) {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  },

  /** Manually remove a key */
  del(key) {
    store.delete(key);
  },

  /** Remove all cached keys */
  flush() {
    store.clear();
  },
};

// Auto-cleanup expired entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.expiresAt) store.delete(key);
  }
}, 5 * 60_000);

module.exports = cache;
