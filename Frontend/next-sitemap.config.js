/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://medsphere.in',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
    ],
  },
  additionalPaths: async (config) => [
    { loc: '/analytics',       changefreq: 'daily',   priority: 0.9 },
    { loc: '/optimizer',       changefreq: 'weekly',  priority: 0.8 },
    { loc: '/aiims-hub',       changefreq: 'weekly',  priority: 0.8 },
    { loc: '/counselling',     changefreq: 'monthly', priority: 0.7 },
    { loc: '/upgrade',         changefreq: 'weekly',  priority: 0.7 },
    { loc: '/state-analytics', changefreq: 'daily',   priority: 0.8 },
    { loc: '/about-us',        changefreq: 'monthly', priority: 0.5 },
  ],
  exclude: ['/share-card', '/sandbox', '/choice-lab'],
};
