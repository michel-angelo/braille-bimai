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
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Resource Hints & Preconnect for Fast Loading */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://analytics.tiktok.com" crossOrigin="anonymous" />

        {/* RemixIcon CDN untuk ikon interaktif yang tajam */}
        <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet" />
        
        {/* TikTok Pixel Integration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
                var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
                ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

                ttq.load('D9ECINRC77UBS5FSH6M0');
                ttq.page();
              }(window, document, 'ttq');
            `
          }}
        />

        {/* Meta Pixel (Facebook Ads) Integration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1023891886904648');
              fbq('track', 'PageView');
            `
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
