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
    <div
      style={{ padding: 20, color: "black", overflowY: "auto", height: "100%" }}
    >
      <h3>Data Banjir</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ccc" }}>
            <th>Nama</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Radius</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {floods.map((f) => (
            <tr key={f.id} style={{ borderBottom: "1px solid #eee" }}>
              <td>
                {editing?.id === f.id ? (
                  <input
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                  />
                ) : (
                  f.name
                )}
              </td>
              <td>
                {editing?.id === f.id ? (
                  <input
                    type="number"
                    value={editing.lat}
                    onChange={(e) =>
                      setEditing({ ...editing, lat: Number(e.target.value) })
                    }
                  />
                ) : (
                  f.lat
                )}
              </td>
              <td>
                {editing?.id === f.id ? (
                  <input
                    type="number"
                    value={editing.lng}
                    onChange={(e) =>
                      setEditing({ ...editing, lng: Number(e.target.value) })
                    }
                  />
                ) : (
                  f.lng
                )}
              </td>
              <td>
                {editing?.id === f.id ? (
                  <input
                    type="number"
                    value={editing.radius}
                    onChange={(e) =>
                      setEditing({ ...editing, radius: Number(e.target.value) })
                    }
                  />
                ) : (
                  f.radius
                )}
              </td>
              <td>
                {editing?.id === f.id ? (
                  <>
                    <button onClick={handleEditSave} style={{ marginRight: 6 }}>
                      Simpan
                    </button>
                    <button onClick={() => setEditing(null)}>Batal</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditing(f)}
                      style={{ marginRight: 6 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
                      style={{ color: "red" }}
                    >
                      Hapus
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default FloodDataList;
