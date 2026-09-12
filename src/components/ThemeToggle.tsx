"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* private mode */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex h-6 w-11 items-center rounded-full border border-amber-200/40 bg-amber-900/60 transition-colors hover:bg-amber-900"
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 text-[11px] shadow transition-transform duration-300 ${
          dark ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
      >
        {dark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
