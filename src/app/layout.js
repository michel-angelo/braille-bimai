import "./globals.css";

export const metadata = {
  title: "Wakaf Al-Qur'an Braille - Terangi Hati Sahabat Tunanetra | BIMAI",
  description: "Bantu sahabat tunanetra beribadah secara mandiri. Salurkan wakaf mushaf Al-Qur'an Braille terbaik Anda bersama Yayasan Bina Masyarakat Indonesia (BIMAI) secara mudah dan amanah.",
  keywords: [
    "wakaf alquran braille",
    "wakaf tunanetra",
    "donasi alquran braille",
    "yayasan bimai",
    "bina masyarakat indonesia",
    "donasi online",
    "sedekah jariyah",
    "wakaf quran",
    "tunanetra mengaji"
  ],
  authors: [{ name: "Yayasan Bina Masyarakat Indonesia", url: "https://bimaipeduli.id" }],
  creator: "Yayasan BIMAI",
  publisher: "Yayasan BIMAI",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/images/bimai.ico",
    shortcut: "/images/bimai.ico",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* RemixIcon CDN untuk ikon interaktif yang tajam */}
        <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
