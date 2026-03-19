import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white border-2 border-gray-200 rounded-2xl p-8 text-center shadow-lg">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-600 mb-6">The page you are looking for does not exist.</p>
        <Link
          href="/"
          className="inline-block w-full rounded-xl border border-gray-300 px-4 py-2.5 font-semibold text-gray-800 hover:bg-gray-50"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

