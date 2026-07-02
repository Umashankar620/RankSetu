// =============================================================================
// app/college/[slug]/page.jsx — NEW, ADDITIVE ONLY
// =============================================================================
// Real Next.js dynamic route (App Router) — NOT part of the ClientWrapper SPA
// view-switcher. Each college gets its own crawlable URL, unique <title>/meta,
// JSON-LD structured data, and canonical tag. Pre-rendered via
// generateStaticParams + ISR (revalidate 24h) so pages are fast AND stay
// fresh after the next data import, without hitting the DB on every request.
// =============================================================================
import CollegeDetailPage from '@/components/CollegeDetailPage';
import { notFound } from 'next/navigation';

const NODE_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5080';
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL || 'https://ranksetu.com';

// Revalidate every 24h — matches the spec's "ISR with revalidate" requirement.
export const revalidate = 86400;

async function getDetail(slug) {
  try {
    const res = await fetch(`${NODE_BASE}/api/college-info/${encodeURIComponent(slug)}`, {
      next: { revalidate: 86400 },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Upstream ${res.status}`);
    const json = await res.json();
    return json.success ? json : null;
  } catch (e) {
    console.error('[college/[slug]] fetch failed:', e.message);
    return null;
  }
}

// Pre-render the most important colleges at build time; everything else
// falls back to on-demand ISR ('blocking'-equivalent for App Router).
export async function generateStaticParams() {
  try {
    const res = await fetch(`${NODE_BASE}/api/college-info/_sitemap/slugs`);
    if (!res.ok) return [];
    const json = await res.json();
    // Cap build-time pre-render count; the rest render on first request and
    // get cached by ISR from then on — avoids an enormous build for 10L+ users.
    return (json.data || []).slice(0, 2000).map(r => ({ slug: r.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  const detail = await getDetail(slug);
  if (!detail) {
    return { title: 'College Not Found | RankSetu' };
  }
  const { institute } = detail;
  const title = `${institute.name} – NEET UG Cutoff, Fees, Seat Matrix ${institute.state || ''} | RankSetu`.replace(/\s+/g, ' ').trim();
  const description = `${institute.name}${institute.state ? `, ${institute.state}` : ''} — NEET UG opening/closing rank cutoffs, fee structure, seat matrix, and admission details on RankSetu.`;

  return {
    title,
    description,
    alternates: { canonical: `/college/${institute.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/college/${institute.slug}`, type: 'website' },
  };
}

export default async function Page({ params }) {
  const { slug } = params;
  const detail = await getDetail(slug);

  if (!detail) {
    notFound(); // real Next.js 404 — not a 200 with an error message
  }

  const { institute } = detail;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: institute.name,
    address: institute.address || undefined,
    url: institute.website || `${SITE_URL}/college/${institute.slug}`,
    sameAs: institute.website || undefined,
    ...(institute.state ? { areaServed: institute.state } : {}),
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CollegeDetailPage data={detail} darkMode={false} />
    </main>
  );
}
