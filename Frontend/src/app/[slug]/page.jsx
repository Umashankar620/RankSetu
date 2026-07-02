import DynamicPageClient from './DynamicPageClient';

// CHANGED: title/description that used to live under the legacy slugs
// (analytics, state-analytics) now live under the actual canonical slugs
// (mcc-cutoffs, state-cutoffs) — the real routes were serving a generic
// "{slug} | RankSetu" fallback title while the old, redirect-only slugs
// had the good metadata. Legacy keys below are kept only so old inbound
// links/bookmarks still render *something* sensible; their canonical tag
// now points at the real page (see CANONICAL_REDIRECT + generateMetadata).
const PAGE_META = {
  optimizer: {
    title: 'AI College Optimizer — NEET UG',
    description: 'AI-powered NEET UG college optimizer. Enter your rank and get dream, target, and safe college lists sorted by rank proximity.',
  },
  'mcc-cutoffs': {
    title: 'NEET UG Cutoff Data — Opening & Closing Ranks',
    description: 'Search NEET UG opening and closing ranks for all government, AIIMS, JIPMER, and deemed medical colleges. Year-wise and round-wise data from MCC.',
  },
  'ayush-cutoffs': {
    title: 'AYUSH NEET Cutoff Data — BAMS, BHMS, BUMS Opening & Closing Ranks',
    description: 'Search AYUSH NEET UG opening and closing ranks for BAMS, BHMS, BUMS, and BNYS colleges across states. Year-wise and round-wise cutoff data.',
  },
  'choice-lab': {
    title: 'Choice Lab — AI Choice Filling Analyzer',
    description: 'Organize and optimize your MCC choice filling sequence with AI-powered conflict detection.',
  },
  analytics: {
    title: 'NEET UG Cutoff Data — Opening & Closing Ranks',
    description: 'Search NEET UG opening and closing ranks for all government, AIIMS, JIPMER, and deemed medical colleges. Year-wise and round-wise data from MCC.',
  },
  'aiims-hub': {
    title: 'AIIMS Hub — All 24 AIIMS Cutoffs & Data',
    description: 'Complete data for all 24 AIIMS across India — cutoff ranks, MBBS seats, NIRF rankings, and year-wise trend graphs.',
  },
  counselling: {
    title: 'NEET UG Counselling Guide — MCC Official Rules',
    description: 'Complete NEET UG MCC counselling guide. All quota codes (AI, AI-AIIMS, PS, NRI etc.), category reservations, and round-wise strategy explained.',
  },
  'about-us': {
    title: 'About RankSetu — NEET Counselling Platform',
    description: 'RankSetu is a 100% free NEET counselling platform built to help every NEET aspirant navigate medical college admissions with confidence.',
  },
  'state-analytics': {
    title: 'State Quota Cutoffs — NEET UG',
    description: 'NEET UG state quota cutoff data. Search opening and closing ranks for state counselling across all categories.',
  },
  upgrade: {
    title: 'Upgrade Probability — NEET UG Round Upgrade Tool',
    description: 'Calculate your chances of getting a better allotment in the next counselling round using historical cutoff trend data.',
  },
  predictor: {
    title: 'NEET Rank Predictor — Coming Soon',
    description: 'Predict your NEET rank and find matching medical colleges. Coming soon on RankSetu.',
  },
  timeline: {
    title: 'NEET Counselling Timeline — Important Dates',
    description: 'Step-by-step NEET UG counselling timeline with important dates and deadlines.',
  },
  'how-to-use': {
    title: 'How to Use RankSetu — Complete Beginner\u2019s Guide',
    description: 'Step-by-step guide to every RankSetu tool — College Directory, Cutoff Explorer, AI Choice Optimizer, Choice List Builder, Upgrade Probability, and the Counselling Guide. Start here if you\u2019re new to NEET UG counselling.',
  },
  // CHANGED: was full production-page metadata ("Complete database of all
  // NEET UG medical colleges...") for a route that actually renders
  // <ComingSoon/> — misleading if Google indexed it (users landing on
  // empty content), and worse once real content lives at /college-info.
  // Marked noindex below via PLACEHOLDER_SLUGS so it doesn't compete with
  // /college-info in search results while it's still a placeholder.
  'college-db': {
    title: 'College Database — Coming Soon | RankSetu',
    description: 'This section is coming soon. In the meantime, browse the full NEET UG medical college directory at RankSetu.',
  },
};

// Routes that render a ComingSoon placeholder (no real content yet) —
// keep them out of Google's index so they don't get crawled/ranked and
// then bounce users, and so they don't dilute ranking for the real page.
const PLACEHOLDER_SLUGS = new Set(['college-db']);

// Legacy slugs that render the same content as a newer canonical route
// (ClientWrapper's SLUG_TO_VIEW "legacy link fallback" entries). These
// still resolve so old links/bookmarks keep working, but they must not
// self-canonicalize — that's what was splitting SEO signal between
// /analytics and /mcc-cutoffs (and /state-analytics vs /state-cutoffs)
// for identical content.
const CANONICAL_REDIRECT = {
  analytics: 'mcc-cutoffs',
  cutoffs: 'mcc-cutoffs',
  'state-analytics': 'state-cutoffs',
  ayush: 'ayush-cutoffs',
};

export async function generateMetadata({ params }) {
  const slug = params.slug;
  const canonicalSlug = CANONICAL_REDIRECT[slug] || slug;
  const meta = PAGE_META[canonicalSlug] || PAGE_META[slug];
  const title       = meta?.title       || `${slug} | RankSetu`;
  const description = meta?.description || 'RankSetu — NEET UG Counselling Intelligence Platform';

  return {
    title,
    description,
    openGraph: { title, description, url: `https://ranksetu.in/${canonicalSlug}` },
    alternates: { canonical: `https://ranksetu.in/${canonicalSlug}` },
    ...(PLACEHOLDER_SLUGS.has(slug) ? { robots: { index: false, follow: true } } : {}),
  };
}

export default function SlugPage({ params }) {
  return <DynamicPageClient slug={params.slug} />;
}
