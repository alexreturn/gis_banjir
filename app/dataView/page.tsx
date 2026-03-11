"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";

// Define the FloodArea type
type FloodArea = {
  id: number;
  name: string;
  kedalaman: number;
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

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        color: "white",
        backgroundColor: "white",
      }}
    >
      <Header />
      {/* Sidebar untuk rute */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Data Banjir</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-sm uppercase text-gray-500">
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
                  <td className="px-4 py-3 text-gray-600">
                    {editing?.id === f.id ? (
                      <input
                        type="number"
                        className="border rounded-lg px-2 py-1 w-full focus:ring-2 focus:ring-blue-400 outline-none"
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
                  {/* Kedalaman */}
                  <td className="px-4 py-3 text-gray-600">
                    {editing?.id === f.id ? (
                      <input
                        type="number"
                        className="border rounded-lg px-2 py-1 w-full focus:ring-2 focus:ring-blue-400 outline-none"
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
