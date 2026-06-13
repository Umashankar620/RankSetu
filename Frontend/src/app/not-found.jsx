import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl font-black text-indigo-500 mb-4">404</div>
      <h1 className="text-2xl font-black mb-2">Page Not Found</h1>
      <p className="text-slate-400 text-sm mb-8">The page you're looking for doesn't exist on RankSetu.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
