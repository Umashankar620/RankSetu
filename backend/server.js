// =============================================================================
// server.js — RankSetu Backend Entry Point
// =============================================================================
const express     = require('express');
const cors        = require('cors');
const compression = require('compression');
const cluster     = require('cluster');
const os          = require('os');
require('dotenv').config();

const PORT       = parseInt(process.env.PORT) || 5080;
const useCluster = process.env.NODE_ENV === 'production';

function createApp() {
  const app = express();

  // ── Middleware ─────────────────────────────────────────────
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));

  // ── CORS ───────────────────────────────────────────────────
  const allowedOrigins = (
    process.env.ALLOWED_ORIGINS ||
    'http://localhost:3000'
  )
    .split(',')
    .map((s) => s.trim());

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error('CORS blocked: ' + origin));
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  // ── Routes ─────────────────────────────────────────────────
  app.use('/api', require('./routes/cutoffRoutes'));       // MCC cutoffs (mcc_cutoffs table)
  app.use('/api/ayush', require('./routes/ayushRoutes')); // Ayush cutoffs (ayush_cutoffs table)

  // Health check
  app.get('/health', (req, res) =>
    res.json({ status: 'ok', pid: process.pid, env: process.env.NODE_ENV })
  );

  // 404 handler
  app.use((req, res) =>
    res.status(404).json({ success: false, message: 'Route not found: ' + req.originalUrl })
  );

  // Global error handler
  app.use((err, req, res, _next) => {
    console.error('[Unhandled Error]', err.message);
    res.status(500).json({ success: false, message: err.message });
  });

  return app;
}

// ── Cluster mode (production only) ─────────────────────────
if (useCluster && cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log(`🚀 Master ${process.pid} — forking ${numCPUs} workers`);
  for (let i = 0; i < numCPUs; i++) cluster.fork();
  cluster.on('exit', (worker, code, signal) => {
    console.warn(`Worker ${worker.process.pid} died (${signal || code}). Restarting…`);
    if (signal !== 'SIGTERM' && signal !== 'SIGINT') cluster.fork();
  });
} else {
  const server = createApp().listen(PORT, () => {
    console.log(`✅ RankSetu backend running → http://localhost:${PORT}`);

    // ── TiDB Free Tier warm-up ping ──────────────────────────

    const db = require('./config/db');
    db.query('SELECT 1')
      .then(() => console.log('✅ TiDB warm-up ping successful'))
      .catch((err) => console.warn('[TiDB Warm-up]', err.message));
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} already in use!\n   Run: lsof -ti :${PORT} | xargs kill -9\n`);
      process.exit(1);
    } else throw err;
  });
}