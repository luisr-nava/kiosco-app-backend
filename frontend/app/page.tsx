"use client";

import { ModeToggle } from "@/components/theme/mode-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "./(auth)/hooks";
import { UserMenu } from "./(auth)/components/user-menu";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Package,
  Users,
  Store,
  TrendingUp,
  TrendingDown,
  FileText,
  CreditCard,
  BarChart3,
  UserCircle,
  ShoppingBag,
  ClipboardList,
  ArrowLeftRight,
  FolderTree,
  Truck,
  Receipt,
  DollarSign,
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const modules = [
    {
      title: "Ventas",
      description: "Gestión de ventas y punto de venta",
      icon: ShoppingCart,
      href: "/sales",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Productos",
      description: "Catálogo y gestión de inventario",
      icon: Package,
      href: "/products",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Clientes",
      description: "Base de datos de clientes",
      icon: Users,
      href: "/customers",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Empleados",
      description: "Gestión de personal",
      icon: UserCircle,
      href: "/employees",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
    },
    {
      title: "Proveedores",
      description: "Directorio de proveedores",
      icon: Truck,
      href: "/suppliers",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Compras",
      description: "Órdenes de compra y abastecimiento",
      icon: ShoppingBag,
      href: "/purchases",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950",
    },
    {
      title: "Categorías",
      description: "Organización de productos",
      icon: FolderTree,
      href: "/categories",
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950",
    },
    {
      title: "Tiendas",
      description: "Gestión de sucursales",
      icon: Store,
      href: "/shops",
      color: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-950",
    },
    {
      title: "Ingresos",
      description: "Registro de ingresos",
      icon: TrendingUp,
      href: "/income",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      title: "Gastos",
      description: "Control de gastos operativos",
      icon: TrendingDown,
      href: "/expenses",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Notas de Crédito",
      description: "Gestión de créditos y devoluciones",
      icon: CreditCard,
      href: "/credit-notes",
      color: "text-violet-600",
      bgColor: "bg-violet-50 dark:bg-violet-950",
    },
    {
      title: "Devoluciones de Venta",
      description: "Procesar devoluciones de clientes",
      icon: ArrowLeftRight,
      href: "/sale-returns",
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950",
    },
    {
      title: "Devoluciones de Compra",
      description: "Devoluciones a proveedores",
      icon: Receipt,
      href: "/purchase-returns",
      color: "text-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-950",
    },
    {
      title: "Reportes",
      description: "Análisis y estadísticas",
      icon: BarChart3,
      href: "/reports",
      color: "text-slate-600",
      bgColor: "bg-slate-50 dark:bg-slate-950",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/kioscoapp.png"
                  alt="Logo de Kiosco App"
                  width={40}
                  height={40}
                  priority
                  className="h-10 w-10 rounded-lg object-contain shadow-sm"
                />
                <div className="leading-tight">
                  <h1 className="text-2xl font-bold">Kiosco App</h1>
                  <p className="text-sm text-muted-foreground">Sistema de Gestión Integral</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6 mr-4">
                <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                  Precios
                </Link>
              </nav>
              <ModeToggle />
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <div className="flex gap-2">
                  <Link href="/login">
                    <Button variant="ghost">Iniciar Sesión</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Registrarse</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Gestiona tu Negocio de Forma{" "}
            <span className="text-primary">Inteligente</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Sistema completo de punto de venta, inventario, ventas y reportes para tu kiosco o tienda
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  <DollarSign className="h-5 w-5" />
                  Comenzar Gratis
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  Ver Planes
                </Button>
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <div className="pt-4">
              <p className="text-lg">
                Bienvenido, <span className="font-semibold">{user?.fullName}</span>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modules Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold mb-2">Módulos del Sistema</h3>
          <p className="text-muted-foreground">
            Todas las herramientas que necesitas en un solo lugar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={module.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-3`}>
                      <Icon className={`h-6 w-6 ${module.color}`} />
                    </div>
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      {isAuthenticated && (
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Ventas del Mes</CardDescription>
                <CardTitle className="text-3xl">$12,450</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>+12.5% vs mes anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Productos en Stock</CardDescription>
                <CardTitle className="text-3xl">1,234</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Package className="h-4 w-4" />
                  <span>En 15 categorías</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Clientes Activos</CardDescription>
                <CardTitle className="text-3xl">456</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-purple-600">
                  <Users className="h-4 w-4" />
                  <span>+23 este mes</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 mb-12">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold mb-2">Características Principales</h3>
          <p className="text-muted-foreground">
            Todo lo que necesitas para administrar tu negocio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Reportes en Tiempo Real</CardTitle>
              <CardDescription>
                Visualiza métricas y estadísticas de tu negocio al instante
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Punto de Venta Rápido</CardTitle>
              <CardDescription>
                Sistema POS intuitivo y rápido para procesar ventas eficientemente
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Control de Inventario</CardTitle>
              <CardDescription>
                Gestiona tu stock, alertas de inventario bajo y reabastecimiento
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Gestión de Clientes</CardTitle>
              <CardDescription>
                Administra tu base de clientes y programa de fidelización
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Multi-Sucursal</CardTitle>
              <CardDescription>
                Gestiona múltiples tiendas desde una sola plataforma
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Facturación Completa</CardTitle>
              <CardDescription>
                Genera facturas, notas de crédito y recibos profesionales
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Image
                  src="/kioscoapp.png"
                  alt="Logo de Kiosco App"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-md object-contain shadow-sm"
                />
                <h3 className="font-semibold">Kiosco App</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Sistema de Gestión Integral para tu Negocio
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Producto</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/pricing" className="text-muted-foreground hover:text-primary">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="/#features" className="text-muted-foreground hover:text-primary">
                    Características
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                    Política de Privacidad
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Contacto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>soporte@kioscoapp.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Kiosco App. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
