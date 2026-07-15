import type { Metadata } from "next";
import { pagodas, provinces } from "@/lib/data";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: "Về dự án từ điển chùa, đền, tự viện Việt Nam.",
};

export default function AboutPage() {
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
        Dữ liệu được tổng hợp tự động từ Wikipedia tiếng Việt (theo giấy phép CC BY-SA) cùng các
        nguồn công khai khác. Hình ảnh thuộc về Wikimedia Commons và các tác giả tương ứng.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-stone-900">Đóng góp</h2>
      <p className="mt-2">
        Nếu bạn phát hiện thông tin chưa chính xác hoặc muốn bổ sung một ngôi chùa, vui lòng mở
        issue trên kho mã nguồn của dự án. Dữ liệu có thể được cập nhật lại bất cứ lúc nào bằng
        script <code className="rounded bg-stone-100 px-1">scripts/fetch-data.mjs</code>.
      </p>
    </div>
  );
}
