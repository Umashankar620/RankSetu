// =============================================================================
// config/db.js — MySQL Connection Pool
// =============================================================================
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'neet_db',
  port:     parseInt(process.env.DB_PORT) || 3306,

  waitForConnections: true,
  connectionLimit:    parseInt(process.env.DB_CONNECTION_LIMIT) || 50,
  queueLimit:         500,
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0,
  connectTimeout:     10000,
  timezone: '+05:30',

  supportBigNumbers: true,
  bigNumberStrings:  false,
  dateStrings:       false,
  multipleStatements: false,
});

// Test connection on startup
pool.getConnection()
  .then((conn) => {
    console.log('✅ MySQL Pool connected successfully');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ MySQL Pool connection failed:', err.message);
    console.error('   Check DB_HOST / DB_USER / DB_PASSWORD / DB_NAME in .env');
    process.exit(1);
  });

// Keepalive ping every 30s to prevent idle timeout
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.error('[DB KeepAlive Error]', err.message);
  }
}, 30_000);

module.exports = pool;
