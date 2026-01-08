"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft, Check, Crown, Sparkles, Zap } from "lucide-react";
import { useAuth } from "@/features/auth/hooks";

export default function PricingPage() {
  const { isAuthenticated } = useAuth();

  const plans = [
    {
      name: "Free",
      price: 0,
      description: "Perfecto para empezar tu negocio",
      icon: Sparkles,
      color: "text-slate-600",
      bgColor: "bg-slate-50 dark:bg-slate-950",
      borderColor: "border-slate-200 dark:border-slate-800",
      features: [
        "1 Tienda/Sucursal",
        "Hasta 100 productos",
        "Hasta 50 clientes",
        "Ventas básicas (POS)",
        "Reportes básicos",
        "1 Usuario/Empleado",
        "Soporte por email",
        "Almacenamiento: 500MB",
      ],
      limitations: [
        "Sin gestión de compras",
        "Sin multi-sucursal",
        "Sin reportes avanzados",
        "Sin exportación de datos",
      ],
    },
    {
      name: "Premium",
      price: 10,
      description: "Para negocios en crecimiento",
      icon: Zap,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      borderColor: "border-blue-200 dark:border-blue-800",
      popular: true,
      features: [
        "Hasta 5 Tiendas/Sucursales",
        "Productos ilimitados",
        "Clientes ilimitados",
        "Ventas avanzadas (POS)",
        "Gestión de compras completa",
        "Hasta 10 Usuarios/Empleados",
        "Reportes avanzados",
        "Gestión de inventario",
        "Control de proveedores",
        "Notas de crédito",
        "Devoluciones",
        "Exportación a Excel/PDF",
        "Soporte prioritario",
        "Almacenamiento: 10GB",
      ],
      limitations: [],
    },
    {
      name: "Pro",
      price: 50,
      description: "Para empresas profesionales",
      icon: Crown,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      borderColor: "border-purple-200 dark:border-purple-800",
      features: [
        "Tiendas/Sucursales ilimitadas",
        "Todo lo de Premium +",
        "Usuarios ilimitados",
        "API de integración",
        "Reportes personalizados",
        "Dashboard ejecutivo",
        "Análisis predictivo",
        "Integraciones avanzadas",
        "Facturación electrónica",
        "Multi-moneda",
        "Multi-idioma",
        "Backup diario automático",
        "Soporte 24/7 dedicado",
        "Capacitación personalizada",
        "Almacenamiento: 100GB",
        "White-label (marca blanca)",
      ],
      limitations: [],
    },
  ];

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Planes y Precios
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            Elige el plan perfecto para tu negocio. Comienza gratis y actualiza
            cuando lo necesites.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto mb-12 grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative ${plan.borderColor} ${
                  plan.popular ? "scale-105 border-2 shadow-2xl" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 px-4 py-1 text-white hover:bg-blue-700">
                      Más Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pt-8 pb-8 text-center">
                  <div
                    className={`h-16 w-16 rounded-2xl ${plan.bgColor} mx-auto mb-4 flex items-center justify-center`}
                  >
                    <Icon className={`h-8 w-8 ${plan.color}`} />
                  </div>
                  <CardTitle className="mb-2 text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">
                        {plan.price > 0 ? "/mes" : ""}
                      </span>
                    </div>
                    {plan.price > 0 && (
                      <p className="text-muted-foreground mt-1 text-sm">
                        Facturado mensualmente
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check
                          className={`h-5 w-5 ${plan.color} mt-0.5 flex-shrink-0`}
                        />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <p className="text-muted-foreground text-sm font-semibold">
                          Limitaciones:
                        </p>
                        {plan.limitations.map((limitation, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <span className="text-muted-foreground text-xs">
                              • {limitation}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>

                <CardFooter>
                  <Link
                    href={isAuthenticated ? "/dashboard" : "/register"}
                    className="w-full"
                  >
                    <Button
                      className={`w-full ${plan.popular ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.price === 0
                        ? "Comenzar Gratis"
                        : isAuthenticated
                          ? "Actualizar Plan"
                          : "Comenzar Ahora"}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mx-auto max-w-4xl">
          <Separator className="my-12" />

          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold">Preguntas Frecuentes</h2>
            <p className="text-muted-foreground">
              Respuestas a las preguntas más comunes sobre nuestros planes
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ¿Puedo cambiar de plan en cualquier momento?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Sí, puedes actualizar o degradar tu plan en cualquier momento.
                  Los cambios se reflejarán en tu próximo ciclo de facturación.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ¿Qué métodos de pago aceptan?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Aceptamos tarjetas de crédito/débito (Visa, Mastercard,
                  American Express), PayPal y transferencias bancarias para
                  planes anuales.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ¿Hay periodo de prueba?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  El plan Free es completamente gratuito. Los planes Premium y
                  Pro incluyen garantía de reembolso de 30 días si no estás
                  satisfecho.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ¿Qué sucede si excedo los límites?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Recibirás una notificación para actualizar tu plan. Tus datos
                  estarán seguros y no perderás información al actualizar.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ¿Ofrecen descuentos para planes anuales?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Sí, al pagar anualmente obtienes 2 meses gratis (equivalente a
                  un 16% de descuento). Contacta a ventas para más información.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ¿Los datos están seguros?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Absolutamente. Todos los planes incluyen cifrado de datos,
                  backups regulares y cumplimiento con estándares de seguridad
                  internacionales.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mx-auto mt-16 max-w-4xl">
          <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader className="pb-6 text-center">
              <CardTitle className="mb-2 text-3xl">
                ¿Necesitas un plan personalizado?
              </CardTitle>
              <CardDescription className="text-lg text-blue-100">
                Para empresas con necesidades específicas, ofrecemos planes a
                medida
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" variant="secondary">
                    Comenzar Gratis
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white bg-transparent text-white hover:bg-white/10"
                >
                  Contactar Ventas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
