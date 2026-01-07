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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://balanzio.net";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Balanzio | Software de gestión y punto de venta para comercios",
    template: "%s | Balanzio",
  },
  description:
    "Balanzio es el software de gestión para kioscos, almacenes y pymes que integra ventas, stock, facturación y reportes en tiempo real.",
  applicationName: "Balanzio",
  keywords: [
    "software de gestión para comercios",
    "punto de venta para kioscos",
    "control de stock",
    "sistema para almacenes",
    "facturación electrónica",
    "pos para pymes",
    "ventas e inventario",
  ],
  authors: [{ name: "Balanzio" }],
  creator: "Balanzio",
  publisher: "Balanzio",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Balanzio | Software de gestión y punto de venta para comercios",
    description:
      "Centraliza ventas, stock, finanzas y reportes con Balanzio, el sistema para kioscos, almacenes y pymes.",
    siteName: "Balanzio",
    images: [
      {
        url: "/balanzio-og.png",
        width: 1200,
        height: 630,
        alt: "Balanzio - Software de gestión para comercios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Balanzio | Punto de venta y gestión",
    description:
      "Sistema SaaS para ventas, inventario, facturación y finanzas de pequeños comercios.",
    creator: "@balanzio",
    images: ["/balanzio-og.png"],
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
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          id="ld-json-organization"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Balanzio",
              url: siteUrl,
              logo: `${siteUrl}/balanzio.png`,
              description:
                "Balanzio es un software de gestión y punto de venta para kioscos, almacenes y pequeñas empresas.",
              sameAs: [],
            }),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
