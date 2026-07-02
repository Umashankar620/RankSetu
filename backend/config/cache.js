// =============================================================================
// config/cache.js  —  Redis-first, in-memory fallback
// =============================================================================
// • If REDIS_URL is set → uses ioredis (production)
// • Otherwise           → falls back to in-process Map (dev / single-server)
//
// All callers use the same interface:
//   cache.get(key)            → value | null
//   cache.set(key, val, ttlMs)
//   cache.del(key)
//   cache.delPrefix(prefix)
//   cache.flush()
//
// Cache key convention:
//   ct:<counseling_type_id>              counseling-type row
//   filters:<ctName>                     full filter blob for one type
//   facet:st:<ctId>:<stId>              courses for (ct, state)
//   facet:qu:<ctId>:<stId>:<crsId>      quotas for (ct, state, course)
//   colleges:<ctId>:<stId>:<crsId>:<qId>:<page>:<search>
//   eligibility:<ctId>:<stId>:<catId>:<crsId>:<rndId>:<rank>:<page>
//   import_version                       bumped after every import
// =============================================================================

let redisClient = null;

if (process.env.REDIS_URL) {
  try {
    const Redis = require('ioredis');
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });
    redisClient.on('connect',  () => console.log('✅ Redis connected'));
    redisClient.on('error',    (e) => console.error('❌ Redis error:', e.message));
  } catch (e) {
    console.warn('⚠️  ioredis not installed, falling back to memory cache:', e.message);
    redisClient = null;
  }
} else if (process.env.NODE_ENV === 'production') {
  // Important once you scale beyond a single Render instance: the in-memory
  // fallback below is per-process only. With multiple Render instances
  // serving traffic (which you'll need for 10L+ users), each instance keeps
  // its own separate cache — a filter result cached by instance A won't be
  // visible to instance B, so cache hit rate (and the speed-up it gives)
  // silently drops as you scale out. Add a Redis add-on (Render Redis,
  // Upstash, etc.) and set REDIS_URL to share one cache across all instances.
  console.warn('⚠️  REDIS_URL not set in production — using per-instance in-memory cache. ' +
    'This works fine on a single instance but will NOT be shared once you scale to ' +
    'multiple Render instances. Add Redis for consistent caching at scale.');
}

// ── In-memory fallback ────────────────────────────────────────────────────────
const store = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store.entries()) {
    if (now > v.expiresAt) store.delete(k);
  }
}, 5 * 60_000);

// ── Unified interface ─────────────────────────────────────────────────────────
const cache = {
  async get(key) {
    if (redisClient) {
      try {
        const raw = await redisClient.get(key);
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    }
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { store.delete(key); return null; }
    return entry.value;
  },

  async set(key, value, ttlMs = 600_000) {
    if (redisClient) {
      try {
        await redisClient.set(key, JSON.stringify(value), 'PX', ttlMs);
      } catch {}
      return;
    }
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  },

  async del(key) {
    if (redisClient) { try { await redisClient.del(key); } catch {} return; }
    store.delete(key);
  },

  async delPrefix(prefix) {
    if (redisClient) {
      try {
        const keys = await redisClient.keys(`${prefix}*`);
        if (keys.length) await redisClient.del(...keys);
      } catch {}
      return;
    }
    for (const k of store.keys()) {
      if (k.startsWith(prefix)) store.delete(k);
    }
  },

  async flush() {
    if (redisClient) { try { await redisClient.flushdb(); } catch {} return; }
    store.clear();
  },

  // Called by the import pipeline after every successful CSV run
  async bumpImportVersion() {
    const v = Date.now().toString();
    await this.set('import_version', v, 30 * 24 * 60 * 60_000); // 30 days
    await this.delPrefix('filters:');
    await this.delPrefix('facet:');
    await this.delPrefix('colleges:');
    await this.delPrefix('eligibility:');
    await this.delPrefix('ct:');
    console.log('✅ Cache invalidated after import, version:', v);
    return v;
  },

  async getImportVersion() {
    return (await this.get('import_version')) || '0';
  },
};

module.exports = cache;