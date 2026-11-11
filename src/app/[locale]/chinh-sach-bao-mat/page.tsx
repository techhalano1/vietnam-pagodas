import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";

const ISSUES_URL = "https://github.com/techhalano1/vietnam-pagodas/issues";
const UPDATED = "2026-11-11";

type Section = { h: string; p: string[] };

const content: Record<"vi" | "en", { title: string; intro: string; sections: Section[]; contact: string; updated: string }> = {
  vi: {
    title: "Chính sách bảo mật",
    intro:
      "Chính sách này áp dụng cho trang web vietnam-pagodas.com và ứng dụng di động Chùa Việt Nam (iOS và Android). Chúng tôi không yêu cầu tài khoản và không bán hay chia sẻ dữ liệu cá nhân của bạn.",
    sections: [
      {
        h: "Dữ liệu lưu trên máy của bạn",
        p: [
          "Danh sách chùa yêu thích và đã đi, nhật ký dâng hương, lời nguyện, thông tin tín chủ dùng cho văn khấn, cài đặt và các bài kinh đã tải về chỉ được lưu trên thiết bị của bạn. Chúng không được gửi lên máy chủ.",
          "Bạn có thể xoá các dữ liệu này bất cứ lúc nào trong ứng dụng (ví dụ nút “Xoá” trong nhật ký dâng hương) hoặc bằng cách gỡ ứng dụng.",
        ],
      },
      {
        h: "Vị trí",
        p: [
          "Nếu bạn cho phép, vị trí chỉ được dùng ngay trên máy để sắp xếp các chùa gần bạn. Vị trí không được lưu lại hay gửi đi. Bạn có thể tắt quyền này trong Cài đặt của máy.",
        ],
      },
      {
        h: "Thông báo",
        p: [
          "Nhắc mùng 1 – rằm là thông báo cục bộ, được lên lịch ngay trên máy khi bạn tự bật. Chúng tôi không dùng thông báo đẩy từ máy chủ.",
        ],
      },
      {
        h: "Âm thanh và nội dung",
        p: [
          "Khi bạn nghe hoặc tải bài kinh, ứng dụng tải tệp âm thanh từ vietnam-pagodas.com. Như mọi máy chủ web, nhà cung cấp hạ tầng (Vercel) có thể ghi nhận địa chỉ IP và thông tin kỹ thuật cơ bản để vận hành và chống lạm dụng.",
        ],
      },
      {
        h: "Thống kê truy cập trên web",
        p: [
          "Trang web dùng Vercel Web Analytics để đếm lượt xem trang một cách ẩn danh, không dùng cookie và không theo dõi bạn qua các trang khác. Ứng dụng di động không dùng công cụ thống kê nào.",
        ],
      },
      {
        h: "Trẻ em",
        p: ["Ứng dụng không thu thập dữ liệu cá nhân của bất kỳ ai, kể cả trẻ em."],
      },
    ],
    contact: "Liên hệ và hỗ trợ: gửi câu hỏi hoặc góp ý tại",
    updated: "Cập nhật lần cuối",
  },
  en: {
    title: "Privacy policy",
    intro:
      "This policy covers the vietnam-pagodas.com website and the Vietnam Pagodas mobile app (iOS and Android). No account is required, and we do not sell or share your personal data.",
    sections: [
      {
        h: "Data stored on your device",
        p: [
          "Favourite and visited pagodas, the offering journal, prayers, the worshipper details used in prayer texts, settings and downloaded recordings are stored only on your device. They are never sent to a server.",
          "You can delete this data at any time in the app (for example the “Clear” button in the offering journal) or by uninstalling the app.",
        ],
      },
      {
        h: "Location",
        p: [
          "If you allow it, your location is used only on the device to sort pagodas by distance. It is not stored or transmitted. You can revoke the permission in your device settings.",
        ],
      },
      {
        h: "Notifications",
        p: [
          "Lunar-day reminders are local notifications scheduled on your device when you turn them on. We do not send push notifications from a server.",
        ],
      },
      {
        h: "Audio and content",
        p: [
          "When you play or download a recording, the app fetches the audio file from vietnam-pagodas.com. Like any web server, our hosting provider (Vercel) may log IP addresses and basic technical data to operate the service and prevent abuse.",
        ],
      },
      {
        h: "Website analytics",
        p: [
          "The website uses Vercel Web Analytics to count page views anonymously, without cookies and without tracking you across sites. The mobile app uses no analytics.",
        ],
      },
      {
        h: "Children",
        p: ["The app does not collect personal data from anyone, including children."],
      },
    ],
    contact: "Contact and support: send questions or feedback at",
    updated: "Last updated",
  },
};

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  return { title: getDict(params.locale).navPrivacy };
}

export default function PrivacyPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const c = content[params.locale];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 leading-relaxed text-stone-700 dark:text-stone-300">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
        {c.title}
      </h1>
      <p className="mt-4">{c.intro}</p>
      {c.sections.map((s) => (
        <section key={s.h}>
          <h2 className="mt-8 text-xl font-semibold text-stone-900 dark:text-stone-100">{s.h}</h2>
          {s.p.map((p) => (
            <p key={p} className="mt-2">
              {p}
            </p>
          ))}
        </section>
      ))}
      <p className="mt-8">
        {c.contact}{" "}
        <a
          href={ISSUES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-amber-700 hover:underline dark:text-amber-400"
        >
          GitHub
        </a>
        .
      </p>
      <p className="mt-4 text-sm text-stone-500">
        {c.updated}: {UPDATED}
      </p>
    </div>
  );
}
