import "./globals.css";

export const metadata = {
  title: "Wakaf Al-Qur'an Braille - Terangi Hati Sahabat Tunanetra | BIMAI",
  description: "Hadirkan kemandirian ibadah bagi disabilitas netra. Salurkan wakaf Al-Qur'an Braille terbaik Anda bersama Yayasan Bina Masyarakat Indonesia (BIMAI) secara mudah dan amanah.",
  icons: {
    icon: "/images/bimai.ico",
    shortcut: "/images/bimai.ico",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        {/* RemixIcon CDN untuk ikon interaktif yang tajam */}
        <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
