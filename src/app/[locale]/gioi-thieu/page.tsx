import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pagodas, provinces } from "@/lib/data";
import { getDict, isLocale } from "@/lib/i18n";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  return { title: t.navAbout, description: t.metaDescription };
}

export default function AboutPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;

  if (locale === "en") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 leading-relaxed text-stone-700">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">About</h1>
        <p className="mt-4">
          <strong>Vietnam Pagodas</strong> is an online dictionary of pagodas, temples and
          monasteries across Vietnam. It currently aggregates {pagodas.length} sites in{" "}
          {provinces.length} provinces, with an interactive map, photos, descriptions and history.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-stone-900">Data sources</h2>
        <p className="mt-2">
          Data is aggregated automatically from Vietnamese and English Wikipedia (CC BY-SA
          license), Wikidata, and OpenStreetMap. Each pagoda page lists its references, including
          the external sources cited by the Wikipedia articles. Images belong to Wikimedia Commons
          and their respective authors.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-stone-900">Sponsor</h2>
        <p className="mt-2">
          This site is proudly sponsored by{" "}
          <a
            href="https://cognition.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-amber-700 hover:underline"
          >
            Cognition
          </a>
          , which supports the compute and AI tokens that power the research, data aggregation and
          maintenance of this project.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-stone-900">Contributing</h2>
        <p className="mt-2">
          If you find inaccurate information or want to add a pagoda, please open an issue on the
          project repository. The dataset can be refreshed at any time using the scripts in{" "}
          <code className="rounded bg-stone-100 px-1">scripts/</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 leading-relaxed text-stone-700">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Giới thiệu</h1>
      <p className="mt-4">
        <strong>Chùa Việt Nam</strong> là một từ điển trực tuyến về các ngôi chùa, đền và tự viện
        trên khắp Việt Nam. Hiện tại, hệ thống tổng hợp {pagodas.length} địa điểm tại{" "}
        {provinces.length} tỉnh thành, kèm bản đồ tương tác, hình ảnh, mô tả và lịch sử.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-stone-900">Nguồn dữ liệu</h2>
      <p className="mt-2">
        Dữ liệu được tổng hợp tự động từ Wikipedia tiếng Việt và tiếng Anh (theo giấy phép CC
        BY-SA), Wikidata và OpenStreetMap. Mỗi trang chùa liệt kê nguồn tham khảo, bao gồm các
        nguồn ngoài được trích dẫn trong bài viết Wikipedia. Hình ảnh thuộc về Wikimedia Commons
        và các tác giả tương ứng.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-stone-900">Nhà tài trợ</h2>
      <p className="mt-2">
        Trang web được tài trợ bởi{" "}
        <a
          href="https://cognition.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-amber-700 hover:underline"
        >
          Cognition
        </a>
        , đơn vị hỗ trợ toàn bộ chi phí tính toán và token AI cho việc nghiên cứu, tổng hợp dữ
        liệu và duy trì dự án này.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-stone-900">Đóng góp</h2>
      <p className="mt-2">
        Nếu bạn phát hiện thông tin chưa chính xác hoặc muốn bổ sung một ngôi chùa, vui lòng mở
        issue trên kho mã nguồn của dự án. Dữ liệu có thể được cập nhật lại bất cứ lúc nào bằng
        các script trong thư mục <code className="rounded bg-stone-100 px-1">scripts/</code>.
      </p>
    </div>
  );
}
