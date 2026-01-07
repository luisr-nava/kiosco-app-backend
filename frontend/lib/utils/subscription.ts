import {
  LimitCheckResult,
  PLAN_LIMITS,
  SubscriptionPlan,
  SubscriptionPlanType,
  UserSubscription,
} from "../types/subscription";

/**
 * Verifica si un usuario puede crear más elementos según su plan
 */
export function canCreateMore(
  subscription: UserSubscription,
  resource: "stores" | "products" | "customers" | "employees"
): LimitCheckResult {
  const planType = subscription.planType;
  const limit = PLAN_LIMITS[planType][resource];
  const current = subscription.usage[resource];

  if (limit === "unlimited") {
    return {
      allowed: true,
      limit: "unlimited",
      current,
    };
  }

  const allowed = current < limit;
  return {
    allowed,
    limit,
    current,
    message: allowed
      ? undefined
      : `Has alcanzado el límite de ${limit} ${resource} para tu plan ${planType.toUpperCase()}`,
  };
}

/**
 * Verifica si un usuario puede subir más archivos según su almacenamiento
 */
export function canUploadFile(
  subscription: UserSubscription,
  fileSizeBytes: number
): LimitCheckResult {
  const planType = subscription.planType;
  const limit = PLAN_LIMITS[planType].storageBytes;
  const current = subscription.usage.storageUsed;

  const allowed = current + fileSizeBytes <= limit;

  return {
    allowed,
    limit,
    current,
    message: allowed
      ? undefined
      : `No tienes suficiente espacio de almacenamiento. Tu plan ${planType.toUpperCase()} incluye ${PLAN_LIMITS[planType].storage}`,
  };
}

/**
 * Obtiene el nombre del plan formateado
 */
export function getPlanName(planType: SubscriptionPlanType): string {
  const names = {
    [SubscriptionPlanType.FREE]: "Free",
    [SubscriptionPlanType.PREMIUM]: "Premium",
    [SubscriptionPlanType.PRO]: "Pro",
  };
  return names[planType];
}

/**
 * Verifica si un plan es superior a otro
 */
export function isPlanUpgrade(
  currentPlan: SubscriptionPlanType,
  newPlan: SubscriptionPlanType
): boolean {
  const hierarchy = {
    [SubscriptionPlanType.FREE]: 0,
    [SubscriptionPlanType.PREMIUM]: 1,
    [SubscriptionPlanType.PRO]: 2,
  };

  return hierarchy[newPlan] > hierarchy[currentPlan];
}

/**
 * Verifica si un plan es inferior a otro
 */
export function isPlanDowngrade(
  currentPlan: SubscriptionPlanType,
  newPlan: SubscriptionPlanType
): boolean {
  const hierarchy = {
    [SubscriptionPlanType.FREE]: 0,
    [SubscriptionPlanType.PREMIUM]: 1,
    [SubscriptionPlanType.PRO]: 2,
  };

  return hierarchy[newPlan] < hierarchy[currentPlan];
}

/**
 * Formatea el tamaño de almacenamiento en bytes a formato legible
 */
export function formatStorageSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Calcula el porcentaje de uso de un recurso
 */
export function getUsagePercentage(current: number, limit: number | "unlimited"): number {
  if (limit === "unlimited") {
    return 0;
  }

  return (current / limit) * 100;
}

/**
 * Verifica si un usuario debe actualizar su plan
 */
export function shouldUpgradePlan(subscription: UserSubscription): {
  shouldUpgrade: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  const planType = subscription.planType;

  // Verificar cada recurso
  const resources: Array<"stores" | "products" | "customers" | "employees"> = [
    "stores",
    "products",
    "customers",
    "employees",
  ];

  resources.forEach((resource) => {
    const check = canCreateMore(subscription, resource);
    if (!check.allowed) {
      reasons.push(`Has alcanzado el límite de ${resource}`);
    }
  });

  // Verificar almacenamiento
  const storageLimit = PLAN_LIMITS[planType].storageBytes;
  const storageUsed = subscription.usage.storageUsed;
  const storagePercentage = (storageUsed / storageLimit) * 100;

  if (storagePercentage >= 90) {
    reasons.push("Has usado más del 90% de tu almacenamiento");
  }

  return {
    shouldUpgrade: reasons.length > 0,
    reasons,
  };
}
