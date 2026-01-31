"use client";

import { useEffect, useState } from "react";
import { GoogleMap, Circle, useJsApiLoader } from "@react-google-maps/api";

type LatLng = { lat: number; lng: number };

type FloodArea = {
  id: number;
  name: string;
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
      style={{ padding: 20, color: "white", overflowY: "auto", height: "100%" }}
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

export default function AdminFloodMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const center = { lat: -8.65, lng: 115.22 };
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [markerPos, setMarkerPos] = useState<LatLng>({
    lat: -8.65,
    lng: 115.22,
  });
  const [radius, setRadius] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [floods, setFloods] = useState<FloodArea[]>([]);

  const fetchFloods = () => {
    fetch("/api/flood-areas")
      .then((res) => res.json())
      .then((data: FloodArea[]) => setFloods(data))
      .catch(console.error);
  };

  // Marker khusus untuk add data
  const [newMarker, setNewMarker] = useState<google.maps.Marker | null>(null);

  const [activeMenu, setActiveMenu] = useState<"dashboard" | "data">(
    "dashboard",
  );
  useEffect(() => {
    if (!map) return;

    // Ambil semua data banjir
    fetchFloods();

    // Buat marker drag untuk tambah data baru
    if (!newMarker) {
      const marker = new google.maps.Marker({
        position: markerPos,
        map,
        draggable: true,
        title: "BANJIR",
        label: "B",
      });

      marker.addListener("dragend", () => {
        const pos = marker.getPosition();
        if (pos) setMarkerPos({ lat: pos.lat(), lng: pos.lng() });

        setRadius(200);
      });
      setNewMarker(marker);
    }

    return () => {
      newMarker?.setMap(null);
    };
  }, [map]);

  if (!isLoaded) return <div>Loading Map...</div>;

  const handleSave = async () => {
    if (!name) return alert("Nama lokasi wajib diisi");

    const res = await fetch("/api/flood-areas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        lat: markerPos.lat,
        lng: markerPos.lng,
        radius,
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert("Data banjir berhasil disimpan!");
      setName(""); // reset form
      fetchFloods(); // 🔹 reload data banjir
    } else {
      alert("Error: " + data.error);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        color: "white",
      }}
    >
      {/* Header Admin */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: 60,
          background: "#2563eb",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          fontWeight: "bold",
          zIndex: 20,
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        <div>Sistem Admin Banjir</div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setActiveMenu("dashboard")}
            style={{
              background:
                activeMenu === "dashboard" ? "#1d4ed8" : "transparent",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveMenu("data")}
            style={{
              background: activeMenu === "data" ? "#1d4ed8" : "transparent",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Data
          </button>
        </div>
      </div>

      {/* Konten */}
      <div
        style={{
          width: "100%",
          height: "100vh",
          position: "relative",
          paddingTop: 60,
        }}
      >
        {activeMenu === "dashboard" && (
          <>
            {/* Panel Add Data */}
            <div
              style={{
                position: "absolute",
                top: 120,
                left: 12,
                zIndex: 10,
                background: "white",
                padding: 12,
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                width: 280,
              }}
            >
              <h4 style={{ color: "black" }}>Tambah Data Banjir</h4>{" "}
              <input
                type="text"
                placeholder="Nama lokasi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 6,
                  color: "black",
                }}
              />{" "}
              <label style={{ marginTop: 6, display: "block", color: "black" }}>
                {" "}
                Radius (meter): {radius}{" "}
              </label>{" "}
              <input
                type="range"
                min={50}
                max={1000}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                style={{ width: "100%", color: "black" }}
              />{" "}
              <button
                onClick={handleSave}
                style={{
                  marginTop: 10,
                  width: "100%",
                  padding: 8,
                  background: "#2563eb",
                  color: "white",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {" "}
                Simpan{" "}
              </button>
            </div>

            {/* Map */}
            <div
              style={{ width: "100%", height: "100%", position: "relative" }}
            >
              <GoogleMap
                center={center}
                zoom={13}
                mapContainerStyle={{ width: "100%", height: "100%" }}
                onLoad={(m) => setMap(m)}
              >
                {/* Render semua data banjir */}
                {floods.map((f) => (
                  <Circle
                    key={f.id}
                    center={{ lat: f.lat, lng: f.lng }}
                    radius={f.radius}
                    options={{
                      fillColor: "#ef4444",
                      fillOpacity: 0.25,
                      strokeColor: "#b91c1c",
                      strokeWeight: 2,
                    }}
                  />
                ))}

                {/* Marker drag untuk add data */}
                {newMarker && (
                  <Circle
                    center={markerPos}
                    radius={radius}
                    options={{
                      fillColor: "#2563eb",
                      fillOpacity: 0.25,
                      strokeColor: "#1d4ed8",
                      strokeWeight: 2,
                    }}
                  />
                )}
              </GoogleMap>
            </div>
          </>
        )}

        {activeMenu === "data" && <FloodDataList />}
      </div>
    </div>
  );
}
