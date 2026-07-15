import Explorer from "@/components/Explorer";
import { pagodas, provinces } from "@/lib/data";

export default function Home() {
  return (
    <div>
      <section className="border-b border-amber-900/10 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 px-4 py-4 text-amber-50">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-xl font-semibold sm:text-2xl">
            Từ điển chùa &amp; đền Việt Nam
          </h1>
          <p className="mt-1 text-sm text-amber-200/90">
            Khám phá {pagodas.length} ngôi chùa, đền, tự viện trên khắp {provinces.length} tỉnh
            thành — bản đồ tương tác, lịch sử và hình ảnh chi tiết.
          </p>
        </div>
      </section>
      <Explorer pagodas={pagodas} provinces={provinces} />
    </div>
  );
}
