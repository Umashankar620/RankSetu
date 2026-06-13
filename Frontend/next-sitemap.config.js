// /** @type {import('next-sitemap').IConfig} */
// module.exports = {
//   siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://medsphere.in',
//   generateRobotsTxt: true,
//   robotsTxtOptions: {
//     policies: [
//       { userAgent: '*', allow: '/' },
//     ],
//   },
//   additionalPaths: async (config) => [
//     { loc: '/analytics',       changefreq: 'daily',   priority: 0.9 },
//     { loc: '/optimizer',       changefreq: 'weekly',  priority: 0.8 },
//     { loc: '/aiims-hub',       changefreq: 'weekly',  priority: 0.8 },
//     { loc: '/counselling',     changefreq: 'monthly', priority: 0.7 },
//     { loc: '/upgrade',         changefreq: 'weekly',  priority: 0.7 },
//     { loc: '/state-analytics', changefreq: 'daily',   priority: 0.8 },
//     { loc: '/about-us',        changefreq: 'monthly', priority: 0.5 },
//   ],
//   exclude: ['/share-card', '/sandbox', '/choice-lab'],
// };





/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://ranksetu.in',

  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*',        allow: '/' },
      { userAgent: '*',        disallow: ['/api/', '/_next/', '/share-card', '/sandbox'] },
      { userAgent: 'GPTBot',   disallow: '/' },
    ],
  },

  additionalPaths: async (config) => [
    { loc: '/',                changefreq: 'daily',   priority: 1.0, lastmod: new Date().toISOString() },
    { loc: '/analytics',       changefreq: 'daily',   priority: 0.9, lastmod: new Date().toISOString() },
    { loc: '/optimizer',       changefreq: 'weekly',  priority: 0.9, lastmod: new Date().toISOString() },
    { loc: '/aiims-hub',       changefreq: 'weekly',  priority: 0.8, lastmod: new Date().toISOString() },
    { loc: '/counselling',     changefreq: 'weekly',  priority: 0.8, lastmod: new Date().toISOString() },
    { loc: '/upgrade',         changefreq: 'weekly',  priority: 0.7, lastmod: new Date().toISOString() },
    { loc: '/state-analytics', changefreq: 'daily',   priority: 0.8, lastmod: new Date().toISOString() },
    { loc: '/timeline',        changefreq: 'monthly', priority: 0.7, lastmod: new Date().toISOString() },
    { loc: '/ayush',           changefreq: 'weekly',  priority: 0.7, lastmod: new Date().toISOString() },
    { loc: '/about-us',        changefreq: 'monthly', priority: 0.5, lastmod: new Date().toISOString() },
  ],

  exclude: ['/share-card', '/sandbox', '/choice-lab', '/api/*'],
  generateIndexSitemap: false,
};