"use client";

import { useEffect, useState } from "react";
import { GoogleMap, Circle, useJsApiLoader } from "@react-google-maps/api";
import FloodDataList from "./FloodDataList";
import AdminNews from "./adminNews";
import { useRouter } from "next/navigation";

type LatLng = { lat: number; lng: number };

type FloodArea = {
  id: number;
  name: string;
  kedalaman: number;
  kondisi: number;
  lat: number;
  lng: number;
  radius: number;
};

export default function AdminFloodMap() {
  const router = useRouter();
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
  const [kedalaman, setKedalaman] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [floods, setFloods] = useState<FloodArea[]>([]);

  const [kondisiJalan, setKondisiJalan] = useState(0); // 0=Baik, 1=Sedang, 2=Rusak

  const fetchFloods = () => {
    fetch("/api/flood-areas")
      .then((res) => res.json())
      .then((data: FloodArea[]) => setFloods(data))
      .catch(console.error);
  };

  // Marker khusus untuk add data
  const [newMarker, setNewMarker] = useState<google.maps.Marker | null>(null);

  const [activeMenu, setActiveMenu] = useState<"dashboard" | "data" | "news">(
    "dashboard",
  );
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("user", user);
    if (!user) {
      return router.push("/login");
    }

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
    const user_updated = JSON.parse(localStorage.getItem("id"));

    const res = await fetch("/api/flood-areas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        kedalaman,
        user_updated,
        lat: markerPos.lat,
        lng: markerPos.lng,
        radius,
        kondisi: kondisiJalan,
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
          <button
            onClick={() => setActiveMenu("news")}
            style={{
              background: activeMenu === "news" ? "#1d4ed8" : "transparent",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            News
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
          color: "white",
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
                Kedalaman Banjir : {kedalaman}
                {" cm"}
              </label>{" "}
              <input
                type="range"
                min={0}
                max={100}
                value={kedalaman}
                onChange={(e) => setKedalaman(Number(e.target.value))}
                style={{ width: "100%", color: "black" }}
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
              {/* ▼ Dropdown Kondisi Jalan */}
              <label
                style={{ marginTop: 10, display: "block", color: "black" }}
              >
                Kondisi Jalan
              </label>
              <select
                value={kondisiJalan}
                onChange={(e) => setKondisiJalan(Number(e.target.value))}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 8,
                  color: "black",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  background: "white",
                }}
              >
                <option value={0}>0 - Baik</option>
                <option value={1}>1 - Sedang</option>
                <option value={2}>2 - Rusak</option>
              </select>
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
        {activeMenu === "news" && <AdminNews />}
      </div>
    </div>
  );
}
