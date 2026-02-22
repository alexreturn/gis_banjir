"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GoogleMap,
  Marker,
  Circle,
  useJsApiLoader,
  Autocomplete,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";

import Header from "./Header";

type GMap = google.maps.Map | null;

type FloodArea = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  radius: number;
};

type OrsRoute = {
  path: google.maps.LatLngLiteral[];
  distance: number; // meter
  duration: number; // detik
};

const LIBRARIES = ["geometry", "visualization", "places"] as const;
const center = { lat: -8.65, lng: 115.22 };

export default function EvakuasiGIS() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBRARIES,
  });

  const [orsPath, setOrsPath] = useState<google.maps.LatLngLiteral[]>([]);
  const [floodAreas, setFloodAreas] = useState<FloodArea[]>([]);
  const [map, setMap] = useState<GMap>(null);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung GPS");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStart({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });

        // optional: zoom ke posisi user
        map?.panTo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        map?.setZoom(15);

        const geocoder = new google.maps.Geocoder();

        geocoder.geocode(
          { location: { lat: pos.coords.latitude, lng: pos.coords.longitude } },
          (results, status) => {
            if (status === "OK" && results?.[0]) {
              const input = document.querySelector<HTMLInputElement>(
                'input[placeholder="Posisi sekarang"]',
              );
              if (input) input.value = results[0].formatted_address;
            }
          },
        );
      },
      (err) => {
        alert("Gagal mengambil lokasi: " + err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  useEffect(() => {
    fetch("/api/flood-areas")
      .then((res) => res.json())
      .then(setFloodAreas)
      .catch(console.error);
  }, []);

  type LatLng = { lat: number; lng: number };
  const [start, setStart] = useState<LatLng | null>(null);
  const [end, setEnd] = useState<LatLng | null>(null);
  const [startAuto, setStartAuto] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [endAuto, setEndAuto] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [calculate, setCalculate] = useState(false);

  const [routes, setRoutes] = useState<OrsRoute[]>([]);
  const [activeRoute, setActiveRoute] = useState(0);
  const [hoveredFlood, setHoveredFlood] = useState<any>(null);

  const [weather, setWeather] = useState<any>(null);

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=id&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_KEY}`,
      );

      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error("Gagal ambil cuaca:", err);
    }
  };
  const onStartPlaceChanged = () => {
    if (!startAuto) return;
    const place = startAuto.getPlace();
    if (!place.geometry) return;
    setStart({
      lat: place.geometry.location!.lat(),
      lng: place.geometry.location!.lng(),
    });
  };

  const onEndPlaceChanged = () => {
    if (!endAuto) return;
    const place = endAuto.getPlace();
    if (!place.geometry) return;
    setEnd({
      lat: place.geometry.location!.lat(),
      lng: place.geometry.location!.lng(),
    });
  };

  function circleToPolygon(
    lat: number,
    lng: number,
    radiusMeter: number,
    points = 20,
  ) {
    const coords = [];
    const earthRadius = 6378137;

    for (let i = 0; i < points; i++) {
      const angle = (i * 360) / points;
      const rad = (angle * Math.PI) / 180;

      const dLat = (radiusMeter * Math.cos(rad)) / earthRadius;
      const dLng =
        (radiusMeter * Math.sin(rad)) /
        (earthRadius * Math.cos((lat * Math.PI) / 180));

      coords.push([lng + (dLng * 180) / Math.PI, lat + (dLat * 180) / Math.PI]);
    }

    coords.push(coords[0]); // close polygon
    return coords;
  }

  async function fetchORSRoute(
    start: LatLng,
    end: LatLng,
    floods: FloodArea[],
  ) {
    const polygons = floods.map((f) => circleToPolygon(f.lat, f.lng, f.radius));

    const body = {
      coordinates: [
        [start.lng, start.lat],
        [end.lng, end.lat],
      ],
      options: {
        avoid_polygons: {
          type: "MultiPolygon",
          coordinates: polygons.map((p) => [p]),
        },
      },
      alternative_routes: {
        target_count: 3,
        weight_factor: 1.4,
        share_factor: 0.6,
      },
    };

    const res = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        method: "POST",
        headers: {
          Authorization: process.env.NEXT_PUBLIC_ORS_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    return res.json();
  }
  function formatDistance(meter: number) {
    return meter >= 1000
      ? (meter / 1000).toFixed(2) + " km"
      : Math.round(meter) + " m";
  }

  function formatDuration(seconds: number) {
    const min = Math.round(seconds / 60);
    return min < 60
      ? `${min} menit`
      : `${Math.floor(min / 60)} jam ${min % 60} menit`;
  }

  useEffect(() => {
    if (center) {
      fetchWeather(center.lat, center.lng);
    }
  }, [center]);

  useEffect(() => {
    if (!calculate || !start || !end || !floodAreas.length) return;

    fetchORSRoute(start, end, floodAreas)
      .then((data) => {
        const parsedRoutes: OrsRoute[] = data.features.map((feature: any) => ({
          path: feature.geometry.coordinates.map((c: number[]) => ({
            lng: c[0],
            lat: c[1],
          })),
          distance: feature.properties.summary.distance,
          duration: feature.properties.summary.duration,
        }));

        setRoutes(parsedRoutes);
        setActiveRoute(0);
      })
      .catch(console.error);
  }, [calculate, start, end, floodAreas]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <Header />
      {/* Sidebar untuk rute */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 12,
          zIndex: 10,
          background: "white",
          padding: 12,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,.15)",
          width: 300,
        }}
      >
        <strong style={{ color: "black" }}>Rute Alternatif Aman</strong>

        <div style={{ position: "relative", marginTop: 8 }}>
          <Autocomplete
            onLoad={(a) => setStartAuto(a)}
            onPlaceChanged={onStartPlaceChanged}
          >
            <input
              type="text"
              placeholder="Posisi sekarang"
              style={{
                width: "100%",
                padding: "6px 40px 6px 8px", // ruang untuk tombol
                color: "black",
              }}
            />
          </Autocomplete>

          <button
            onClick={getUserLocation}
            title="Gunakan lokasi saya"
            style={{
              position: "absolute",
              right: 4,
              top: "50%",
              transform: "translateY(-50%)",
              width: 32,
              height: 32,
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            📍
          </button>
        </div>

        <Autocomplete
          onLoad={(a) => setEndAuto(a)}
          onPlaceChanged={onEndPlaceChanged}
        >
          <input
            type="text"
            placeholder="Tujuan"
            style={{ width: "100%", marginTop: 8, padding: 6, color: "black" }}
          />
        </Autocomplete>

        <button
          onClick={() => setCalculate(true)}
          disabled={!start || !end}
          style={{
            marginTop: 10,
            width: "100%",
            padding: 8,
            background: "#2563eb",
            color: "white",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            opacity: !start || !end ? 0.6 : 1,
          }}
        >
          Cek Rute Aman
        </button>

        {/* Pilih rute alternatif */}
        {routes.length > 1 && (
          <div style={{ marginTop: 12 }}>
            <strong style={{ color: "black" }}>Pilih Rute Aman:</strong>

            {routes.map((r, i) => (
              <button
                key={i}
                onClick={() => setActiveRoute(i)}
                style={{
                  marginTop: 6,
                  width: "100%",
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: i === activeRoute ? "#eef2ff" : "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 13,
                  color: "black",
                }}
              >
                <div>
                  <strong style={{ color: "black" }}>
                    Rute-{i + 1} {" | "} 📏 {formatDistance(r.distance)} {" | "}
                    ⏱ {formatDuration(r.duration)}
                  </strong>
                </div>
                <div style={{ color: "black" }}></div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Weather Info Panel */}
      {/* Weather Panel */}
      {weather && (
        <div className="absolute top-24 right-6 z-20 w-72 backdrop-blur-lg bg-white/80 border border-white/40 rounded-2xl shadow-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Perkiraan Cuaca
              </h2>
              <p className="text-sm text-gray-500">{weather.name}</p>
            </div>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt="icon"
              className="w-14 h-14"
            />
          </div>

          <div className="mt-4 space-y-3 text-gray-700">
            <div className="flex justify-between">
              <span>🌥 Kondisi</span>
              <span className="font-semibold capitalize">
                {weather.weather[0].description}
              </span>
            </div>

            <div className="flex justify-between">
              <span>🌡 Temperatur</span>
              <span className="font-semibold">
                {Math.round(weather.main.temp)}°C
              </span>
            </div>

            <div className="flex justify-between">
              <span>💧 Kelembaban</span>
              <span className="font-semibold">{weather.main.humidity}%</span>
            </div>

            <div className="flex justify-between">
              <span>🌬 Kecepatan Angin</span>
              <span className="font-semibold">{weather.wind.speed} m/s</span>
            </div>
          </div>
        </div>
      )}

      <GoogleMap
        center={center}
        zoom={12}
        mapContainerStyle={{ width: "100%", height: "90%" }}
        onLoad={setMap}
      >
        {routes.map((r, i) => (
          <Polyline
            key={i}
            path={r.path}
            options={{
              strokeColor: i === activeRoute ? "#2563eb" : "#94a3b8",
              strokeWeight: i === activeRoute ? 6 : 4,
              strokeOpacity: i === activeRoute ? 1 : 0.5,
            }}
          />
        ))}

        {floodAreas.map((f) => (
          <Circle
            key={f.id}
            center={{ lat: f.lat, lng: f.lng }}
            radius={f.radius}
            options={{
              fillColor: "#ef4444",
              fillOpacity: 0.25,
              strokeColor: "#b91c1c",
            }}
            onMouseOver={() => setHoveredFlood(f)}
            onMouseOut={() => setHoveredFlood(null)}
          />
        ))}
        {hoveredFlood && (
          <InfoWindow
            position={{ lat: hoveredFlood.lat, lng: hoveredFlood.lng }}
            options={{ disableAutoPan: true, headerDisabled: true }}
          >
            <div style={{ color: "black" }}>
              <strong>{hoveredFlood.name}</strong>
              <div>Radius: {hoveredFlood.radius} m</div>
            </div>
          </InfoWindow>
        )}

        {start && <Marker position={start} label="A" />}
        {end && <Marker position={end} label="B" />}
      </GoogleMap>
    </div>
  );
}
