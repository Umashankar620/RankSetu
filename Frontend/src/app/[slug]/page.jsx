import DynamicPageClient from './DynamicPageClient';

const PAGE_META = {
  optimizer: {
    title: 'AI College Optimizer — NEET UG',
    description: 'AI-powered NEET UG college optimizer. Enter your rank and get dream, target, and safe college lists sorted by rank proximity.',
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
  'choice-lab': {
    title: 'Choice Lab — AI Choice Filling Analyzer',
    description: 'Organize and optimize your MCC choice filling sequence with AI-powered conflict detection.',
  },
  'college-db': {
    title: 'College Database — NEET UG Medical Colleges',
    description: 'Complete database of all NEET UG medical colleges with seats, fees, and cutoff data.',
  },
};

export async function generateMetadata({ params }) {
  const slug = params.slug;
  const meta = PAGE_META[slug];
  const title       = meta?.title       || `${slug} | RankSetu`;
  const description = meta?.description || 'RankSetu — NEET UG Counselling Intelligence Platform';

  return {
    title,
    description,
    openGraph: { title, description, url: `https://ranksetu.in/${slug}` },
    alternates: { canonical: `https://ranksetu.in/${slug}` },
  };
}

export default function SlugPage({ params }) {
  return <DynamicPageClient slug={params.slug} />;
}
