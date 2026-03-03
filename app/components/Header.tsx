"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [language, setLanguage] = useState("ID");

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
            href="/information"
            className="px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Information
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
            onChange={(e) => setLanguage(e.target.value)}
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
