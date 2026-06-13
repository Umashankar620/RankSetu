'use client';

import { HelmetProvider } from 'react-helmet-async';

export default function HelmetProviderWrapper({ children }) {
  return <HelmetProvider>{children}</HelmetProvider>;
}