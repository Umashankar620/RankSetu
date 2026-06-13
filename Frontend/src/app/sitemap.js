// frontend/src/app/sitemap.js
// Next.js automatically serves this at /sitemap.xml
// Koi change nahi hua existing logic mein — sirf NEXT_PUBLIC_SITE_URL env var use hoga

export default function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ranksetu.vercel.app';
    const now = new Date().toISOString();
  
    return [
      { url: baseUrl,                      lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
      { url: `${baseUrl}/analytics`,       lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
      { url: `${baseUrl}/optimizer`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
      { url: `${baseUrl}/aiims-hub`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
      { url: `${baseUrl}/counselling`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
      { url: `${baseUrl}/state-analytics`, lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
      { url: `${baseUrl}/upgrade`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
      { url: `${baseUrl}/timeline`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
      { url: `${baseUrl}/ayush`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
      { url: `${baseUrl}/about-us`,        lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    ];
  }