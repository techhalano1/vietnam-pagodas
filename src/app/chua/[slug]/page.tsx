import { notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { getPagodaBySlug, pagodas } from "@/lib/data";

const PagodaMap = dynamic(() => import("@/components/PagodaMap"), { ssr: false });

export function generateStaticParams() {
  return pagodas.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getPagodaBySlug(params.slug);
  if (!p) return {};
  return {
    title: `${p.name} — ${p.province}`,
    description: p.description.slice(0, 160),
  };
}

export default function PagodaPage({ params }: { params: { slug: string } }) {
  const p = getPagodaBySlug(params.slug);
  if (!p) notFound();

  const related = pagodas.filter((x) => x.province === p.province && x.id !== p.id).slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav className="mb-4 text-sm text-stone-500">
        <Link href="/" className="hover:text-amber-700">Trang chủ</Link>
        {" / "}
        <Link href={`/danh-muc?tinh=${encodeURIComponent(p.province)}`} className="hover:text-amber-700">
          {p.province}
        </Link>
        {" / "}
        <span className="text-stone-700">{p.name}</span>
      </nav>

      <h1 className="text-3xl font-semibold tracking-tight">{p.name}</h1>
      <p className="mt-1 text-stone-500">{p.province}</p>

      {p.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.image}
          alt={p.name}
          className="mt-6 max-h-[480px] w-full rounded-2xl object-cover shadow"
        />
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-xl font-semibold">Giới thiệu &amp; lịch sử</h2>
        {p.description ? (
          <div className="space-y-3 leading-relaxed text-stone-700">
            {p.description.split("\n").filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : (
          <p className="text-stone-500">Chưa có mô tả chi tiết.</p>
        )}
        <p className="mt-4 text-sm">
          <a
            href={p.wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-amber-700 hover:underline"
          >
            Đọc thêm trên Wikipedia →
          </a>
        </p>
      </section>

      {p.lat !== null && p.lng !== null && (
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-semibold">Vị trí</h2>
          <p className="mb-2 text-sm text-stone-500">
            Toạ độ: {p.lat.toFixed(5)}, {p.lng.toFixed(5)} ·{" "}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-700 hover:underline"
            >
              Chỉ đường trên Google Maps
            </a>
          </p>
          <div className="h-80 overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
            <PagodaMap pagodas={[p]} center={[p.lat, p.lng]} zoom={14} />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-semibold">Chùa khác tại {p.province}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/chua/${r.slug}`}
                className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {r.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.thumbnail} alt={r.name} className="h-32 w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-32 items-center justify-center bg-stone-100 text-3xl">🏯</div>
                )}
                <div className="p-3">
                  <div className="font-medium group-hover:text-amber-700">{r.name}</div>
                  <div className="mt-0.5 line-clamp-2 text-xs text-stone-500">{r.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
