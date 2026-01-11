import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "FireSend - Automatización de Instagram con IA",
    template: "%s | FireSend",
  },
  description:
    "Automatiza tu Instagram con inteligencia artificial. Responde mensajes, califica leads y cierra ventas 24/7. Potenciado por Gemini AI.",
  keywords: [
    "automatización instagram",
    "bot instagram",
    "respuestas automáticas",
    "instagram business",
    "IA instagram",
    "chatbot instagram",
    "marketing automation",
    "leads instagram",
    "CRM instagram",
  ],
  authors: [{ name: "FireforgeRD", url: "https://fireforgerd.com" }],
  creator: "FireforgeRD",
  publisher: "FireforgeRD",
  metadataBase: new URL("https://firesend.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://firesend.app",
    siteName: "FireSend",
    title: "FireSend - Automatización de Instagram con IA",
    description:
      "Automatiza tu Instagram con inteligencia artificial. Responde mensajes, califica leads y cierra ventas 24/7.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FireSend - Automatización de Instagram",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FireSend - Automatización de Instagram con IA",
    description:
      "Automatiza tu Instagram con inteligencia artificial. Responde mensajes, califica leads y cierra ventas 24/7.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "G-N2XPDEYDDZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-P3FX3KNW');`}
        </Script>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-N2XPDEYDDZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-N2XPDEYDDZ');
          gtag('config', 'GT-K4LNQRV7');`}
        </Script>
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P3FX3KNW"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
