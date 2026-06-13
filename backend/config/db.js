const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'ranksetu',
  port:     parseInt(process.env.DB_PORT) || 4000,

  // TiDB Cloud Serverless — SSL required
  ssl: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2',
  },

  waitForConnections: true,
  connectionLimit:    parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
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

pool.getConnection()
  .then((conn) => {
    console.log('✅ MySQL Pool connected successfully');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ MySQL Pool connection failed:', err.message);
    process.exit(1);
  });

setInterval(async () => {
  try { await pool.query('SELECT 1'); }
  catch (err) { console.error('[DB KeepAlive Error]', err.message); }
}, 30_000);

module.exports = pool;