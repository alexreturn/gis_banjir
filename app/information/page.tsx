"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";

type News = {
  id: number;
  title: string;
  content: string;
  image: string;
  author: string;
  created_at: string;
};

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Memuat berita...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen text-gray-900">
      <Header />

      <div className="px-6 py-12 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">
          Berita Banjir
        </h1>
        <p className="text-center text-gray-600 mb-10 text-sm">
          Informasi terkini mengenai kondisi banjir
        </p>

        {news.length === 0 && (
          <div className="text-center text-gray-400">
            Belum ada berita tersedia
          </div>
        )}

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          {news.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={item.image || "https://via.placeholder.com/400"}
                alt={item.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/400";
                }}
              />

              <div className="p-5">
                <h2 className="font-semibold text-lg mb-1 line-clamp-2">
                  {item.title}
                </h2>

                <div className="text-xs text-gray-500 mb-3">
                  {item.author} •{" "}
                  {new Date(item.created_at).toLocaleDateString("id-ID")}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {item.content}
                </p>

                <button
                  onClick={() => setSelectedNews(item)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  Baca selengkapnya →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {selectedNews && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white max-w-3xl w-full rounded-2xl shadow-xl overflow-hidden animate-fadeIn">

              <img
                src={selectedNews.image || "https://via.placeholder.com/600"}
                alt={selectedNews.title}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/600";
                }}
              />

              {/* FIX SCROLL DI SINI */}
              <div className="p-6 relative max-h-[70vh] overflow-y-auto">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-black text-lg"
                >
                  ✕
                </button>

                <h2 className="text-2xl font-bold mb-2">
                  {selectedNews.title}
                </h2>

                <div className="text-sm text-gray-500 mb-4">
                  {selectedNews.author} •{" "}
                  {new Date(selectedNews.created_at).toLocaleDateString("id-ID")}
                </div>

                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedNews.content}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease;
        }
      `}</style>
    </div>
  );
}