import Link from "next/link";
import { getDict } from "@/lib/i18n";

export default function NotFound() {
  const vi = getDict("vi");
  const en = getDict("en");
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <span className="text-6xl" aria-hidden>
        🏯
      </span>
      <h1 className="mt-6 text-2xl font-semibold">{vi.notFoundTitle}</h1>
      <p className="mt-2 text-stone-600 dark:text-stone-300">{vi.notFoundText}</p>
      <p className="mt-4 text-sm text-stone-500">
        {en.notFoundTitle} — {en.notFoundText}
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/vi"
          className="rounded-lg bg-amber-800 px-5 py-2.5 text-sm font-medium text-amber-50 hover:bg-amber-700"
        >
          {vi.backHome}
        </Link>
        <Link
          href="/en"
          className="rounded-lg border border-amber-800 px-5 py-2.5 text-sm font-medium text-amber-900 hover:bg-amber-50"
        >
          {en.backHome}
        </Link>
      </div>
    </div>
  );
}
