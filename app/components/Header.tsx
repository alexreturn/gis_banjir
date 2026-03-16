"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { setGoogleTranslateLanguage } from "@/lib/gt";

export default function Header() {
  const [language, setLanguage] = useState<"ID" | "EN">("ID");

  // Sinkronkan state awal dengan cookie (jika user pernah memilih)
  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )googtrans=([^;]+)/);
    const cookie = match ? decodeURIComponent(match[1]) : "";
    if (cookie.endsWith("/en")) setLanguage("EN");
    else setLanguage("ID");
  }, []);

  const handleChange = (val: "ID" | "EN") => {
    setLanguage(val);
    const code = val === "EN" ? "en" : "id";
    setGoogleTranslateLanguage(code);

    // Opsi A: tanpa reload (mulus)
    // Trigger ulang proses translate (kalau widget sudah ter-attach)
    if ((window as any).google?.translate?.TranslateElement) {
      // Cara paling stabil: toggle ulang iframe translate
      const iframe = document.querySelector("iframe.goog-te-menu-frame");
      if (!iframe) {
        // Buka menu sekali agar script siap, lalu tutup (opsional)
        const el = document.querySelector(".goog-te-gadget-simple");
        (el as HTMLElement)?.click?.();
        setTimeout(() => {
          // Klik di body untuk menutup jika terbuka
          document.body.click();
        }, 300);
      } else {
        // Paksa reflow dengan mengganti hash (trik aman)
        const hash = window.location.hash;
        window.location.hash =
          hash === "#googtrans" ? "#googtrans2" : "#googtrans";
      }
    } else {
      // Opsi B: fallback reload (paling sederhana & pasti)
      window.location.reload();
    }
  };

  return (
    <header className="w-full bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-4">
        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold">SPK Jalur Alternatif</h1>

        {/* Navigation */}
        <nav className="flex items-center gap-4 mt-3 md:mt-0">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Dashboard
          </Link>

          <Link
            href="/dataView"
            className="px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Data
          </Link>

          <Link
            href="/about"
            className="px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            About
          </Link>

          {/* Language Switch */}

          <select
            value={language}
            onChange={(e) => handleChange(e.target.value as "ID" | "EN")}
            className="bg-white text-blue-600 rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="ID">Bahasa Indonesia</option>
            <option value="EN">English</option>
          </select>
        </nav>
      </div>
    </header>
  );
}
