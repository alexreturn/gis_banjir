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
    return <div className="p-10 text-center">Loading berita...</div>;
  }

  return (
    <div>
      <Header />
      <div className="px-6 py-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">
          📰 Berita Banjir Terkini
        </h1>

        {news.length === 0 && (
          <div className="text-center mt-10">Belum ada berita</div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {news.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-52 object-cover"
              />

              <div className="p-5">
                <h2 className="font-semibold text-lg mb-2">{item.title}</h2>

                <div className="text-xs text-gray-500 mb-3">
                  Oleh <strong>{item.author}</strong> •{" "}
                  {new Date(item.created_at).toLocaleDateString("id-ID")}
                </div>

                <p className="text-sm text-gray-700 mb-4">
                  {item.content.length > 120
                    ? item.content.substring(0, 120) + "..."
                    : item.content}
                </p>

                <button
                  onClick={() => setSelectedNews(item)}
                  className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Baca Selengkapnya
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ================= MODAL ================= */}
        {selectedNews && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white max-w-3xl w-full rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
              <div className="relative">
                <img
                  src={selectedNews.image}
                  alt={selectedNews.title}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-3 right-3 bg-white/80 hover:bg-white text-black px-3 py-1 rounded-full"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-2">
                  {selectedNews.title}
                </h2>

                <div className="text-sm text-gray-500 mb-4">
                  Oleh <strong>{selectedNews.author}</strong> •{" "}
                  {new Date(selectedNews.created_at).toLocaleDateString(
                    "id-ID",
                  )}
                </div>

                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedNews.content}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
