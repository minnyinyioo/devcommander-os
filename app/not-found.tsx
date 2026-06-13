import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 dark:bg-slate-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary dark:text-white">404</h1>
        <p className="mt-4 text-mutedText dark:text-slate-400">Page not found.</p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-xl bg-brandBlue px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back Home
        </Link>
      </div>
    </main>
  );
}
