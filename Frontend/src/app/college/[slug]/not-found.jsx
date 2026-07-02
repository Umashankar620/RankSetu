// =============================================================================
// app/college/[slug]/not-found.jsx — NEW, ADDITIVE ONLY
// =============================================================================
// Rendered automatically by Next.js when notFound() is called in page.jsx.
// Returns a real HTTP 404 status (Next.js handles this automatically for
// the not-found boundary) — not a 200 with an in-page error message.
// =============================================================================
import Link from 'next/link';

export default function CollegeNotFound() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-black text-slate-900 mb-2">College Not Found</h1>
      <p className="text-sm text-slate-500 mb-6">
        We couldn't find a college matching this link. It may have been renamed or removed.
      </p>
      <Link href="/college-info"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700">
        ← Back to College Directory
      </Link>
    </main>
  );
}
