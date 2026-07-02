// =============================================================================
// config/db.js — TiDB / MySQL2 Connection Pool
// =============================================================================
const mysql = require('mysql2/promise');
require('dotenv').config();

// If clustering is ever enabled (ENABLE_CLUSTER=true in server.js), each
// worker process gets its OWN pool — so the real total hitting TiDB is
// connectionLimit × numWorkers. Divide the configured budget across workers
// automatically so DB_CONNECTION_LIMIT always means "total connections this
// app may hold", not "total per worker".
const configuredLimit = parseInt(process.env.DB_CONNECTION_LIMIT) || 10;
const clusterWorkers  = process.env.ENABLE_CLUSTER === 'true'
  ? (parseInt(process.env.CLUSTER_WORKERS) || 2)
  : 1;
const effectiveConnectionLimit = Math.max(2, Math.floor(configuredLimit / clusterWorkers));

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'ranksetu',
  port:     parseInt(process.env.DB_PORT) || 4000,

  // ── CRITICAL FIX for "EHOSTUNREACH" ──────────────────────────────────────
  // On many home/office networks and ISPs in India, your TiDB Cloud
  // hostname resolves to BOTH an IPv4 (A) and IPv6 (AAAA) address, but your
  // network can only actually route IPv4 traffic. Node picks the IPv6
  // address first → every single connection attempt throws EHOSTUNREACH,
  // even though the DB itself is fine. Forcing family:4 makes Node only
  // ever resolve/connect over IPv4, which fixes this completely.
  family: 4,

  ssl: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2',
  },

  waitForConnections: true,
  connectionLimit:    effectiveConnectionLimit,
  // Lowered from 500 → 50: a huge queue just lets requests silently pile up
  // for a long time when TiDB is briefly unreachable, which is exactly what
  // made the page look "stuck / nothing loads" instead of failing fast so
  // the frontend can show an error and retry sanely.
  queueLimit:         50,
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0,
  connectTimeout:     10000,
  timezone: '+05:30',

  supportBigNumbers: true,
  bigNumberStrings:  false,
  dateStrings:       false,
  multipleStatements: false,
});

// Track DB health so routes can fail fast with a clear message instead of
// hanging on a 10s connect timeout per request while TiDB is down.
let isHealthy = false;
function getDbHealth() { return isHealthy; }

async function connectWithRetry(attempt = 1) {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL Pool connected successfully');
    conn.release();
    isHealthy = true;
  } catch (err) {
    isHealthy = false;
    const delay = Math.min(1000 * 2 ** attempt, 15_000); // exponential backoff, capped at 15s
    console.error(`❌ MySQL Pool connection failed (attempt ${attempt}): ${err.code || err.message} — retrying in ${delay}ms`);
    setTimeout(() => connectWithRetry(attempt + 1), delay);
  }
}
connectWithRetry();

// TiDB free tier — keep-alive ping every 4 minutes
setInterval(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    isHealthy = true;
  } catch (err) {
    isHealthy = false;
    console.error('[DB KeepAlive Error]', err.code || err.message);
  }
}, 4 * 60_000);

pool.on('error', (err) => {
  isHealthy = false;
  console.error('[DB Pool Error]', err.code || err.message);
});

pool.getDbHealth = getDbHealth;
module.exports = pool;