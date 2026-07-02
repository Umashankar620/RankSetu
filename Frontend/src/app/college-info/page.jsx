// =============================================================================
// app/college-info/page.jsx — NEW, ADDITIVE ONLY
// =============================================================================
import CollegeInfoPageClient from '@/components/CollegeInfoPageClient';

export const metadata = {
  title: 'College Directory — NEET UG Colleges, Cutoffs, Fees | RankSetu',
  description: 'Browse every NEET UG college by state and college type. Find cutoffs, fees, and seat matrix for MBBS/BDS/AYUSH colleges across India on RankSetu.',
  alternates: { canonical: '/college-info' },
};

// Server shell (keeps `metadata` export valid) — actual UI + darkMode
// context read happens in the client wrapper below.
export default function Page() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <CollegeInfoPageClient />
    </main>
  );
}
