'use client';

import ClientWrapper from '@/components/ClientWrapper';

// ClientWrapper now derives its own view from usePathname(),
// so we don't need to pass initialView at all.
// This component exists only so the [slug]/page.jsx can stay
// a server component (for generateMetadata to work).
export default function DynamicPageClient() {
  return <ClientWrapper />;
}
