"use client";

import { useEffect, useMemo, useState } from "react";

// Define the FloodArea type
type FloodArea = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  radius: number;
};
// Removed unused imports

function FloodDataList() {
  const [floods, setFloods] = useState<FloodArea[]>([]);
  const [editing, setEditing] = useState<FloodArea | null>(null);

  const fetchFloods = () => {
    fetch("/api/flood-areas")
      .then((res) => res.json())
      .then(setFloods)
      .catch(console.error);
  };

  useEffect(() => {
    fetchFloods();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus data banjir ini?")) return;
    const res = await fetch("/api/flood-areas", {
      method: "DELETE",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.success) fetchFloods();
    else alert("Gagal hapus: " + data.error);
  };

  const handleEditSave = async () => {
    if (!editing) return;
    const res = await fetch("/api/flood-areas", {
      method: "PUT",
      body: JSON.stringify(editing),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.success) {
      fetchFloods();
      setEditing(null);
    } else alert("Gagal update: " + data.error);
  };

  return (
    <div className="p-6 bg-white/90 backdrop-blur-lg shadow-xl overflow-auto h-full">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Data Banjir</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-sm uppercase text-gray-500">
              <th className="px-4 py-2">Nama</th>
              <th className="px-4 py-2">Latitude</th>
              <th className="px-4 py-2">Longitude</th>
              <th className="px-4 py-2">Radius (m)</th>
              <th className="px-4 py-2 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {floods.map((f) => (
              <tr
                key={f.id}
                className="bg-white shadow-sm rounded-xl hover:shadow-md transition"
              >
                {/* Nama */}
                <td className="px-4 py-3 text-gray-700 font-medium">
                  {editing?.id === f.id ? (
                    <input
                      className="border rounded-lg px-2 py-1 w-full focus:ring-2 focus:ring-blue-400 outline-none"
                      value={editing.name}
                      onChange={(e) =>
                        setEditing({ ...editing, name: e.target.value })
                      }
                    />
                  ) : (
                    f.name
                  )}
                </td>

                {/* Latitude */}
                <td className="px-4 py-3 text-gray-600">
                  {editing?.id === f.id ? (
                    <input
                      type="number"
                      className="border rounded-lg px-2 py-1 w-full focus:ring-2 focus:ring-blue-400 outline-none"
                      value={editing.lat}
                      onChange={(e) =>
                        setEditing({ ...editing, lat: Number(e.target.value) })
                      }
                    />
                  ) : (
                    f.lat
                  )}
                </td>

                {/* Longitude */}
                <td className="px-4 py-3 text-gray-600">
                  {editing?.id === f.id ? (
                    <input
                      type="number"
                      className="border rounded-lg px-2 py-1 w-full focus:ring-2 focus:ring-blue-400 outline-none"
                      value={editing.lng}
                      onChange={(e) =>
                        setEditing({ ...editing, lng: Number(e.target.value) })
                      }
                    />
                  ) : (
                    f.lng
                  )}
                </td>

                {/* Radius */}
                <td className="px-4 py-3 text-gray-600">
                  {editing?.id === f.id ? (
                    <input
                      type="number"
                      className="border rounded-lg px-2 py-1 w-full focus:ring-2 focus:ring-blue-400 outline-none"
                      value={editing.radius}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          radius: Number(e.target.value),
                        })
                      }
                    />
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-sm">
                      {f.radius} m
                    </span>
                  )}
                </td>

                {/* Aksi */}
                <td className="px-4 py-3 text-center">
                  {editing?.id === f.id ? (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={handleEditSave}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="px-3 py-1 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setEditing(f)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
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
export default FloodDataList;
