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
import Swal from "sweetalert2";

import Header from "./Header";
export const dynamic = "force-dynamic";

type GMap = google.maps.Map | null;

type FloodArea = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  kedalaman: number;
  kondisi: 0 | 1 | 2;
};

type OrsRoute = {
  path: google.maps.LatLngLiteral[];
  distance: number; // meter
  duration: number; // detik
};

type Props = {
  routeLogId: number | null;
};

// const LIBRARIES = ["geometry", "visualization", "places"] ;

const center = { lat: -8.65, lng: 115.22 }; // default Bali tengah
const MAX_SAFE_DEPTH = 50; // cm batas aman untuk dilalui kendaraan
const USE_MAX_DEPTH = true;
const weights = {
  distance: 0.3,
  duration: 0.2,
  floodRisk: 0.1,
  floodDepth: 0.4,
}; // bobot untuk SAW, total harus 1

export default function EvakuasiGIS({ routeLogId }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["geometry", "visualization", "places"] as const,
    // libraries: ["geometry", "visualization", "places"],
  });

  const routeColors = ["#16a34a", "#e5eb03", "#ff1212"];
  const [orsPath, setOrsPath] = useState<google.maps.LatLngLiteral[]>([]);
  const [floodAreas, setFloodAreas] = useState<FloodArea[]>([]);
  const [map, setMap] = useState<GMap>(null);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      // alert("Browser tidak mendukung GPS");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Browser tidak mendukung GPS!",
      });
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
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Gagal mengambil lokasi: " + err.message,
        });
        // alert("Gagal mengambil lokasi: " + err.message);
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

  // const [routes, setRoutes] = useState<OrsRoute[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [activeRoute, setActiveRoute] = useState(0);
  const [hoveredFlood, setHoveredFlood] = useState<any>(null);

  const [weather, setWeather] = useState<any>(null);

  const [userName, setUserName] = useState("");

  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  const fetchComments = async (floodId: number) => {
    try {
      const res = await fetch(`/api/route-comments?flood_id=${floodId}`);

      const result = await res.json();

      if (result.success) {
        setComments(result.data);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error(err);
      setComments([]);
    }
  };
  // Kirim komentar
  const handleSubmit = async () => {
    if (!comment.trim()) {
      // alert("Komentar wajib diisi");
      Swal.fire({
        title: "Komentar wajib diisi",
        icon: "question",
      });
      return;
    }

    if (!hoveredFlood?.id) {
      // alert("Data banjir tidak ditemukan");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Data banjir tidak ditemukan",
      });
      return;
    }

    setLoading(true);

    const res = await fetch("/api/route-comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route_log_id: hoveredFlood.id,
        user_name: "userName", // ✅ variable, bukan string
        comment,
        is_admin: false,
      }),
    });

    const result = await res.json();

    if (result.success) {
      setComment("");
      // fetchComments();
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: result.error,
      });
      // alert(result.error);
    }

    setLoading(false);
  };

  // if (!routeLogId) {
  //   return (
  //     <div style={{ marginTop: 10, fontSize: 12 }}>
  //       Pilih history rute untuk melihat komentar
  //     </div>
  //   );
  // }

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

  function getDistanceFromLatLonInMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const R = 6371000; // radius bumi dalam meter
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    return d; // meter
  }

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  // helper: min > 0 (untuk cost yang bisa nol)
  function minPositive(values: number[]) {
    const positives = values.filter((v) => v > 0);
    return positives.length ? Math.min(...positives) : 0;
  }
  function calculateSAWOld(routes: any[], floods: FloodArea[]) {
    const alternatives = routes.map((r, index) => {
      const distance = r.properties.summary.distance;
      const duration = r.properties.summary.duration;

      const floodData = countFloodImpact(r.geometry.coordinates, floods);

      return {
        index,
        distance,
        duration,
        floodRisk: floodData.risk,
        floodDepth: floodData.totalDepth,
        blocked: floodData.blocked, // 🔥 baru
      };
    });

    const minDistance = Math.min(...alternatives.map((a) => a.distance));
    const minDuration = Math.min(...alternatives.map((a) => a.duration));
    const minFloodRisk = Math.min(...alternatives.map((a) => a.floodRisk));
    const minFloodDepth = Math.min(...alternatives.map((a) => a.floodDepth));

    const ranked = alternatives.map((a) => {
      if (a.blocked) {
        return { ...a, score: 0 }; // ❌ tidak bisa dilalui
      }

      const rDistance = minDistance / a.distance;
      const rDuration = minDuration / a.duration;
      const rFlood = minFloodRisk === 0 ? 1 : minFloodRisk / (a.floodRisk || 1);
      const rDepth =
        minFloodDepth === 0 ? 1 : minFloodDepth / (a.floodDepth || 1);

      const score =
        rDistance * weights.distance +
        rDuration * weights.duration +
        rFlood * weights.floodRisk +
        rDepth * weights.floodDepth;

      return { ...a, score };
    });

    console.log(ranked);

    ranked.sort((a, b) => b.score - a.score);

    return ranked;
  }

  function calculateSAW(routes: any[], floods: FloodArea[]) {
    const alternatives = routes.map((r, index) => {
      const distance = r.properties.summary.distance;
      const duration = r.properties.summary.duration;
      const floodData = countFloodImpact(r.geometry.coordinates, floods);
      console.log("floodData", floodData);
      return {
        index,
        distance,
        duration,
        floodRisk: floodData.risk, // 0,1,2 (0=terbaik)
        floodDepth: floodData.totalDepth, // cm (bisa nol)
        blocked: floodData.blocked,
      };
    });

    // edge case: jika kosong
    if (alternatives.length === 0) return [];

    // --- ambil nilai minimum untuk kriteria cost
    const minDistance = Math.min(...alternatives.map((a) => a.distance));
    const minDuration = Math.min(...alternatives.map((a) => a.duration));
    const minRiskPos = minPositive(alternatives.map((a) => a.floodRisk)); // >0 saja
    const minDepthPos = minPositive(alternatives.map((a) => a.floodDepth)); // >0 saja

    const ranked = alternatives.map((a) => {
      if (a.blocked) {
        return { ...a, score: 0 };
      }

      // cost normalization: min/x
      const rDistance = minDistance > 0 ? minDistance / a.distance : 1;
      const rDuration = minDuration > 0 ? minDuration / a.duration : 1;

      // Risk (0,1,2): rute dengan 0 -> skor 1 (terbaik), lainnya bandingkan dengan min positif
      let rFlood = 1;
      if (a.floodRisk === 0) {
        rFlood = 1;
      } else if (minRiskPos > 0) {
        rFlood = minRiskPos / a.floodRisk;
      } else {
        // semua rute 0? ya sudah 1
        rFlood = 1;
      }

      // Depth (cm): 0 -> 1; lainnya minPos/x
      let rDepth = 1;
      if (a.floodDepth === 0) {
        rDepth = 1;
      } else if (minDepthPos > 0) {
        rDepth = minDepthPos / a.floodDepth;
      } else {
        rDepth = 1;
      }

      const score =
        rDistance * weights.distance +
        rDuration * weights.duration +
        rFlood * weights.floodRisk +
        rDepth * weights.floodDepth;

      return { ...a, score };
    });

    console.log(ranked);

    ranked.sort((a, b) => b.score - a.score);
    return ranked;
  }

  function countFloodImpact(routeCoords: number[][], floods: FloodArea[]) {
    let risk: 0 | 1 | 2 = 0; // default paling aman (baik)
    let totalDepth = 0; // cm
    let blocked = false;

    for (const coord of routeCoords) {
      const [lng, lat] = coord;

      for (const f of floods) {
        const distance = getDistanceFromLatLonInMeters(lat, lng, f.lat, f.lng);

        if (distance < f.radius) {
          // totalDepth: jumlahkan kedalaman (satuan cm sudah benar dari DB)
          // totalDepth += Number(f.kedalaman || 0);

          const depth = Number(f.kedalaman || 0);
          if (USE_MAX_DEPTH) {
            totalDepth = Math.max(totalDepth, depth); // bahaya puncak
          } else {
            totalDepth += depth; // paparan total
          }

          // risk: gunakan nilai kondisi_jalan tertinggi yang terkena rute
          const r = Number(f.kondisi ?? 0) as 0 | 1 | 2;
          if (r > risk) risk = r;

          // blokir jika kedalaman melebihi ambang aman
          if (Number(f.kedalaman) > MAX_SAFE_DEPTH) {
            blocked = true;
          }
        }
      }
    }

    return { risk, totalDepth, blocked };
  }

  async function fetchORSRoute(
    start: LatLng,
    end: LatLng,
    floods: FloodArea[],
    useAvoid: boolean = false,
  ) {
    let body: any = {
      coordinates: [
        [start.lng, start.lat],
        [end.lng, end.lat],
      ],
      alternative_routes: {
        target_count: 3,
        weight_factor: 1.4,
        share_factor: 0.6,
      },
    };

    // 🔥 hanya tambahkan avoid kalau diminta
    if (useAvoid && floods.length > 0) {
      const polygons = floods.map((f) =>
        circleToPolygon(f.lat, f.lng, f.radius),
      );

      body.options = {
        avoid_polygons: {
          type: "MultiPolygon",
          coordinates: polygons.map((p) => [p]),
        },
      };
    }

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
      ? (meter / 1000).toFixed(1) + " km"
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

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem("evakuasi_session");

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("evakuasi_session", sessionId);
    }

    return sessionId;
  };

  const findNamePlaceStart = () => {
    if (!startAuto) return "";
    const place = startAuto.getPlace();
    return place?.name || place?.formatted_address || "";
  };

  const findNamePlaceEnd = () => {
    if (!endAuto) return "";
    const place = endAuto.getPlace();
    return place?.name || place?.formatted_address || "";
  };

  const insertRouteLog = async (route: any, index: number) => {
    if (!start || !end) return;

    try {
      const startName = findNamePlaceStart();
      const endName = findNamePlaceEnd();

      const res = await fetch("/api/route-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: getSessionId(),
          start_address: startName,
          start_lat: start.lat,
          start_lng: start.lng,
          end_address: endName,
          end_lat: end.lat,
          end_lng: end.lng,
          distance_km: route.distance / 1000,
          duration_min: route.duration / 60,
          selected_route_index: index,
        }),
      });

      if (!res.ok) throw new Error("Gagal simpan log");
    } catch (err) {
      console.error("Insert route error:", err);
    }
  };

  function removeDuplicateRoutes(features: any[]) {
    const unique: any[] = [];

    features.forEach((f) => {
      const exists = unique.find(
        (u) =>
          Math.abs(
            u.properties.summary.distance - f.properties.summary.distance,
          ) < 100 &&
          Math.abs(
            u.properties.summary.duration - f.properties.summary.duration,
          ) < 100,
      );

      if (!exists) unique.push(f);
    });

    return unique;
  }

  async function checkroute() {
    Swal.fire({
      title: "Loading",
      html: "Mohon tunggu sebentar...",

      didOpen: () => {
        Swal.showLoading();
      },
    });

    Swal.showLoading();
    Swal.hideLoading();
    if (!start || !end) return;

    console.log("Ambil route tanpa avoid...");
    const normalData = await fetchORSRoute(start, end, floodAreas, false);

    console.log("Ambil route dengan avoid...");
    const avoidData = await fetchORSRoute(start, end, floodAreas, true);

    let combinedFeatures: any[] = [];

    if (normalData?.features?.length) {
      combinedFeatures = [...normalData.features];
    }

    if (avoidData?.features?.length) {
      combinedFeatures = [...combinedFeatures, ...avoidData.features];
    }

    if (!combinedFeatures.length) {
      console.log("Tidak ada rute ditemukan sama sekali");
      return;
    }

    combinedFeatures = removeDuplicateRoutes(combinedFeatures);

    // 🔥 Hitung SAW dari semua route
    const ranking = calculateSAW(combinedFeatures, floodAreas);

    // 🔥 Ambil hanya 3 terbaik
    const topThree = ranking
      .filter((r) => !r.blocked) // hanya yang bisa dilalui
      .slice(0, 3);

    if (!topThree.length) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Semua Rute terblokir!",
      });

      return;
    }

    // 🔥 Convert ke format map
    const finalRoutes = topThree.map((rank) => {
      const feature = combinedFeatures[rank.index];

      return {
        path: feature.geometry.coordinates.map((c: number[]) => ({
          lng: c[0],
          lat: c[1],
        })),
        distance: feature.properties.summary.distance,
        duration: feature.properties.summary.duration,
        score: rank.score,
      };
    });
    Swal.close();
    setRoutes(finalRoutes);
    setActiveRoute(0); // paling aman
  }

  useEffect(() => {
    setRoutes([]);
    setActiveRoute(0);
  }, [start, end]);

  useEffect(() => {
    if (!calculate || !start || !end) return;

    let isCancelled = false;

    async function loadRoute() {
      try {
        checkroute();
      } catch (err) {
        console.error(err);
      }
    }

    loadRoute();

    return () => {
      isCancelled = true;
    };
  }, [calculate]);

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
          onClick={() => {
            checkroute();
          }}
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
                onClick={async () => {
                  setActiveRoute(i);
                  // fetchComments();

                  await insertRouteLog(r, i);
                }}
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
        <div className="absolute top-54 right-6 z-20 w-72 backdrop-blur-lg bg-white/80 border border-white/40 rounded-2xl shadow-xl p-5">
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
              strokeColor: routeColors[i % routeColors.length],
              strokeWeight: i === activeRoute ? 7 : 4,
              strokeOpacity: i === activeRoute ? 1 : 0.6,
              zIndex: i === activeRoute ? 999 : 1,
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
            onMouseOver={async () => {
              setHoveredFlood(f);
              await fetchComments(f.id);
            }}
            onMouseOut={async () => {
              setHoveredFlood(null);
              setComments([]);
            }}
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
              <div>Kedalaman: {hoveredFlood.kedalaman} cm</div>
              {/* List Komentar */}
              <br></br>
              <b>Ulasan</b>
              <div
                style={{
                  marginTop: 8,
                  maxHeight: 200,
                  overflowY: "auto",
                  background: "#f8fafc",
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                {comments.length === 0 && (
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    Belum ada komentar
                  </div>
                )}

                {comments.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: c.is_admin ? "#eef2ff" : "white",
                      padding: 8,
                      borderRadius: 8,
                      marginBottom: 6,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div style={{ fontWeight: "bold", fontSize: 12 }}>
                      {c.user_name} {c.is_admin && "(Admin)"}
                    </div>

                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      {c.comment}
                    </div>
                  </div>
                ))}
              </div>
              <textarea
                placeholder="Bagikan kondisi jalur..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 6,
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  marginTop: 8,
                  width: "100%",
                  padding: 8,
                  background: "#2563eb",
                  color: "white",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                {loading ? "Mengirim..." : "Kirim Komentar"}
              </button>
            </div>
          </InfoWindow>
        )}

        {start && <Marker position={start} label="A" />}
        {end && <Marker position={end} label="B" />}
      </GoogleMap>
    </div>
  );
}
