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

  // Set the cookie for Google translate
  function setGoogTransCookie(from: string, to: string) {
    const path = "/";
    const maxAgeDays = 365;
    const maxAge = maxAgeDays * 24 * 60 * 60;
    // Use domain only in production; omit for localhost
    const isLocalhost =
      location.hostname === "localhost" ||
      /^\d+\.\d+\.\d+\.\d+$/.test(location.hostname);
    const domainStr = isLocalhost
      ? ""
      : `; domain=${location.hostname.replace(/^www\./, ".")}`;

    document.cookie = `googtrans=/${from}/${to}; path=${path}; max-age=${maxAge}${domainStr}`;
    document.cookie = `googtrans=/${from}/${to}; path=${path}${domainStr}`; // some builds check duplicates
  }

  // Tear down and recreate the TranslateElement (safest)
  function reinitTranslateElement() {
    // Remove existing injected frames/menus to avoid stale state
    document
      .querySelectorAll(
        "iframe.goog-te-menu-frame, iframe.goog-te-banner-frame",
      )
      .forEach((el) => el.remove());
    document
      .querySelectorAll(".goog-te-menu-frame, .goog-te-banner-frame")
      .forEach((el) => el.remove());
    document
      .querySelectorAll(".skiptranslate")
      .forEach((el) => el.classList.remove("skiptranslate"));

    // If you attached the widget to a specific container, clear it
    const container = document.getElementById("google_translate_element");
    if (container) container.innerHTML = "";

    // Recreate the element (requires the script to have been loaded with cb=googleTranslateElementInit)
    if ((window as any).google?.translate?.TranslateElement) {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "auto", // or "id" if your source is fixed
          autoDisplay: false,
          includedLanguages: "", // or a CSV like "en,id,fr"
          layout: (window as any).google.translate.TranslateElement.InlineLayout
            .SIMPLE,
        },
        "google_translate_element",
      );
    }
  }

  const handleChange = (val: "ID" | "EN") => {
    setLanguage(val);
    const code = val === "EN" ? "en" : "id";
    setGoogleTranslateLanguage(code);

    // 1) set cookie so the widget knows which target language to use
    //    Use 'auto' as from-language unless you know the exact source
    setGoogTransCookie("auto", code);

    // 2) If the widget is already available, re-init it; otherwise wait until it loads
    if ((window as any).google?.translate?.TranslateElement) {
      reinitTranslateElement();
    } else {
      // If script not yet ready, poll a bit (or attach to the global init callback)
      const t0 = Date.now();
      const timer = setInterval(() => {
        if ((window as any).google?.translate?.TranslateElement) {
          clearInterval(timer);
          reinitTranslateElement();
        } else if (Date.now() - t0 > 4000) {
          clearInterval(timer);
          // As a last resort, you could fall back to reload — but usually not needed
          // window.location.reload();
        }
      }, 150);
    }
  };
  const handleChange2 = (val: "ID" | "EN") => {
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
            href="/information  "
            className="px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Informasi
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
            <option value="ID">Indonesia</option>
            <option value="EN">English</option>
          </select>
        </nav>
      </div>
    </header>
  );
}
