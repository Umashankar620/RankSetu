// =============================================================================
// controllers/ayushCutoffController.js
// Table: ayush_cutoffs
// Columns: id, year, round, quota, category, institute_name, course,
//          opening_rank, closing_rank, fees, bond_years, counseling_type
// =============================================================================
const db    = require('../config/db');
const cache = require('../config/cache');

const TABLE = 'ayush_cutoffs';
const PAGE_SIZE  = 20;
const FILTER_TTL = 10 * 60_000; // 10 minutes

// Safe whitelist — only these columns allowed in WHERE
const ALLOWED_COLS = new Set(['year', 'round', 'category', 'quota', 'course', 'counseling_type']);

// =============================================================================
// POST /api/ayush/cutoffs
// Body: { year, round, category, quota, program, institute, counselingType, page }
// =============================================================================
const getAyushCutoffs = async (req, res) => {
  try {
    const {
      year, round, category, quota,
      program, institute, counselingType,
      page = 1,
    } = req.body;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const offset  = (pageNum - 1) * PAGE_SIZE;

    const conditions = [];
    const params     = [];

    // Map frontend keys → exact DB column names
    const simpleFilters = {
      year,
      round,
      category,
      quota,
      course:          program,        // frontend sends "program", DB column is "course"
      counseling_type: counselingType, // "MCC" or "Ayush" (the counseling_type column)
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
           counseling_type   AS counselingType,
           institute_name    AS institute,
           course            AS program,
           opening_rank      AS openRank,
           closing_rank      AS closeRank,
           fees,
           bond_years        AS bondYears
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
    console.error('[getAyushCutoffs error]', err.message);
    return res.status(500).json({ success: false, message: 'Server Error. Please try again.' });
  }
};

// =============================================================================
// GET /api/ayush/filters — distinct dropdown values (cached 10 min)
// INCLUDES: quotaInstituteMap for dependent filtering on frontend
// =============================================================================
const getAyushFilterOptions = async (req, res) => {
  const CACHE_KEY = 'ayush_filter_options_v2'; // bumped to v2 — includes quotaInstituteMap
  const cached    = cache.get(CACHE_KEY);
  if (cached) return res.status(200).json({ success: true, filters: cached, fromCache: true });

  try {
    const queries = [
      `SELECT DISTINCT year             FROM ${TABLE} WHERE year             IS NOT NULL ORDER BY year DESC`,
      `SELECT DISTINCT round            FROM ${TABLE} WHERE round            IS NOT NULL AND round            != '' ORDER BY round`,
      `SELECT DISTINCT category         FROM ${TABLE} WHERE category         IS NOT NULL AND category         != '' ORDER BY category`,
      `SELECT DISTINCT quota            FROM ${TABLE} WHERE quota            IS NOT NULL AND quota            != '' ORDER BY quota`,
      `SELECT DISTINCT course           FROM ${TABLE} WHERE course           IS NOT NULL AND course           != '' ORDER BY course`,
      `SELECT DISTINCT institute_name   FROM ${TABLE} WHERE institute_name   IS NOT NULL AND institute_name   != '' ORDER BY institute_name`,
      `SELECT DISTINCT counseling_type  FROM ${TABLE} WHERE counseling_type  IS NOT NULL AND counseling_type  != '' ORDER BY counseling_type`,
      // NEW: quota → institute mapping for dependent filtering (same as MCC controller)
      `SELECT DISTINCT quota, institute_name
         FROM ${TABLE}
         WHERE quota          IS NOT NULL AND quota          != ''
           AND institute_name IS NOT NULL AND institute_name != ''
         ORDER BY quota, institute_name`,
    ];

    const results = await Promise.all(queries.map((q) => db.execute(q)));

    // Build quotaInstituteMap: { "AIQ": ["AIIMS Delhi", ...], "State": [...], ... }
    const quotaInstituteMap = {};
    results[7][0].forEach(({ quota, institute_name }) => {
      if (!quotaInstituteMap[quota]) quotaInstituteMap[quota] = [];
      quotaInstituteMap[quota].push(institute_name);
    });

    const filters = {
      years:           results[0][0].map((r) => r.year),
      rounds:          results[1][0].map((r) => r.round),
      categories:      results[2][0].map((r) => r.category),
      quotas:          results[3][0].map((r) => r.quota),
      programs:        results[4][0].map((r) => r.course),
      institutes:      results[5][0].map((r) => r.institute_name),
      counselingTypes: results[6][0].map((r) => r.counseling_type),
      quotaInstituteMap, // NEW — dependent filtering map
      // ayush table has no gender/type columns — return empty arrays
      genders:         [],
      types:           [],
    };

    cache.set(CACHE_KEY, filters, FILTER_TTL);
    return res.status(200).json({ success: true, filters, fromCache: false });
  } catch (err) {
    console.error('[getAyushFilterOptions error]', err.message);
    return res.status(500).json({ success: false, message: 'Failed to load Ayush filter options.' });
  }
};

// =============================================================================
// GET /api/ayush/trends?institute=...&category=...
// =============================================================================
const getAyushInstituteTrends = async (req, res) => {
  try {
    const { institute, category } = req.query;

    if (!institute) {
      return res.status(400).json({ success: false, message: 'institute query param is required.' });
    }

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

      const [tableRows] = await db.query(
        `SELECT
           year,
           round,
           category,
           quota,
           counseling_type  AS counselingType,
           opening_rank     AS openRank,
           closing_rank     AS closeRank
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
    console.error('[getAyushInstituteTrends error]', err.message);
    return res.status(500).json({ success: false, message: 'Server Error fetching Ayush trends.' });
  }
};

module.exports = { getAyushCutoffs, getAyushFilterOptions, getAyushInstituteTrends };