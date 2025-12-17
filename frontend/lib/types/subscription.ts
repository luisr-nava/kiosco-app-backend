/**
 * Tipos de planes de suscripción disponibles
 */
export enum SubscriptionPlanType {
  FREE = "free",
  PREMIUM = "premium",
  PRO = "pro",
}

/**
 * Características del plan de suscripción
 */
export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: number | string; // Puede ser un número o "unlimited"
}

/**
 * Información del plan de suscripción
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  type: SubscriptionPlanType;
  price: number; // Precio mensual en USD
  yearlyPrice?: number; // Precio anual en USD (con descuento)
  description: string;
  popular?: boolean;
  features: string[];
  limitations?: string[];

  // Límites específicos del plan
  limits: {
    stores: number | "unlimited";
    products: number | "unlimited";
    customers: number | "unlimited";
    employees: number | "unlimited";
    storage: string; // ej: "500MB", "10GB", "100GB"
  };
}

/**
 * Estado de la suscripción del usuario
 */
export interface UserSubscription {
  id: string;
  userId: string;
  planType: SubscriptionPlanType;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: Date;

  // Información de pago
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;

  // Uso actual
  usage: {
    stores: number;
    products: number;
    customers: number;
    employees: number;
    storageUsed: number; // en bytes
  };
}

/**
 * Estados posibles de una suscripción
 */
export enum SubscriptionStatus {
  ACTIVE = "active",
  CANCELED = "canceled",
  PAST_DUE = "past_due",
  UNPAID = "unpaid",
  TRIALING = "trialing",
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
}

/**
 * Información para cambiar de plan
 */
export interface PlanChangeRequest {
  currentPlanType: SubscriptionPlanType;
  newPlanType: SubscriptionPlanType;
  billingCycle: "monthly" | "yearly";
}

/**
 * Resultado de verificación de límites
 */
export interface LimitCheckResult {
  allowed: boolean;
  limit: number | "unlimited";
  current: number;
  message?: string;
}

/**
 * Constantes de precios
 */
export const PLAN_PRICES = {
  [SubscriptionPlanType.FREE]: {
    monthly: 0,
    yearly: 0,
  },
  [SubscriptionPlanType.PREMIUM]: {
    monthly: 10,
    yearly: 100, // 2 meses gratis
  },
  [SubscriptionPlanType.PRO]: {
    monthly: 50,
    yearly: 500, // 2 meses gratis
  },
} as const;

/**
 * Constantes de límites por plan
 */
export const PLAN_LIMITS = {
  [SubscriptionPlanType.FREE]: {
    stores: 1,
    products: 100,
    customers: 50,
    employees: 1,
    storage: "500MB",
    storageBytes: 500 * 1024 * 1024,
  },
  [SubscriptionPlanType.PREMIUM]: {
    stores: 3,
    products: "unlimited" as const,
    customers: "unlimited" as const,
    employees: 10,
    storage: "10GB",
    storageBytes: 10 * 1024 * 1024 * 1024,
  },
  [SubscriptionPlanType.PRO]: {
    stores: 3,
    products: "unlimited" as const,
    customers: "unlimited" as const,
    employees: "unlimited" as const,
    storage: "100GB",
    storageBytes: 100 * 1024 * 1024 * 1024,
  },
} as const;
