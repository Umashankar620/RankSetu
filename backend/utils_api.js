// =============================================================================
// utils/api.js — Axios API Client (Next.js Frontend)
// =============================================================================
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5080';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Cutoff Search ───────────────────────────────────────────────────────────
// IMPORTANT: Backend route is POST /api/cutoffs (JSON body, not GET params)
// This was the root cause of the 404 error — must stay as POST.
export async function fetchCutoffs(payload) {
  return api.post('/api/cutoffs', payload);
}

// ── Filter Dropdowns ────────────────────────────────────────────────────────
export async function fetchFilters() {
  return api.get('/api/filters');
}

// ── Institute Trend Chart ───────────────────────────────────────────────────
export async function fetchInstituteTrends(institute, category) {
  return api.get('/api/trends', {
    params: { institute, ...(category ? { category } : {}) },
  });
}

// ── Upgrade Probability ─────────────────────────────────────────────────────
export async function fetchUpgradeProbability(payload) {
  return api.post('/api/upgrade-probability', payload);
}

export default api;

// =============================================================================
// MOCK FUNCTIONS FOR CHOICE OPTIMIZER (temporary, until backend ready)
// =============================================================================
export async function fetchOptimizerFilters() {
  return {
    categories: ['ALL', 'UR', 'OBC-NCL', 'SC', 'ST', 'EWS', 'PwD'],
    quotas:     ['ALL', 'AI', 'AI (AIIMS)', 'AI (JIPMER)', 'PS', 'SO', 'DU', 'IP', 'JP', 'ES', 'JM', 'MM', 'NR'],
    courses:    ['ALL', 'MBBS', 'BDS', 'B.Sc Nursing'],
  };
}

export async function optimizeChoices(payload) {
  const { user_rank, category, quota, course } = payload;
  const colleges = [];
  for (let i = 1; i <= 15; i++) {
    const predicted = user_rank + i * 200 - 1000;
    colleges.push({
      institute:       `Mock Medical College ${i}`,
      program:         course === 'ALL' ? (i % 2 === 0 ? 'MBBS' : 'BDS') : course,
      quota:           quota === 'ALL' ? 'AI' : quota,
      predicted_close: predicted,
      closeRank:       predicted,
      confidence:      Math.floor(70 + Math.random() * 25),
      trend:           ['Rising', 'Falling', 'Steady'][i % 3],
      momentum:        ['Steady', 'Accelerating', 'Reversing'][i % 3],
      safety_margin:   predicted - user_rank,
      notes:           [],
    });
  }
  colleges.sort((a, b) => a.predicted_close - b.predicted_close);
  const dream  = colleges.filter((c) => c.predicted_close < user_rank).slice(0, 5);
  const target = colleges.filter((c) => c.predicted_close >= user_rank && c.predicted_close <= user_rank + 1500).slice(0, 8);
  const safe   = colleges.filter((c) => c.predicted_close > user_rank + 1500).slice(0, 10);
  return { dream, target, safe, stats: { total_analyzed: colleges.length } };
}
