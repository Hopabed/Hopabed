import Link from "next/link";
import { Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="bg-gray-50 min-h-screen py-24 flex items-center justify-center">
      <div className="container-page max-w-md text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-brand font-extrabold text-3xl">
          404
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Page Not Found</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          The page or stay you are looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-brand-dark transition-all flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" /> Go to Homepage
          </Link>
          <Link
            href="/search"
            className="w-full sm:w-auto rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-800 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4 text-brand" /> Browse Stays
          </Link>
        </div>
      </div>
    </main>
  );
}
