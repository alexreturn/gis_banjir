import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPK Jalur Alternatif Berbasis GIS",
  description: "SPK Jalur Alternatif Berbasis GIS untuk Banjir di Bali",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* Container elemen Google Translate (boleh diletakkan di body juga) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement(
                  {
                    pageLanguage: 'id',
                    autoDisplay: false,
                    includedLanguages: 'id,en', // batasi sesuai pilihan dropdown
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                  },
                  'google_translate_element'
                );
              }
            `,
          }}
        />
        <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Elemen ini tidak harus terlihat; bisa kamu sembunyikan */}
        <div id="google_translate_element" className="hidden" />

        {children}
      </body>
    </html>
  );
}
