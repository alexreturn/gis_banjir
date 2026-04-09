"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";

type FloodArea = {
  id: number;
  name: string;
  kedalaman: number;
  lat: number;
  lng: number;
  radius: number;
};

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

  return (
    <div className="w-full min-h-screen bg-gray-100 text-gray-900">
      <Header />

      <div className="p-6 max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold mb-6">Data Banjir</h3>

        {/* TABLE WRAPPER */}
        <div className="overflow-x-auto bg-white p-4 rounded-xl shadow">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="text-left text-sm uppercase text-gray-500 border-b">
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">Latitude</th>
                <th className="px-4 py-2">Longitude</th>
                <th className="px-4 py-2">Radius (m)</th>
                <th className="px-4 py-2">Kedalaman (cm)</th>
              </tr>
            </thead>

            <tbody>
              {floods.map((f) => (
                <tr
                  key={f.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  {/* Nama */}
                  <td className="px-4 py-3 font-medium">
                    {editing?.id === f.id ? (
                      <input
                        className="border rounded-lg px-2 py-1 w-full"
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
                  <td className="px-4 py-3">
                    {editing?.id === f.id ? (
                      <input
                        type="number"
                        className="border rounded-lg px-2 py-1 w-full"
                        value={editing.lat}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            lat: Number(e.target.value),
                          })
                        }
                      />
                    ) : (
                      f.lat
                    )}
                  </td>

                  {/* Longitude */}
                  <td className="px-4 py-3">
                    {editing?.id === f.id ? (
                      <input
                        type="number"
                        className="border rounded-lg px-2 py-1 w-full"
                        value={editing.lng}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            lng: Number(e.target.value),
                          })
                        }
                      />
                    ) : (
                      f.lng
                    )}
                  </td>

                  {/* Radius */}
                  <td className="px-4 py-3">
                    {editing?.id === f.id ? (
                      <input
                        type="number"
                        className="border rounded-lg px-2 py-1 w-full"
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

                  {/* Kedalaman */}
                  <td className="px-4 py-3">
                    {editing?.id === f.id ? (
                      <input
                        type="number"
                        className="border rounded-lg px-2 py-1 w-full"
                        value={editing.kedalaman}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            kedalaman: Number(e.target.value),
                          })
                        }
                      />
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-sm">
                        {f.kedalaman} cm
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FloodDataList;