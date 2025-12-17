import { SubscriptionPlan, SubscriptionPlanType } from "../types/subscription";

/**
 * Definición completa de todos los planes de suscripción
 */
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanType, SubscriptionPlan> = {
  [SubscriptionPlanType.FREE]: {
    id: "plan_free",
    name: "Free",
    type: SubscriptionPlanType.FREE,
    price: 0,
    description: "Perfecto para empezar tu negocio",
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
    limits: {
      stores: 1,
      products: 100,
      customers: 50,
      employees: 1,
      storage: "500MB",
    },
  },

  [SubscriptionPlanType.PREMIUM]: {
    id: "plan_premium",
    name: "Premium",
    type: SubscriptionPlanType.PREMIUM,
    price: 10,
    yearlyPrice: 100,
    description: "Para negocios en crecimiento",
    popular: true,
    features: [
      "Hasta 3 Tiendas/Sucursales",
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
    limits: {
      stores: 3,
      products: "unlimited",
      customers: "unlimited",
      employees: 10,
      storage: "10GB",
    },
  },

  [SubscriptionPlanType.PRO]: {
    id: "plan_pro",
    name: "Pro",
    type: SubscriptionPlanType.PRO,
    price: 50,
    yearlyPrice: 500,
    description: "Para empresas profesionales",
    features: [
      "Hasta 3 Tiendas/Sucursales",
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
    limits: {
      stores: 3,
      products: "unlimited",
      customers: "unlimited",
      employees: "unlimited",
      storage: "100GB",
    },
  },
};

/**
 * Array de planes ordenados por precio
 */
export const PLANS_ARRAY = [
  SUBSCRIPTION_PLANS[SubscriptionPlanType.FREE],
  SUBSCRIPTION_PLANS[SubscriptionPlanType.PREMIUM],
  SUBSCRIPTION_PLANS[SubscriptionPlanType.PRO],
];

/**
 * Obtiene un plan por su tipo
 */
export function getPlanByType(planType: SubscriptionPlanType): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[planType];
}
