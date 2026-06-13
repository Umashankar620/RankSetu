// =============================================================================
// controllers/cutoffController.js
// Table: mcc_cutoffs
// Columns: id, year, round, quota, category, institute_name, course,
//          opening_rank, closing_rank, fees, bond_years
// =============================================================================
const db    = require('../config/db');
const cache = require('../config/cache');

const TABLE        = 'mcc_cutoffs';
const PAGE_SIZE    = 20;
const FILTER_TTL   = 10 * 60_000; // 10 minutes

// Safe whitelist — only these columns allowed in WHERE
const ALLOWED_COLS = new Set(['year', 'round', 'category', 'quota', 'course']);

// =============================================================================
// POST /api/cutoffs
// Body: { year, round, category, quota, program, institute, page }
// =============================================================================
const getCutoffs = async (req, res) => {
  try {
    const {
      year, round, category, quota,
      program, institute,
      page = 1,
    } = req.body;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const offset  = (pageNum - 1) * PAGE_SIZE;

    const conditions  = [];
    const params      = [];

    // Map frontend keys → exact DB column names
    const simpleFilters = {
      year,
      round,
      category,
      quota,
      course: program,   // frontend sends "program", DB column is "course"
    };

    for (const [col, val] of Object.entries(simpleFilters)) {
      if (val && val !== 'ALL' && val !== '' && ALLOWED_COLS.has(col)) {
        conditions.push(`\`${col}\` = ?`);
        params.push(val);
      }
    }

    // institute_name — exact match
    if (institute && institute !== 'ALL' && institute !== '') {
      conditions.push('`institute_name` = ?');
      params.push(institute);
    }

    const WHERE = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [[rows], [[countRow]]] = await Promise.all([
      db.query(
        `SELECT
           id,
           year,
           round,
           quota,
           category,
           institute_name  AS institute,
           course          AS program,
           opening_rank    AS openRank,
           closing_rank    AS closeRank,
           fees,
           bond_years      AS bondYears
         FROM ${TABLE}
         ${WHERE}
         ORDER BY closing_rank ASC
         LIMIT ? OFFSET ?`,
        [...params, PAGE_SIZE, offset]
      ),
      db.query(`SELECT COUNT(*) AS total FROM ${TABLE} ${WHERE}`, params),
    ]);

    return res.status(200).json({
      success:     true,
      data:        rows,
      totalItems:  countRow.total,
      totalPages:  Math.ceil(countRow.total / PAGE_SIZE),
      currentPage: pageNum,
      pageSize:    PAGE_SIZE,
    });
  } catch (err) {
    console.error('[getCutoffs error]', err.message);
    return res.status(500).json({ success: false, message: 'Server Error. Please try again.' });
  }
};

// =============================================================================
// GET /api/filters — distinct dropdown values (cached 10 min)
// NOW INCLUDES: quotaInstituteMap for dependent filtering on frontend
// Uses index: ix_quota_institute (quota, institute_name) — index-only scan
// =============================================================================
const getFilterOptions = async (req, res) => {
  // Bumped to v4 — includes quotaInstituteMap; old v3 cache would miss it
  const CACHE_KEY = 'filter_options_v4';
  const cached    = cache.get(CACHE_KEY);
  if (cached) return res.status(200).json({ success: true, filters: cached, fromCache: true });

  try {
    const queries = [
      `SELECT DISTINCT year           FROM ${TABLE} WHERE year           IS NOT NULL ORDER BY year DESC`,
      `SELECT DISTINCT round          FROM ${TABLE} WHERE round          IS NOT NULL AND round          != '' ORDER BY round`,
      `SELECT DISTINCT category       FROM ${TABLE} WHERE category       IS NOT NULL AND category       != '' ORDER BY category`,
      `SELECT DISTINCT quota          FROM ${TABLE} WHERE quota          IS NOT NULL AND quota          != '' ORDER BY quota`,
      `SELECT DISTINCT course         FROM ${TABLE} WHERE course         IS NOT NULL AND course         != '' ORDER BY course`,
      `SELECT DISTINCT institute_name FROM ${TABLE} WHERE institute_name IS NOT NULL AND institute_name != '' ORDER BY institute_name`,
      // NEW: quota → institute mapping for dependent filtering.
      // Hits the ix_quota_institute (quota, institute_name) index as an index-only scan — no row reads.
      `SELECT DISTINCT quota, institute_name
         FROM ${TABLE}
         WHERE quota          IS NOT NULL AND quota          != ''
           AND institute_name IS NOT NULL AND institute_name != ''
         ORDER BY quota, institute_name`,
    ];

    const results = await Promise.all(queries.map((q) => db.execute(q)));

    // Build quotaInstituteMap: { "AIQ": ["AIIMS Delhi", ...], "State": [...], ... }
    // Used by FilterBar to show only relevant institutes when a quota is selected.
    const quotaInstituteMap = {};
    results[6][0].forEach(({ quota, institute_name }) => {
      if (!quotaInstituteMap[quota]) quotaInstituteMap[quota] = [];
      quotaInstituteMap[quota].push(institute_name);
    });

    const filters = {
      years:             results[0][0].map((r) => r.year),
      rounds:            results[1][0].map((r) => r.round),
      categories:        results[2][0].map((r) => r.category),
      quotas:            results[3][0].map((r) => r.quota),
      programs:          results[4][0].map((r) => r.course),
      institutes:        results[5][0].map((r) => r.institute_name),
      quotaInstituteMap, // NEW — dependent filtering map
      // mcc_cutoffs has no gender/type columns — return empty arrays
      genders:           [],
      types:             [],
    };

    cache.set(CACHE_KEY, filters, FILTER_TTL);
    return res.status(200).json({ success: true, filters, fromCache: false });
  } catch (err) {
    console.error('[getFilterOptions error]', err.message);
    return res.status(500).json({ success: false, message: 'Failed to load filter options.' });
  }
};

// =============================================================================
// GET /api/trends?institute=...&category=...
// =============================================================================
const getInstituteTrends = async (req, res) => {
  try {
    const { institute, category } = req.query;

    if (!institute) {
      return res.status(400).json({ success: false, message: 'institute query param is required.' });
    }

    // Available categories for this institute
    const [catRows] = await db.query(
      `SELECT DISTINCT category
       FROM ${TABLE}
       WHERE institute_name = ? AND category IS NOT NULL AND category != ''
       ORDER BY category`,
      [institute]
    );
    const categories     = catRows.map((r) => r.category);
    const activeCategory = category || (categories[0] ?? null);

    let chartData    = [];
    let tableRecords = [];

    if (activeCategory) {
      // Aggregated per year+round for chart
      const [trendRows] = await db.query(
        `SELECT
           year,
           round,
           MIN(closing_rank) AS minCloseRank
         FROM ${TABLE}
         WHERE institute_name = ? AND category = ?
           AND closing_rank IS NOT NULL
         GROUP BY year, round
         ORDER BY year ASC`,
        [institute, activeCategory]
      );

      const byYear = {};
      trendRows.forEach(({ year, round, minCloseRank }) => {
        if (!byYear[year]) byYear[year] = { year };
        byYear[year][round] = minCloseRank;
      });
      chartData = Object.values(byYear);

      // Raw rows for table
      const [tableRows] = await db.query(
        `SELECT
           year,
           round,
           category,
           quota,
           opening_rank  AS openRank,
           closing_rank  AS closeRank
         FROM ${TABLE}
         WHERE institute_name = ? AND category = ?
         ORDER BY year DESC, round ASC`,
        [institute, activeCategory]
      );
      tableRecords = tableRows;
    }

    return res.status(200).json({
      success: true,
      data: { categories, chartData, tableRecords },
    });
  } catch (err) {
    console.error('[getInstituteTrends error]', err.message);
    return res.status(500).json({ success: false, message: 'Server Error fetching trends.' });
  }
};

// =============================================================================
// POST /api/upgrade-probability
// Body: { institute, category, quota, currentRank, round }
// =============================================================================
const getUpgradeProbability = async (req, res) => {
  try {
    const { institute, category, quota, currentRank, round } = req.body;

    if (!institute || !category || !currentRank) {
      return res.status(400).json({
        success: false,
        message: 'institute, category, and currentRank are required.',
      });
    }

    const conditions = ['institute_name = ?', 'category = ?'];
    const params     = [institute, category];

    if (quota && quota !== 'ALL' && quota !== '') {
      conditions.push('quota = ?');
      params.push(quota);
    }
    if (round && round !== 'ALL' && round !== '') {
      conditions.push('round = ?');
      params.push(round);
    }

    const [rows] = await db.query(
      `SELECT year, round, closing_rank AS closeRank, opening_rank AS openRank
       FROM ${TABLE}
       WHERE ${conditions.join(' AND ')}
       ORDER BY year DESC, round ASC`,
      params
    );

    if (rows.length === 0) {
      return res.status(200).json({
        success:        true,
        probability:    null,
        message:        'Not enough historical data.',
        historicalData: [],
      });
    }

    const rank        = parseInt(currentRank);
    const favorable   = rows.filter((r) => r.closeRank >= rank).length;
    const probability = Math.round((favorable / rows.length) * 100);

    return res.status(200).json({
      success:        true,
      probability,
      historicalData: rows,
      sampleSize:     rows.length,
    });
  } catch (err) {
    console.error('[getUpgradeProbability error]', err.message);
    return res.status(500).json({ success: false, message: 'Server Error.' });
  }
};

module.exports = { getCutoffs, getFilterOptions, getInstituteTrends, getUpgradeProbability };