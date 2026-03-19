"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white border-2 border-gray-200 rounded-2xl p-8 text-center shadow-lg">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Application error</h1>
            <p className="text-gray-600 mb-6">
              {error?.message || "A runtime error occurred. Please try again."}
            </p>
            <button
              type="button"
              onClick={reset}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 font-semibold text-gray-800 hover:bg-gray-50"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

