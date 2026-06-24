

import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { AppProvider } from '@/context/AppContext';
import HelmetProviderWrapper from '@/components/HelmetProviderWrapper';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ranksetu.vercel.app';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: "n95IO-vu63Zbd-YdzrahB8z_tF7eMdySjL-_CAwrl6I",
  },

  title: {
    default: 'RankSetu — NEET UG Counselling Intelligence Platform',
    template: '%s | RankSetu',
  },

  description:
    "India's most trusted NEET UG counselling platform. Free cutoff data, college predictor, AI optimizer, AIIMS hub, and counselling guide for all MBBS/BDS/AYUSH aspirants.",

  keywords: [
    'NEET counselling 2025', 'MBBS cutoff 2025', 'NEET UG college predictor',
    'MCC counselling cutoff', 'AIIMS cutoff 2025', 'medical college admission',
    'NEET rank predictor free', 'BDS cutoff 2025', 'AYUSH counselling cutoff',
    'state quota NEET cutoff', 'NEET opening closing rank', 'ranksetu',
  ],

  // Canonical URL — very important for Google
  alternates: {
    canonical: SITE_URL,
  },

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'RankSetu',
    title: 'RankSetu — NEET UG Counselling Intelligence Platform',
    description:
      'Free NEET UG cutoff data, AI college optimizer, AIIMS hub & complete MCC counselling guide. 100% data from official MCC PDFs.',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'RankSetu — NEET Counselling Platform' }],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'RankSetu — NEET UG Counselling Intelligence Platform',
    description: 'Free NEET UG cutoff data, AI college optimizer, AIIMS hub & complete MCC counselling guide.',
    images: [`${SITE_URL}/og-image.png`],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // PWA-like meta for mobile
  manifest: '/manifest.json',
  themeColor: '#1A3C6E',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
};

// ── JSON-LD Structured Data (Google rich results ke liye) ──────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'RankSetu',
  url: SITE_URL,
  description: "India's most trusted NEET UG counselling intelligence platform.",
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/analytics?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'RankSetu',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@ranksetu.com',
      contactType: 'customer support',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
      'https://instagram.com/ranksetu',
      'https://linkedin.com/company/ranksetu',
    ],
  },
};

// ── FAQ Schema (Google FAQ rich result ke liye — bahut help karta hai ranking mein) ──
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'NEET UG 2024 MBBS cutoff rank kya hai AIQ mein?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RankSetu pe free mein check karo — official MCC data ke saath opening aur closing ranks dekhein for all rounds, categories (UR/OBC/SC/ST/EWS) aur quotas.',
      },
    },
    {
      '@type': 'Question',
      name: 'NEET rank se kaunsa medical college milega?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RankSetu ka AI College Optimizer use karo — apna rank aur category dalao, Dream/Target/Safe colleges list milegi.',
      },
    },
    {
      '@type': 'Question',
      name: 'MCC counselling rounds 2024 mein upgrade kab milega?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RankSetu ka Upgrade Probability tool historical data ke basis par batata hai ki aapko Round 2/3 mein upgrade milne ki kitni probability hai.',
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.webp" sizes="any" />
        <link rel="icon" type="image/webp" sizes="32x32" href="/favicon-32.webp" />
        <link rel="icon" type="image/webp" sizes="16x16" href="/favicon-16.webp" />
     
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* WebSite structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* FAQ structured data — Google pe rich result aata hai */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <HelmetProviderWrapper>
          <AppProvider>
            {children}
          </AppProvider>
        </HelmetProviderWrapper>
      </body>
    </html>
  );
}