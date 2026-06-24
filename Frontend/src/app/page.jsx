
import ClientWrapper from '@/components/ClientWrapper';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ranksetu.in';

export const metadata = {
  title: 'RankSetu — NEET UG Counselling Intelligence Platform',
  description:
    'Free NEET UG cutoff data, AI college optimizer, AIIMS hub & complete MCC counselling guide. 100% data from official MCC PDFs. No login required.',
  openGraph: {
    title: 'RankSetu — NEET UG Counselling Intelligence Platform',
    description: 'Free NEET UG cutoff data, AI college optimizer, AIIMS hub & complete MCC counselling guide.',
    url: SITE_URL,
  },
  alternates: { canonical: SITE_URL },
};

export default function HomePage() {
  // ClientWrapper reads the view from usePathname() — no prop needed
  return <ClientWrapper />;
}