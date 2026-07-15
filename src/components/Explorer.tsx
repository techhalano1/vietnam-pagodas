"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Pagoda } from "@/lib/types";
import { normalize } from "@/lib/data";

const PagodaMap = dynamic(() => import("./PagodaMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-stone-100 text-stone-400">
      Đang tải bản đồ…
    </div>
  ),
});

export default function Explorer({
  pagodas,
  provinces,
}: {
  pagodas: Pagoda[];
  provinces: { name: string; count: number }[];
}) {
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return pagodas.filter(
      (p) =>
        (!province || p.province === province) &&
        (!q || normalize(p.name).includes(q) || normalize(p.description).includes(q))
    );
  }, [pagodas, query, province]);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col lg:flex-row">
      <aside className="flex w-full flex-col border-r border-stone-200 bg-white lg:w-[400px]">
        <div className="space-y-2 border-b border-stone-200 p-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm chùa, đền… (ví dụ: Thiên Mụ)"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
          >
            <option value="">Tất cả tỉnh thành ({pagodas.length})</option>
            {provinces.map((pr) => (
              <option key={pr.name} value={pr.name}>
                {pr.name} ({pr.count})
              </option>
            ))}
          </select>
          <p className="text-xs text-stone-500">{filtered.length} kết quả</p>
        </div>
        <ul className="flex-1 divide-y divide-stone-100 overflow-y-auto">
          {filtered.map((p) => (
            <li key={p.id}>
              <Link
                href={`/chua/${p.slug}`}
                className="flex gap-3 px-4 py-3 transition hover:bg-amber-50"
              >
                {p.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.thumbnail}
                    alt={p.name}
                    className="h-14 w-14 flex-none rounded-lg object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-14 w-14 flex-none items-center justify-center rounded-lg bg-stone-100 text-xl">
                    🏯
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate font-medium">{p.name}</div>
                  <div className="text-xs text-stone-500">{p.province}</div>
                  <div className="mt-0.5 line-clamp-1 text-xs text-stone-400">
                    {p.description}
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="p-6 text-center text-sm text-stone-500">
              Không tìm thấy kết quả phù hợp.
            </li>
          )}
        </ul>
      </aside>
      <div className="h-[50vh] flex-1 lg:h-auto">
        <PagodaMap pagodas={filtered} />
      </div>
    </div>
  );
}
