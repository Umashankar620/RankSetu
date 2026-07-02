// frontend/src/app/sitemap.js
// Next.js automatically serves this at /sitemap.xml
// Existing static routes UNCHANGED — only addition is the dynamic
// `/college/{slug}` entries fetched from the new, additive
// /api/college-info/_sitemap/slugs backend endpoint.

const NODE_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5080';

async function getCollegeSlugs() {
  try {
    const res = await fetch(`${NODE_BASE}/api/college-info/_sitemap/slugs`, {
      // ISR-style cache for the sitemap fetch itself — refreshes daily,
      // doesn't hit the DB on every single sitemap.xml request.
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    // Backend down/unreachable — sitemap still serves the static routes below,
    // it just won't include college URLs until the backend is reachable again.
    return [];
  }
}

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ranksetu.vercel.app';
  const now = new Date().toISOString();

  // CHANGED: was submitting legacy slugs (/analytics, /state-analytics,
  // /ayush) that ClientWrapper only keeps around as fallback redirects for
  // old links. Google was being told those were the canonical pages while
  // [slug]/page.jsx *also* self-canonicalized them — a duplicate-content
  // split against the real current routes below. Sitemap now only lists
  // the actual canonical paths (see VIEW_TO_PATH in ClientWrapper.jsx).
  const staticUrls = [
    { url: baseUrl,                      lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${baseUrl}/mcc-cutoffs`,     lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/optimizer`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/aiims-hub`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${baseUrl}/counselling`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${baseUrl}/state-cutoffs`,   lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${baseUrl}/upgrade`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/timeline`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/ayush-cutoffs`,   lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${baseUrl}/about-us`,        lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/college-info`,    lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    // NEW: was missing entirely — real, active feature not being submitted to Google.
    { url: `${baseUrl}/choice-lab`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
  ];

  const slugs = await getCollegeSlugs();
  const collegeUrls = slugs.map(s => ({
    url: `${baseUrl}/college/${s.slug}`,
    lastModified: s.updated_at ? new Date(s.updated_at).toISOString() : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticUrls, ...collegeUrls];
}