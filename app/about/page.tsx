"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-indigo-600">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
          About Admin
        </h2>
      </div>
    </div>
  );
}
