import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  CreditCard,
  Layers,
  Package,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
} from "lucide-react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://balanzio.net";
const ogImage = `${siteUrl}/balanzio-og.png`;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Software de gestión para comercios y kioscos | Balanzio",
    description:
      "Balanzio centraliza ventas, stock, finanzas y reportes en un POS web rápido para kioscos, almacenes y pymes.",
    alternates: { canonical: "/" },
    keywords: [
      "software de gestión para comercios",
      "sistema para kioscos",
      "punto de venta para almacenes",
      "control de stock",
      "facturación electrónica",
      "software para pymes",
      "POS web",
    ],
    openGraph: {
      title: "Balanzio | Software de gestión y punto de venta para comercios",
      description:
        "Controla ventas, stock y finanzas con un POS web rápido y reportes en tiempo real.",
      url: siteUrl,
      siteName: "Balanzio",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Balanzio - Software para kioscos y comercios",
        },
      ],
      locale: "es_ES",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Balanzio | Sistema de gestión para kioscos y pymes",
      description: "POS, inventario y finanzas en un solo lugar.",
      images: [ogImage],
      creator: "@balanzio",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

const featureHighlights = [
  {
    title: "Ventas y POS omnicanal",
    description:
      "Cobra en segundos con lector de código de barras, acepta múltiples medios de pago y genera facturas al instante.",
    icon: CreditCard,
    bullets: [
      "Tickets y facturas A/B",
      "Precios por volumen y combos",
      "Historial y devoluciones rápidas",
    ],
  },
  {
    title: "Control de stock y compras",
    description:
      "Inventario en tiempo real, alertas de mínimos, trazabilidad por lotes y reposiciones basadas en ventas.",
    icon: Package,
    bullets: ["Alertas automáticas", "Recepciones con proveedor", "Conteos y ajustes auditados"],
  },
  {
    title: "Finanzas y reportes",
    description:
      "Tableros claros para márgenes, costos e impuestos. Exporta a Excel/AFIP y mantén tu contabilidad al día.",
    icon: BarChart3,
    bullets: [
      "Flujo de caja unificado",
      "Reportes diarios y por sucursal",
      "Exportables para tu contador",
    ],
  },
];

const steps = [
  {
    title: "Configura tu catálogo y cajas",
    description: "Carga productos con códigos de barra, impuestos y listas de precio por sucursal.",
    icon: Layers,
  },
  {
    title: "Opera ventas y stock en tiempo real",
    description: "POS rápido con soporte offline, sincronizado con inventario y facturación.",
    icon: Clock3,
  },
  {
    title: "Analiza y optimiza",
    description:
      "Paneles de rentabilidad, reposiciones sugeridas y reportes por categoría o vendedor.",
    icon: ArrowUpRight,
  },
];

const useCases = [
  {
    title: "Kioscos y almacenes",
    description:
      "Acelera cajas, controla mermas y maneja listas de precio dinámicas sin depender de planillas.",
  },
  {
    title: "Tiendas de conveniencia y mini mercados",
    description:
      "Sincroniza stock por sucursal, identifica quiebres y evita pérdidas por diferencia de precios.",
  },
  {
    title: "Ferreterías y pymes",
    description:
      "Gestión por categorías, compras programadas y reportes financieros para decisiones rápidas.",
  },
];

const trustPoints = [
  {
    title: "Listo para móvil",
    description:
      "Interfaces responsivas y accesibles con tiempo de respuesta sub-200ms en interacciones críticas.",
    icon: Smartphone,
  },
  {
    title: "Estabilidad y datos seguros",
    description: "Backups diarios, roles de usuario y autenticación segura para tus equipos.",
    icon: ShieldCheck,
  },
  {
    title: "Velocidad para Core Web Vitals",
    description:
      "Renderizado server-first, Next/Image optimizado y fuentes precargadas para mejorar LCP, CLS e INP.",
    icon: Sparkles,
  },
  {
    title: "Multi-sucursal desde un panel",
    description: "Centraliza precios, stock y ventas de todas tus tiendas sin hardware adicional.",
    icon: Store,
  },
];

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Balanzio",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: siteUrl,
  image: ogImage,
  description:
    "Software de gestión y punto de venta para kioscos, almacenes y pymes que integra ventas, stock, finanzas y reportes.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    url: `${siteUrl}/pricing`,
    category: "SaaS",
  },
  brand: { "@type": "Brand", name: "Balanzio" },
  audience: {
    "@type": "Audience",
    audienceType: ["kioscos", "almacenes", "tiendas de conveniencia", "pymes"],
  },
  featureList: [
    "POS rápido con facturación electrónica",
    "Control de stock en tiempo real",
    "Reportes y finanzas para pequeñas empresas",
    "Gestión de proveedores y compras",
  ],
  publisher: {
    "@type": "Organization",
    name: "Balanzio",
    url: siteUrl,
    logo: `${siteUrl}/balanzio.png`,
  },
  potentialAction: {
    "@type": "RegisterAction",
    target: `${siteUrl}/register`,
    name: "Crear cuenta en Balanzio",
  },
};

export default function HomePage() {
  return (
    <div className="from-background via-background to-muted/30 min-h-screen bg-linear-to-b text-slate-900 dark:text-slate-50">
      <header className="bg-background/90 supports-backdrop-filter:bg-background/70 sticky top-0 z-40 border-b backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-linear-to-b from-sky-500 via-indigo-500 to-blue-600 shadow-md" />
            <div className="leading-tight">
              <span className="text-xl font-semibold">Balanzio</span>
              <p className="text-muted-foreground text-sm">Software de gestión para comercios</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="#soluciones" className="hover:text-primary transition-colors">
              Soluciones
            </Link>
            <Link href="#sectores" className="hover:text-primary transition-colors">
              Sectores
            </Link>
            <Link href="#flujo" className="hover:text-primary transition-colors">
              Cómo funciona
            </Link>
            <Link href="/pricing" className="hover:text-primary transition-colors">
              Precios
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Ingresar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Probar gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pb-20">
        <section className="container mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 pt-12 md:grid-cols-2">
          <div className="space-y-6">
            <Badge className="bg-primary/10 text-primary w-fit">
              POS + Gestión de stock + Finanzas
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl leading-tight font-bold tracking-tight md:text-5xl">
                Software de gestión para comercios y kioscos con punto de venta integrado
              </h1>
              <p className="text-muted-foreground text-lg">
                Balanzio te ayuda a vender más rápido, mantener el stock bajo control y tomar
                decisiones con datos confiables. Diseñado para kioscos, almacenes y pymes que
                necesitan operar sin fricciones.
              </p>
              <div className="text-muted-foreground flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary h-4 w-4" />
                  Cobro y facturación en minutos
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary h-4 w-4" />
                  Control de stock y alertas automáticas
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary h-4 w-4" />
                  Reportes claros para decisiones
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button size="lg">Comenzar gratis</Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  Ver planes
                </Button>
              </Link>
              <Link
                href="mailto:ventas@balanzio.net"
                className="text-primary text-sm font-semibold"
              >
                Agendar llamada →
              </Link>
            </div>
            <div className="bg-background/60 grid grid-cols-1 gap-4 rounded-2xl border p-4 shadow-sm sm:grid-cols-3">
              <div>
                <p className="text-3xl font-bold">2 min</p>
                <p className="text-muted-foreground text-sm">Tiempo promedio por venta completa</p>
              </div>
              <div>
                <p className="text-3xl font-bold">99.9%</p>
                <p className="text-muted-foreground text-sm">Disponibilidad de la plataforma</p>
              </div>
              <div>
                <p className="text-3xl font-bold">Stock vivo</p>
                <p className="text-muted-foreground text-sm">
                  Sincronizado en tiempo real entre sucursales
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div
              className="bg-primary/10 absolute -top-8 -left-8 h-32 w-32 rounded-full blur-3xl"
              aria-hidden
            />
            <div
              className="absolute -right-4 bottom-6 h-24 w-24 rounded-full bg-blue-500/10 blur-3xl"
              aria-hidden
            />
            <Card className="border-primary/10 shadow-primary/5 relative overflow-hidden shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 h-10 w-10 rounded-lg" />
                  <div>
                    <p className="text-muted-foreground text-sm">Panel Balanzio</p>
                    <p className="text-lg font-semibold">Ventas + Stock + Finanzas</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-muted/30 rounded-xl border p-3">
                    <p className="text-muted-foreground text-xs">Ventas de hoy</p>
                    <p className="text-xl font-semibold">$482.500</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl border p-3">
                    <p className="text-muted-foreground text-xs">Ticket promedio</p>
                    <p className="text-xl font-semibold">$5.820</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl border p-3">
                    <p className="text-muted-foreground text-xs">Unidades en stock</p>
                    <p className="text-xl font-semibold">12.430</p>
                  </div>
                </div>
                <div className="bg-muted/20 rounded-xl border p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Alertas de stock</span>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      En tiempo real
                    </span>
                  </div>
                  <div className="text-muted-foreground mt-3 space-y-2 text-sm">
                    <div className="bg-background/80 flex items-center justify-between rounded-lg px-3 py-2">
                      <span>Gaseosa 500ml</span>
                      <span className="text-amber-600">Quedan 8</span>
                    </div>
                    <div className="bg-background/80 flex items-center justify-between rounded-lg px-3 py-2">
                      <span>Snacks surtidos</span>
                      <span className="text-red-600">Stock crítico</span>
                    </div>
                    <div className="bg-background/80 flex items-center justify-between rounded-lg px-3 py-2">
                      <span>Tarjetas prepago</span>
                      <span className="text-green-600">OK</span>
                    </div>
                  </div>
                </div>
                <div className="from-primary/10 via-primary/5 rounded-xl border bg-linear-to-r to-transparent p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-primary h-10 w-10" />
                    <div>
                      <p className="text-sm font-semibold">Datos seguros y siempre disponibles</p>
                      <p className="text-muted-foreground text-xs">
                        Respaldo automático, roles por usuario y auditoría completa.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="soluciones" className="container mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 space-y-3">
            <Badge className="bg-primary/10 text-primary w-fit">Soluciones clave</Badge>
            <h2 className="text-3xl font-bold tracking-tight">
              Control total de ventas, stock y finanzas
            </h2>
            <p className="text-muted-foreground text-lg">
              Procesos diseñados para Core Web Vitals: renderizado server-first, navegación fluida y
              datos siempre consistentes.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featureHighlights.map((feature) => (
              <Card key={feature.title} className="border-primary/10 h-full shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {feature.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                      <CheckCircle2 className="text-primary h-4 w-4" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="sectores" className="bg-muted/40">
          <div className="container mx-auto max-w-6xl px-4 py-16">
            <div className="mb-8 space-y-3">
              <Badge className="bg-primary/10 text-primary w-fit">Sectores</Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Diseñado para el día a día de tu tienda
              </h2>
              <p className="text-muted-foreground text-lg">
                Flujos listos para kioscos, almacenes y pymes que necesitan velocidad, precisión y
                control financiero.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {useCases.map((useCase) => (
                <Card key={useCase.title} className="h-full shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">{useCase.title}</CardTitle>
                    <CardDescription>{useCase.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="text-primary h-4 w-4" />
                        Inventario centralizado y precios consistentes
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="text-primary h-4 w-4" />
                        Reportes diarios y alertas de rotación
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="text-primary h-4 w-4" />
                        Integración con facturación y medios de pago locales
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="flujo" className="container mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 space-y-3">
            <Badge className="bg-primary/10 text-primary w-fit">Implementación</Badge>
            <h2 className="text-3xl font-bold tracking-tight">
              De cero a operativo en días, no semanas
            </h2>
            <p className="text-muted-foreground text-lg">
              Onboarding guiado, importadores de catálogo y dashboards preconfigurados para medir
              ventas y rentabilidad.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={step.title} className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-semibold">
                    Paso {index + 1}
                  </div>
                  <step.icon className="text-primary h-5 w-5" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="from-primary/5 mt-10 grid grid-cols-1 gap-4 rounded-2xl border bg-linear-to-r via-transparent to-transparent p-6 md:grid-cols-4">
            {trustPoints.map((item) => (
              <div key={item.title} className="space-y-2">
                <div className="flex items-center gap-2">
                  <item.icon className="text-primary h-5 w-5" />
                  <p className="text-sm font-semibold">{item.title}</p>
                </div>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-4 py-16">
          <Card className="border-primary/10 from-primary/10 via-background to-background overflow-hidden bg-linear-to-br shadow-lg">
            <CardContent className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2 md:p-12">
              <div className="space-y-4">
                <Badge className="text-primary w-fit bg-white/60">CTA</Badge>
                <h2 className="text-3xl font-bold tracking-tight">
                  Prueba Balanzio y valida tu operación
                </h2>
                <p className="text-muted-foreground text-lg">
                  Configuramos tu primer punto de venta, dejamos el stock listo y activamos alertas
                  críticas para que no pierdas ventas. Sin hardware extra, sin instalaciones
                  complejas.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/register">
                    <Button size="lg">Crear cuenta gratuita</Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline">
                      Planes y precios
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div
                  className="bg-primary/20 absolute -top-6 -left-6 h-28 w-28 rounded-full blur-3xl"
                  aria-hidden
                />
                <div
                  className="absolute -right-6 bottom-4 h-24 w-24 rounded-full bg-blue-500/10 blur-3xl"
                  aria-hidden
                />
                <div className="bg-background/80 relative rounded-2xl border p-6 shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Resumen del día</p>
                    <Sparkles className="text-primary h-5 w-5" />
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="text-muted-foreground flex items-center justify-between text-sm">
                      <span>Ventas con tarjeta</span>
                      <span className="text-foreground font-semibold">$315.200</span>
                    </div>
                    <div className="text-muted-foreground flex items-center justify-between text-sm">
                      <span>Efectivo</span>
                      <span className="text-foreground font-semibold">$97.300</span>
                    </div>
                    <div className="text-muted-foreground flex items-center justify-between text-sm">
                      <span>Costo de mercadería</span>
                      <span className="text-foreground font-semibold">$189.000</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">Margen bruto estimado</span>
                      <span className="font-semibold text-green-600">48%</span>
                    </div>
                  </div>
                  <div className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
                    <ShieldCheck className="text-primary h-4 w-4" />
                    Datos cifrados y respaldados automáticamente.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="bg-muted/50 border-t">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-linear-to-br from-sky-500 via-indigo-500 to-blue-600" />
                <span className="text-lg font-semibold">Balanzio</span>
              </div>
              <p className="text-muted-foreground text-sm">
                SaaS de gestión para kioscos, almacenes y pymes. Controla ventas, stock y finanzas
                desde un solo panel.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Producto</h3>
              <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
                <li>
                  <Link href="#soluciones" className="hover:text-primary">
                    Funcionalidades
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-primary">
                    Precios
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Recursos</h3>
              <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/login" className="hover:text-primary">
                    Ingresar
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-primary">
                    Crear cuenta
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Contacto</h3>
              <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
                <li>
                  <Link href="mailto:soporte@balanzio.net" className="hover:text-primary">
                    soporte@balanzio.net
                  </Link>
                </li>
                <li>
                  <Link href="tel:+549115551234" className="hover:text-primary">
                    +54 9 11 5551 234
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-6" />
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Balanzio. SaaS de gestión y punto de venta para comercios.
          </p>
        </div>
      </footer>

      <Script
        id="ld-json-software"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
    </div>
  );
}
