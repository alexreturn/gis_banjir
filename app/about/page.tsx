"use client";

import Header from "../components/Header";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <section className="bg-gradient-to-r from-blue-500 to-indigo-600 pt-32 pb-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">About System</h2>
          <p className="text-lg opacity-90 md:text-xl">
            Sistem Pendukung Keputusan Jalur Alternatif berbasis GIS membantu
            masyarakat menentukan jalur aman pada daerah rawan banjir di Kota
            Denpasar.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h3 className="mb-6 text-3xl font-bold text-gray-800">
          Tentang Penelitian
        </h3>

        <p className="mx-auto max-w-3xl leading-relaxed text-gray-600">
          Sistem ini dikembangkan sebagai Sistem Pendukung Keputusan (SPK)
          berbasis Geographic Information System (GIS) untuk memberikan
          rekomendasi jalur alternatif yang dapat digunakan masyarakat dalam
          menghindari wilayah rawan banjir di Kota Denpasar. Sistem memanfaatkan
          metode Simple Additive Weighting (SAW) untuk melakukan perangkingan
          jalur secara objektif.
        </p>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-2">
          <div className="rounded-2xl bg-gray-50 p-8 shadow-md transition hover:shadow-lg">
            <h4 className="mb-4 text-2xl font-semibold text-blue-600">Visi</h4>
            <p className="text-gray-600">
              Mengembangkan sistem pendukung keputusan berbasis GIS yang mampu
              membantu masyarakat dalam menentukan jalur perjalanan pada kondisi
              banjir.
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-8 shadow-md transition hover:shadow-lg">
            <h4 className="mb-4 text-2xl font-semibold text-blue-600">Misi</h4>
            <ul className="ml-5 list-disc space-y-2 text-left text-gray-600">
              <li>
                Menyediakan informasi jalur alternatif berbasis peta digital.
              </li>
              <li>Mengintegrasikan GIS dan metode SAW.</li>
              <li>Meningkatkan kemudahan akses informasi bagi masyarakat.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h3 className="mb-12 text-3xl font-bold text-gray-800">
            Pengembang Sistem
          </h3>

          <div className="flex justify-center">
            <div className="w-80 rounded-2xl bg-white p-8 shadow-lg transition hover:shadow-xl">
              <img
                src="/angga.jpeg"
                alt="Developer"
                className="mx-auto mb-4 h-40 w-40 rounded-full object-cover"
              />

              <h4 className="text-xl font-semibold text-gray-800">
                Kadek Angga Dwiastra
              </h4>

              <p className="mb-2 text-sm text-gray-500">NIM : 220010177</p>

              <p className="text-sm text-gray-600">
                Program Studi Sistem Komputer
              </p>

              <p className="mt-2 text-sm text-gray-600">
                📧 kadekangga0000@gmail.com
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto bg-gray-900 py-6 text-center text-gray-300">
        <p>© 2026 SPK Jalur Alternatif Berbasis GIS Kota Denpasar</p>
      </footer>
    </div>
  );
}
