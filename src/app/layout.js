import "./globals.css";
import Script from "next/script";

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
  const pixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* RemixIcon CDN untuk ikon interaktif yang tajam */}
        <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet" />
        
        {/* TikTok Pixel Integration */}
        {pixelId && (
          <Script id="tiktok-pixel" strategy="afterInteractive">
            {`
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent","trackSingle","trackSingleAndDefer"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=r+"?sdkid="+e+(o?"&partner="+o:"");var c=document.getElementsByTagName("script")[0];c.parentNode.insertBefore(a,c)};
                ttq.load('${pixelId}');
                ttq.page();
              }(window, document, 'ttq');
            `}
          </Script>
        )}
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
