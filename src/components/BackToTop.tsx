"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-[1200] flex h-11 w-11 items-center justify-center rounded-full bg-amber-800 text-amber-50 shadow-lg transition-all duration-300 hover:bg-amber-700 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0 translate-y-2"
      }`}
    >
      ↑
    </button>
  );
}
