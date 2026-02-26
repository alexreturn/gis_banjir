"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/admin"); // redirect ke admin dashboard
      } else {
        setError(data.error || "Login gagal");
      }
    } catch (e) {
      setError("Terjadi error, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-indigo-600">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
          Login Admin
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 text-gray-800">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
