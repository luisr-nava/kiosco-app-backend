import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
// @ts-expect-error - CSS module declarations are provided by Next.js at build time
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kioscoapp.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kiosco App | Punto de venta y gestión para tu negocio",
    template: "%s | Kiosco App",
  },
  description:
    "Kiosco App es un sistema de gestión integral con punto de venta, inventario, compras y reportes para tiendas y kioscos.",
  applicationName: "Kiosco App",
  keywords: [
    "punto de venta",
    "POS",
    "inventario",
    "kiosco",
    "ventas",
    "compras",
    "facturación",
    "gestión de tiendas",
  ],
  authors: [{ name: "Kiosco App" }],
  creator: "Kiosco App",
  publisher: "Kiosco App",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Kiosco App | Punto de venta y gestión para tu negocio",
    description:
      "Gestiona ventas, inventario, compras y reportes con Kiosco App.",
    siteName: "Kiosco App",
    images: [
      {
        url: "/kioscoapp-og.png",
        width: 1200,
        height: 630,
        alt: "Kiosco App - Gestión y punto de venta",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kiosco App | Punto de venta y gestión",
    description:
      "Sistema integral para ventas, inventario, compras y reportes.",
    creator: "@kioscoapp",
    images: ["/kioscoapp-og.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  category: "business",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Script
          id="ld-json-organization"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Kiosco App",
              url: siteUrl,
              logo: `${siteUrl}/kioscoapp.png`,
              description:
                "Kiosco App es un sistema de punto de venta y gestión integral para tiendas y kioscos.",
              sameAs: [],
            }),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
