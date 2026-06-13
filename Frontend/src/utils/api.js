// =============================================================================
// src/utils/api.js — RankSetu API Client
// =============================================================================
// Node.js  (port 5080) → cutoff search, filters, trends
// Python   (port 8000) → AI predictions, upgrade check
// =============================================================================

import axios from 'axios';

const NODE_BASE   = process.env.NEXT_PUBLIC_API_URL    || 'http://localhost:5080';
const PYTHON_BASE = process.env.NEXT_PUBLIC_PYTHON_URL || 'http://localhost:8000';

// ── Axios instances ──────────────────────────────────────────────────────────
const nodeApi = axios.create({
  baseURL: NODE_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

const pythonApi = axios.create({
  baseURL: PYTHON_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── NODE.JS BACKEND — MCC (/api/cutoffs, /api/filters, /api/trends) ─────────

// POST /api/cutoffs — paginated MCC cutoff search
export async function fetchCutoffs(payload) {
  return nodeApi.post('/api/cutoffs', payload);
}

// GET /api/filters — MCC dropdown options from mcc_cutoffs table
export async function fetchFilters() {
  return nodeApi.get('/api/filters');
}

// GET /api/trends?institute=...&category=...
export async function fetchInstituteTrends(institute, category) {
  return nodeApi.get('/api/trends', {
    params: { institute, ...(category ? { category } : {}) },
  });
}

// ── NODE.JS BACKEND — AYUSH (/api/ayush/cutoffs, /api/ayush/filters) ────────

// POST /api/ayush/cutoffs — paginated Ayush cutoff search
// payload: { year, round, category, quota, program, institute, counselingType, page }
export async function fetchAyushCutoffs(payload) {
  return nodeApi.post('/api/ayush/cutoffs', payload);
}

// GET /api/ayush/filters — Ayush dropdown options from ayus table
export async function fetchAyushFilters() {
  return nodeApi.get('/api/ayush/filters');
}

// GET /api/ayush/trends?institute=...&category=...
export async function fetchAyushInstituteTrends(institute, category) {
  return nodeApi.get('/api/ayush/trends', {
    params: { institute, ...(category ? { category } : {}) },
  });
}

// ── PYTHON BACKEND (port 8000) — AI predictions ─────────────────────────────

// GET /api/filters — optimizer filter options (categories, quotas, courses)
export async function fetchOptimizerFilters() {
  try {
    const res = await pythonApi.get('/api/filters');
    return res.data?.filters || res.data;
  } catch (err) {
    console.error('[fetchOptimizerFilters error]', err.message);
    return {
      categories: [],
      quotas:     [],
      courses:    [],
    };
  }
}

// POST /api/optimize — AI college predictor → Dream / Target / Safe
export async function optimizeChoices(payload) {
  const clean = {
    user_rank: payload.user_rank,
    ...(payload.category && payload.category !== 'ALL' ? { category: payload.category } : {}),
    ...(payload.quota    && payload.quota    !== 'ALL' ? { quota:    payload.quota    } : {}),
    ...(payload.course   && payload.course   !== 'ALL' ? { course:   payload.course   } : {}),
    ...(payload.top_n && payload.top_n > 0 ? { top_n: payload.top_n } : {}),
  };
  const res = await pythonApi.post('/api/optimize', clean);
  return res.data;
}

// GET /api/upgrade-institutes — college list for upgrade dropdown
export async function fetchUpgradeInstitutes(category, quota) {
  const res = await pythonApi.get('/api/upgrade-institutes', {
    params: {
      ...(category && category !== 'ALL' ? { category } : {}),
      ...(quota    && quota    !== 'ALL' ? { quota }    : {}),
    },
  });
  return res.data;
}

// POST /api/upgrade-check — round-wise upgrade probability
export async function fetchUpgradeProbability(payload) {
  const res = await pythonApi.post('/api/upgrade-check', payload);
  return res.data;
}

export default nodeApi;