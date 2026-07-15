import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-be-vietnam",
});

export const metadata: Metadata = {
  title: {
    default: "Chùa Việt Nam — Từ điển chùa, đền, tự viện Việt Nam",
    template: "%s | Chùa Việt Nam",
  },
  description:
    "Từ điển trực tuyến về các ngôi chùa, đền và tự viện trên khắp Việt Nam: bản đồ tương tác, lịch sử, hình ảnh và thông tin chi tiết theo từng tỉnh thành.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${beVietnam.variable} font-sans antialiased bg-stone-50 text-stone-900`}>
        <header className="sticky top-0 z-[1100] border-b border-amber-900/10 bg-amber-950 text-amber-50 shadow">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <span aria-hidden>🏯</span>
              <span>
                Chùa Việt Nam
                <span className="ml-2 hidden text-xs font-normal text-amber-200/80 sm:inline">
                  Từ điển chùa &amp; đền Việt Nam
                </span>
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link href="/" className="hover:text-amber-300">Bản đồ</Link>
              <Link href="/danh-muc" className="hover:text-amber-300">Danh mục</Link>
              <Link href="/gioi-thieu" className="hover:text-amber-300">Giới thiệu</Link>
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        <footer className="border-t border-stone-200 bg-white py-6 text-center text-sm text-stone-500">
          <p>
            Chùa Việt Nam — dữ liệu tổng hợp từ Wikipedia tiếng Việt và các nguồn công khai.
          </p>
        </footer>
      </body>
    </html>
  );
}
