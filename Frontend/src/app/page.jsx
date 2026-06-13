import ClientWrapper from '@/components/ClientWrapper';

export const metadata = {
  title: 'RankSetu — NEET UG Counselling Intelligence Platform',
  description:
    'Free NEET UG cutoff data, AI college optimizer, AIIMS hub & complete MCC counselling guide. 100% data from official MCC PDFs. No login required.',
  openGraph: {
    title: 'RankSetu — NEET UG Counselling Intelligence Platform',
    description: 'Free NEET UG cutoff data, AI college optimizer, AIIMS hub & complete MCC counselling guide.',
    url: 'https://ranksetu.in',
  },
  alternates: { canonical: 'https://ranksetu.in' },
};

export default function HomePage() {
  // ClientWrapper reads the view from usePathname() — no prop needed
  return <ClientWrapper />;
}
