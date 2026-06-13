import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { AppProvider } from '@/context/AppContext';

import HelmetProviderWrapper from '@/components/HelmetProviderWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ranksetu.in'),
  title: {
    default: 'RankSetu — NEET UG Counselling Intelligence Platform',
    template: '%s | RankSetu',
  },
  description:
    "India's most trusted NEET UG counselling platform. Free cutoff data, college predictor, AI optimizer, AIIMS hub, and counselling guide for all MBBS/BDS aspirants.",
  keywords: [
    'NEET counselling', 'MBBS cutoff 2024', 'NEET UG college predictor',
    'MCC counselling', 'AIIMS cutoff', 'medical college admission', 'NEET rank predictor',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://ranksetu.in',
    siteName: 'RankSetu',
    title: 'RankSetu — NEET UG Counselling Intelligence Platform',
    description:
      'Free NEET UG cutoff data, AI college optimizer, AIIMS hub & complete MCC counselling guide. 100% data from official MCC PDFs.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'RankSetu' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RankSetu — NEET UG Counselling Intelligence Platform',
    description: 'Free NEET UG cutoff data, AI college optimizer, AIIMS hub & complete MCC counselling guide.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'RankSetu',
  url: 'https://ranksetu.in',
  description: "India's most trusted NEET UG counselling intelligence platform.",
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://ranksetu.in/analytics?q={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'RankSetu',
    url: 'https://ranksetu.in',
    logo: { '@type': 'ImageObject', url: 'https://ranksetu.in/logo.png' },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
       <HelmetProviderWrapper>   {/* ← wrap here */}
          <AppProvider>
            {children}
          </AppProvider>
        </HelmetProviderWrapper>
      </body>
    </html>
  );
}
