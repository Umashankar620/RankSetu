// =============================================================================
// server.js  —  RankSetu Backend Entry Point (Production)
// =============================================================================
const express     = require('express');
const cors        = require('cors');
const compression = require('compression');
const helmet      = require('helmet');
const cluster     = require('cluster');
const os          = require('os');
require('dotenv').config();

const PORT       = parseInt(process.env.PORT) || 5080;

function createApp() {
  const app = express();

  // ── CRITICAL: trust the reverse proxy (Render/Vercel/any load balancer) ────
  // Without this, Express reads the proxy's own IP for every single visitor
  // instead of the real client IP. That means express-rate-limit below
  // treats your ENTIRE userbase as ONE IP address, sharing a single
  // 150 req/min (or 40 req/min for search) bucket across everyone — at any
  // real traffic this throttles random users with no clear pattern, which
  // looks exactly like "site randomly stuck, need to refresh". Must be set
  // BEFORE any rate limiter or other IP-dependent middleware is mounted.
  app.set('trust proxy', 1);

  // ── Security & Performance ─────────────────────────────────────────────────
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));

  // ── CORS ───────────────────────────────────────────────────────────────────
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',').map(s => s.trim());

  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('CORS blocked: ' + origin));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-import-secret'],
    credentials: true,
  }));

  // ── Main API routes ────────────────────────────────────────────────────────
  app.use('/api', require('./routes/cutoffRoutes'));

  // ── College Directory + Detail (new, additive) ─────────────────────────────
  app.use('/api/college-info', require('./routes/collegeInfoRoutes'));

  // ── Backward-compat shim: /api/ayush/* → /api/* ───────────────────────────
  // Keeps old bookmarks working. Remove after 60 days.
  const shimRouter = express.Router();
  const ctrl = require('./controllers/cutoffController');
  const { apiLimiter, searchLimiter } = require('./middleware/rateLimiter');
  shimRouter.use(apiLimiter);
  shimRouter.get('/filters', (req, res) => {
    req.query.counselingType = req.query.counselingType || 'AYUSH';
    ctrl.getFilterOptions(req, res);
  });
  shimRouter.post('/cutoffs', searchLimiter, (req, res) => {
    req.body.counselingType = req.body.counselingType || 'AYUSH';
    ctrl.getCutoffs(req, res);
  });
  shimRouter.get('/trends', searchLimiter, ctrl.getInstituteTrends);
  app.use('/api/ayush', shimRouter);

  // ── Health ─────────────────────────────────────────────────────────────────
  app.get('/health', (req, res) =>
    res.json({ status: 'ok', pid: process.pid, env: process.env.NODE_ENV, ts: new Date().toISOString() })
  );

  // ── 404 ────────────────────────────────────────────────────────────────────
  app.use((req, res) =>
    res.status(404).json({ success: false, message: 'Route not found: ' + req.originalUrl })
  );

  // ── Global error handler ───────────────────────────────────────────────────
  app.use((err, req, res, _next) => {
    console.error('[Unhandled]', err);
    const message = process.env.NODE_ENV === 'production'
      ? 'Server Error. Please try again.'
      : (err.message || 'Server Error.');
    res.status(500).json({ success: false, message });
  });

  return app;
}

// ── Cluster (OFF by default — see note below) ───────────────────────────────
// On Render (and most container hosts) `os.cpus().length` reports the HOST
// machine's core count, not the slice your container is actually billed
// for/allocated. Forking that many workers means each one opens its own DB
// pool (DB_CONNECTION_LIMIT connections each) — on a 4-8 "core" host that
// can mean 40-80 simultaneous connections fighting for a TiDB free/serverless
// tier connection cap meant for far fewer. The result is intermittent pool
// exhaustion: random requests hang until a connection frees up, which looks
// exactly like "site stuck, works again after refresh" under real traffic.
//
// Render already scales horizontally (multiple service instances) — that is
// the correct place to add capacity, not Node's own cluster module fighting
// over one container's CPU/connection budget. Cluster stays OFF unless you
// explicitly opt in (e.g. on a dedicated VM you fully control) by setting
// ENABLE_CLUSTER=true and CLUSTER_WORKERS=<n> in the environment.
const useCluster = process.env.ENABLE_CLUSTER === 'true';
const numWorkers = parseInt(process.env.CLUSTER_WORKERS) || 2; // small, explicit default — never os.cpus().length

if (useCluster && cluster.isMaster) {
  console.log(`🚀 Master ${process.pid} — forking ${numWorkers} workers (CLUSTER_WORKERS)`);
  for (let i = 0; i < numWorkers; i++) cluster.fork();
  cluster.on('exit', (worker, code, signal) => {
    console.warn(`Worker ${worker.process.pid} died (${signal || code}). Restarting…`);
    if (signal !== 'SIGTERM' && signal !== 'SIGINT') cluster.fork();
  });
} else {
  const server = createApp().listen(PORT, async () => {
    console.log(`✅ RankSetu backend running → http://localhost:${PORT}`);

    // Warm-up: DB ping
    try {
      const db = require('./config/db');
      await db.query('SELECT 1');
      console.log('✅ TiDB warm-up ping successful');
    } catch (err) {
      console.warn('[TiDB Warm-up]', err.message);
    }

    // Auto-rebuild facets table if it doesn't exist yet (first run)
    if (process.env.AUTO_BUILD_FACETS === 'true') {
      try {
        const svc = require('./services/cutoffService');
        await svc.rebuildFacets();
      } catch (e) {
        console.warn('[Facets Auto-build]', e.message);
      }
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} already in use!\n   Run: lsof -ti :${PORT} | xargs kill -9\n`);
      process.exit(1);
    } else throw err;
  });

  // Graceful shutdown
  const shutdown = (sig) => {
    console.log(`\n${sig} received — shutting down gracefully`);
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  // A single stray unhandled rejection (e.g. one bad DB query) should not
  // kill the entire process and force Render to cold-restart the instance
  // (which is exactly what produces a long "stuck, need refresh" moment for
  // every user currently on the site). Log it loudly and keep serving.
  process.on('unhandledRejection', (reason) => {
    console.error('[UnhandledRejection]', reason);
  });
}