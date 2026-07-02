// =============================================================================
// src/utils/api.js  —  RankSetu Unified API Client (Production)
// =============================================================================
// CASCADE SEQUENCE:
//   fetchCounselingTypes()                                   Step 1
//   fetchFilterStates(ctId)                                  Step 2 — pills
//   fetchFilterAuthorities(ctId, stateId)                    Step 3 — pills
//   fetchFilterInstituteTypes(ctId, authId, stateId)         pills (only when data exists)
//   fetchFilterYears(ctId, authId, stateId, itId)            pills
//   fetchFilterRounds(ctId, authId, stateId, itId)           pills
//   fetchFilterCourses(ctId, authId, stateId, itId)          dropdown
//   fetchFilterQuotas(ctId, authId, courseId, stateId, itId) dropdown
//   fetchFilterCategories(ctId, authId, stateId, itId)       dropdown
//   fetchColleges({ctId,authId,courseId,quotaId,stateId,instituteTypeId,search}) — full list + search
// =============================================================================

import axios from 'axios';

const NODE_BASE   = process.env.NEXT_PUBLIC_API_URL    || 'http://localhost:5080';
const PYTHON_BASE = process.env.NEXT_PUBLIC_PYTHON_URL || 'http://localhost:8000';

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

// =============================================================================
// FILTER CASCADE
// =============================================================================

/** Step 1 — All counseling types */
export const fetchCounselingTypes = () =>
  nodeApi.get('/api/filters/counseling-types');

/** Step 2 — States scoped to counseling type (comes BEFORE authority, since
 *  authority itself depends on state in this dataset, e.g. UP -> UPDGME). */
export const fetchFilterStates = (ctId) =>
  nodeApi.get('/api/filters/states', {
    params: ctId ? { counseling_type_id: ctId } : {},
  });

/** Step 3 — Authorities scoped to counseling type + state */
export const fetchFilterAuthorities = (ctId, stateId) =>
  nodeApi.get('/api/filters/authorities', {
    params: {
      ...(ctId    ? { counseling_type_id: ctId }    : {}),
      ...(stateId ? { state_id:           stateId } : {}),
    },
  });

/** Institute Type pills — scoped to type + authority + state.
 *  Only returns rows for datasets that actually populate the `type` column
 *  (e.g. UP_cutoffs_final, UP_Ayush_2025). MCC/AYUSH correctly return an
 *  empty list since their CSVs map type: null — frontend hides the pill row
 *  entirely in that case instead of showing a stale, non-matching list. */
export const fetchFilterInstituteTypes = (ctId, authId, stateId) =>
  nodeApi.get('/api/filters/institute-types', {
    params: {
      ...(ctId    ? { counseling_type_id: ctId }    : {}),
      ...(authId  ? { authority_id:       authId }  : {}),
      ...(stateId ? { state_id:           stateId } : {}),
    },
  });

/** Years (pills) scoped to type + authority + state + institute type */
export const fetchFilterYears = (ctId, authId, stateId, instTypeId) =>
  nodeApi.get('/api/filters/years', {
    params: {
      ...(ctId       ? { counseling_type_id: ctId }       : {}),
      ...(authId     ? { authority_id:       authId }     : {}),
      ...(stateId    ? { state_id:           stateId }    : {}),
      ...(instTypeId ? { institute_type_id:  instTypeId } : {}),
    },
  });

/** Rounds (pills) scoped to type + authority + state + institute type */
export const fetchFilterRounds = (ctId, authId, stateId, instTypeId) =>
  nodeApi.get('/api/filters/rounds', {
    params: {
      ...(ctId       ? { counseling_type_id: ctId }       : {}),
      ...(authId     ? { authority_id:       authId }     : {}),
      ...(stateId    ? { state_id:           stateId }    : {}),
      ...(instTypeId ? { institute_type_id:  instTypeId } : {}),
    },
  });

/** Courses (dropdown) scoped to type + authority + state + institute type */
export const fetchFilterCourses = (ctId, authId, stateId, instTypeId) =>
  nodeApi.get('/api/filters/courses', {
    params: {
      ...(ctId       ? { counseling_type_id: ctId }       : {}),
      ...(authId     ? { authority_id:       authId }     : {}),
      ...(stateId    ? { state_id:           stateId }    : {}),
      ...(instTypeId ? { institute_type_id:  instTypeId } : {}),
    },
  });

/** Quotas (dropdown) scoped to type + authority + course + state + institute type */
export const fetchFilterQuotas = (ctId, authId, courseId, stateId, instTypeId) =>
  nodeApi.get('/api/filters/quotas', {
    params: {
      ...(ctId       ? { counseling_type_id: ctId }       : {}),
      ...(authId     ? { authority_id:       authId }     : {}),
      ...(courseId   ? { course_id:          courseId }   : {}),
      ...(stateId    ? { state_id:           stateId }    : {}),
      ...(instTypeId ? { institute_type_id:  instTypeId } : {}),
    },
  });

/** Categories (dropdown) scoped to type + authority + state + institute type */
export const fetchFilterCategories = (ctId, authId, stateId, instTypeId) =>
  nodeApi.get('/api/filters/categories', {
    params: {
      ...(ctId       ? { counseling_type_id: ctId }       : {}),
      ...(authId     ? { authority_id:       authId }     : {}),
      ...(stateId    ? { state_id:           stateId }    : {}),
      ...(instTypeId ? { institute_type_id:  instTypeId } : {}),
    },
  });

// =============================================================================
// COLLEGES
// =============================================================================

/**
 * College list: ALL colleges matching filters, paginated.
 * NO category / round (spec rule: they don't affect which colleges appear).
 * search = type-ahead within the filtered set.
 * stateId + instituteTypeId are now passed through — this is the core fix
 * that makes the College dropdown actually narrow down when State or
 * Institute Type pills are selected, matching the real uploaded CSV data.
 */
export const fetchColleges = ({
  ctId, authId, courseId, quotaId, stateId, instituteTypeId, search, page, pageSize,
} = {}) =>
  nodeApi.get('/api/colleges', {
    params: {
      ...(ctId            ? { counseling_type_id: ctId }            : {}),
      ...(authId          ? { authority_id:       authId }          : {}),
      ...(courseId        ? { course_id:          courseId }        : {}),
      ...(quotaId         ? { quota_id:            quotaId }        : {}),
      ...(stateId         ? { state_id:            stateId }        : {}),
      ...(instituteTypeId ? { institute_type_id:   instituteTypeId }: {}),
      ...(search          ? { search }                              : {}),
      page:     page     || 1,
      pageSize: pageSize || 50,
    },
  });

/** College cutoff matrix (category × round) for one institute */
export const fetchCollegeCutoffs = (instituteId, { ctId, authId, courseId, quotaId, stateId, instituteTypeId } = {}) =>
  nodeApi.get(`/api/colleges/${instituteId}/cutoffs`, {
    params: {
      ...(ctId            ? { counseling_type_id: ctId }            : {}),
      ...(authId          ? { authority_id:       authId }          : {}),
      ...(courseId        ? { course_id:          courseId }        : {}),
      ...(quotaId         ? { quota_id:            quotaId }        : {}),
      ...(stateId         ? { state_id:            stateId }        : {}),
      ...(instituteTypeId ? { institute_type_id:   instituteTypeId }: {}),
    },
  });

// =============================================================================
// ELIGIBILITY — core product feature
// =============================================================================
export const fetchEligibility = ({
  ctId, authId, categoryId, courseId, roundId, stateId, instituteTypeId, rank, page, pageSize,
} = {}) =>
  nodeApi.get('/api/eligibility', {
    params: {
      rank, category_id: categoryId,
      ...(ctId            ? { counseling_type_id: ctId }            : {}),
      ...(authId          ? { authority_id:       authId }          : {}),
      ...(courseId        ? { course_id:          courseId }        : {}),
      ...(roundId         ? { round_id:            roundId }        : {}),
      ...(stateId         ? { state_id:            stateId }        : {}),
      ...(instituteTypeId ? { institute_type_id:   instituteTypeId }: {}),
      page:     page     || 1,
      pageSize: pageSize || 50,
    },
  });

// =============================================================================
// EXISTING / LEGACY — backward compat, all components still work
// =============================================================================

/** GET /api/filters?counselingType= — legacy full blob */
export const fetchFilters = (counselingType = '') =>
  nodeApi.get('/api/filters', {
    params: counselingType ? { counselingType } : {},
  });

/** POST /api/cutoffs — table search */
export const fetchCutoffs = (payload) =>
  nodeApi.post('/api/cutoffs', payload);

/** GET /api/institutes/search — autocomplete */
export const searchInstitutes = (query, counselingType = '', limit = 15, authId, courseId, quotaId, stateId, instituteTypeId) =>
  nodeApi.get('/api/institutes/search', {
    params: {
      q: query, limit,
      ...(counselingType   ? { counselingType }            : {}),
      ...(authId           ? { authorityId: authId }       : {}),
      ...(courseId         ? { courseId }                  : {}),
      ...(quotaId          ? { quotaId }                   : {}),
      ...(stateId          ? { stateId }                   : {}),
      ...(instituteTypeId  ? { instituteTypeId }           : {}),
    },
  });

/** GET /api/trends */
export const fetchInstituteTrends = (institute, category, counselingType = '') =>
  nodeApi.get('/api/trends', {
    params: {
      institute,
      ...(category       ? { category }       : {}),
      ...(counselingType ? { counselingType }  : {}),
    },
  });

// AYUSH wrappers (backward compat)
export const fetchAyushCutoffs    = (payload) => nodeApi.post('/api/cutoffs', { counselingType: 'AYUSH', ...payload });
export const fetchAyushFilters    = ()         => nodeApi.get('/api/filters', { params: { counselingType: 'AYUSH' } });
export const fetchAyushInstituteTrends = (institute, category) =>
  nodeApi.get('/api/trends', { params: { institute, counselingType: 'AYUSH', ...(category ? { category } : {}) } });

// =============================================================================
// PYTHON BACKEND — fully dynamic cascading filters + prediction/upgrade
// =============================================================================
// CASCADE SEQUENCE (mirrors the Node cascade above, but served by the
// Python backend itself — ChoiceOptimizer.jsx / UpgradeProbability.jsx
// only ever talk to pythonApi, so this cascade has to live here too):
//   fetchPyCounselingTypes()                                         Step 1
//   fetchPyStates(ct)                                                Step 2
//   fetchPyAuthorities(ct, state)                                    Step 3
//   fetchPyInstituteTypes(ct, state, authority)                      pill (may be empty)
//   fetchPyCourses(ct, state, authority, instType)                   Step 4
//   fetchPyQuotas(ct, state, authority, instType, course)            Step 5
//   fetchPyCategories(ct, state, authority, instType)                Step 5
//   fetchPyRounds(ct, state, authority, instType)                    Step 5 (Upgrade module)
// All params are NAMES (not ids) — the Python backend's view already
// flattens ids to names, so no separate id-lookup round trip is needed.
// =============================================================================

const pyParams = (obj) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v && v !== 'ALL') out[k] = v;
  }
  return out;
};

export const fetchPyCounselingTypes = () =>
  pythonApi.get('/api/filters/counseling-types');

export const fetchPyStates = (counselingType) =>
  pythonApi.get('/api/filters/states', { params: pyParams({ counseling_type: counselingType }) });

export const fetchPyAuthorities = (counselingType, state) =>
  pythonApi.get('/api/filters/authorities', { params: pyParams({ counseling_type: counselingType, state }) });

export const fetchPyInstituteTypes = (counselingType, state, authority) =>
  pythonApi.get('/api/filters/institute-types', {
    params: pyParams({ counseling_type: counselingType, state, authority }),
  });

export const fetchPyCourses = (counselingType, state, authority, instituteType) =>
  pythonApi.get('/api/filters/courses', {
    params: pyParams({ counseling_type: counselingType, state, authority, institute_type: instituteType }),
  });

export const fetchPyQuotas = (counselingType, state, authority, instituteType, course) =>
  pythonApi.get('/api/filters/quotas', {
    params: pyParams({
      counseling_type: counselingType, state, authority,
      institute_type: instituteType, course,
    }),
  });

export const fetchPyCategories = (counselingType, state, authority, instituteType) =>
  pythonApi.get('/api/filters/categories', {
    params: pyParams({ counseling_type: counselingType, state, authority, institute_type: instituteType }),
  });

export const fetchPyRounds = (counselingType, state, authority, instituteType) =>
  pythonApi.get('/api/filters/rounds', {
    params: pyParams({ counseling_type: counselingType, state, authority, institute_type: instituteType }),
  });

/** Legacy unscoped blob — kept for backward compat, prefer the cascade above. */
export async function fetchOptimizerFilters() {
  try {
    const res = await pythonApi.get('/api/filters');
    return res.data?.filters || res.data || { categories: [], quotas: [], courses: [] };
  } catch { return { categories: [], quotas: [], courses: [] }; }
}

/**
 * Run the prediction engine. `payload` now accepts the full cascade
 * (counseling_type, state, authority, institute_type) in addition to
 * category/quota/course — every one of them is applied as a real
 * server-side filter BEFORE prediction runs (never predicts over the
 * whole table), exactly matching whatever the cascade UI narrowed down to.
 */
export async function optimizeChoices(payload) {
  const clean = {
    user_rank: payload.user_rank,
    ...(payload.category        && payload.category        !== 'ALL' ? { category:        payload.category }        : {}),
    ...(payload.quota           && payload.quota           !== 'ALL' ? { quota:           payload.quota }           : {}),
    ...(payload.course          && payload.course          !== 'ALL' ? { course:          payload.course }          : {}),
    ...(payload.counseling_type && payload.counseling_type !== 'ALL' ? { counseling_type: payload.counseling_type } : {}),
    ...(payload.state           && payload.state           !== 'ALL' ? { state:           payload.state }           : {}),
    ...(payload.authority       && payload.authority       !== 'ALL' ? { authority:       payload.authority }       : {}),
    ...(payload.institute_type  && payload.institute_type  !== 'ALL' ? { institute_type:  payload.institute_type }  : {}),
    ...(payload.top_n > 0 ? { top_n: payload.top_n } : {}),
  };
  return (await pythonApi.post('/api/optimize', clean)).data;
}

/**
 * College dropdown for the Upgrade module — now scoped by the full
 * cascade too, so it only ever lists colleges that actually exist
 * within the selected counseling_type/state/authority/institute_type/
 * category/quota combination.
 */
export async function fetchUpgradeInstitutes({
  category, quota, counselingType, state, authority, instituteType,
} = {}) {
  try {
    const res = await pythonApi.get('/api/upgrade-institutes', {
      params: pyParams({
        category, quota,
        counseling_type: counselingType, state, authority, institute_type: instituteType,
      }),
    });
    return res.data;
  } catch { return { institutes: [] }; }
}

/**
 * Upgrade-probability check. `payload` now accepts the full cascade
 * (counseling_type, state, authority, institute_type) alongside the
 * existing user_rank/current_institute/category/quota/current_round —
 * Upgradation uses exactly the same filtering pipeline as Prediction.
 */
export async function fetchUpgradeProbability(payload) {
  return (await pythonApi.post('/api/upgrade-check', payload)).data;
}

// =============================================================================
// COLLEGE INFO — College Directory (/college-info) + College Detail
// (/college/[slug]) pages. Talks to /api/college-info/* on the SAME nodeApi
// instance (same baseURL, same timeout, same headers) — no second axios
// client created.
//
// NOTE: fetchCollegeStates / fetchCollegeTypes / fetchCollegeCounselingTypes
// were removed — they hit endpoints that returned a single global, unscoped
// list no matter what was selected. CollegeInfoPage.jsx now gets these
// lookups (properly narrowed by Counselling Type / State) from the same
// cascade functions CutoffPage.jsx already uses correctly:
// fetchCounselingTypes(), fetchFilterStates(ctId), fetchFilterInstituteTypes(),
// fetchFilterCourses() — all defined above in the FILTER CASCADE section.
// =============================================================================

/** Paginated, server-filtered institute directory list */
export const fetchInstitutesList = ({
  stateId, collegeTypeId, courseId, counselingTypeId, search, page, pageSize,
} = {}) =>
  nodeApi.get('/api/college-info/institutes', {
    params: {
      ...(stateId          ? { state_id:           stateId }          : {}),
      ...(collegeTypeId    ? { college_type_id:    collegeTypeId }    : {}),
      ...(courseId         ? { course_id:          courseId }         : {}),
      ...(counselingTypeId ? { counseling_type_id: counselingTypeId } : {}),
      ...(search           ? { search }                                : {}),
      page:     page     || 1,
      pageSize: pageSize || 30,
    },
  });
/** Type-ahead search box on the directory page — debounce on the caller side */
export const searchInstitutesAutocomplete = (query) =>
  nodeApi.get('/api/college-info/institutes/autocomplete', { params: { q: query } });

/** Full College Detail payload by slug — used client-side for any
 *  refresh/revalidation needs (the Next.js [slug] route itself fetches
 *  this same endpoint server-side directly via fetch(), not through axios,
 *  so generateMetadata/generateStaticParams can run on the server). */
export const fetchCollegeDetail = (slug) =>
  nodeApi.get(`/api/college-info/${encodeURIComponent(slug)}`);

export default nodeApi;