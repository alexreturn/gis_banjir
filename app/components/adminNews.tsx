"use client";

import { useEffect, useState } from "react";

type News = {
  id: number;
  admin_id: number;
  title: string;
  content: string;
  image: string;
  created_at?: string;
};

export default function AdminNewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [editing, setEditing] = useState<News | null>(null);

  const [form, setForm] = useState<News>({
    id: 0,
    admin_id: 0,
    title: "",
    content: "",
    image: "",
  });

  const fetchNews = () => {
    fetch("/api/news")
      .then((res) => res.json())
      .then(setNews)
      .catch(console.error);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // =============================
  // CREATE
  // =============================
  const handleCreate = async () => {
    if (!form.title || !form.content) {
      alert("Title dan Content wajib diisi");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user.id) {
      alert("Admin tidak ditemukan. Silakan login ulang.");
      return;
    }

    const res = await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        admin_id: user.id, // ✅ kirim dari sini
      }),
    });

    const data = await res.json();

    if (data.success) {
      setForm({
        id: 0,
        admin_id: user.id,
        title: "",
        content: "",
        image: "",
      });
      fetchNews();
    } else {
      alert("Gagal tambah: " + data.error);
    }
  };

  // DELETE
  const handleDelete = async (id: number) => {
    if (!confirm("Hapus berita ini?")) return;

    try {
      const res = await fetch("/api/news", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert("Gagal hapus: " + (data.error || res.statusText));
        return;
      }

      fetchNews();
    } catch (err: any) {
      alert("Gagal hapus: " + err.message);
    }
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!editing) return;

    try {
      const res = await fetch("/api/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          title: editing.title,
          content: editing.content,
          image: editing.image,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert("Gagal update: " + (data.error || res.statusText));
        return;
      }

      setEditing(null);
      fetchNews();
    } catch (err: any) {
      alert("Gagal update: " + err.message);
    }
  };

  return (
    <div className="p-8 bg-white/90 backdrop-blur-lg shadow-xl min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Admin - Kelola Berita
      </h1>

      {/* ===================== */}
      {/* FORM INPUT */}
      {/* ===================== */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8 text-gray-700">
        <h2 className="text-xl font-semibold mb-4">Tambah Berita</h2>

        <div className="grid gap-4">
          <input
            type="text"
            placeholder="Judul"
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            type="text"
            placeholder="URL Gambar"
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />

          <textarea
            placeholder="Isi berita..."
            rows={5}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />

          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Tambah Berita
          </button>
        </div>
      </div>

      {/* ===================== */}
      {/* LIST DATA */}
      {/* ===================== */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-sm uppercase text-gray-500">
              <th className="px-4 py-2">Judul</th>
              <th className="px-4 py-2">Konten</th>
              <th className="px-4 py-2">Tanggal</th>
              <th className="px-4 py-2 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {news.map((item) => (
              <tr
                key={item.id}
                className="bg-white shadow-sm rounded-xl hover:shadow-md transition"
              >
                <td className="px-4 py-3 font-medium text-gray-700">
                  {editing?.id === item.id ? (
                    <input
                      className="border rounded-lg px-2 py-1 w-full"
                      value={editing.title}
                      onChange={(e) =>
                        setEditing({ ...editing, title: e.target.value })
                      }
                    />
                  ) : (
                    item.title
                  )}
                </td>

                <td className="px-4 py-3 font-medium text-gray-700">
                  {editing?.id === item.id ? (
                    <input
                      className="border rounded-lg px-2 py-1 w-full"
                      value={editing.content}
                      onChange={(e) =>
                        setEditing({ ...editing, content: e.target.value })
                      }
                    />
                  ) : (
                    item.content
                  )}
                </td>

                <td className="px-4 py-3 text-gray-500 text-sm">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString("id-ID")
                    : "-"}
                </td>

                <td className="px-4 py-3 text-center">
                  {editing?.id === item.id ? (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={handleUpdate}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="px-3 py-1 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setEditing(item)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
