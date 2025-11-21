# Sistema de Suscripciones - Kiosco App

## Descripción

Kiosco App ofrece 3 planes de suscripción para adaptarse a diferentes tipos de negocios:

### 1. Plan Free (Gratis)
- **Precio:** $0/mes
- **Ideal para:** Negocios pequeños que están comenzando
- **Límites:**
  - 1 Tienda/Sucursal
  - Hasta 100 productos
  - Hasta 50 clientes
  - 1 Usuario/Empleado
  - 500MB de almacenamiento

### 2. Plan Premium ($10/mes)
- **Precio:** $10/mes ($100/año - 2 meses gratis)
- **Ideal para:** Negocios en crecimiento
- **Características:**
  - Hasta 5 Tiendas/Sucursales
  - Productos ilimitados
  - Clientes ilimitados
  - Hasta 10 Usuarios/Empleados
  - 10GB de almacenamiento
  - Gestión completa de compras
  - Reportes avanzados
  - Exportación a Excel/PDF
  - Soporte prioritario

### 3. Plan Pro ($50/mes)
- **Precio:** $50/mes ($500/año - 2 meses gratis)
- **Ideal para:** Empresas profesionales
- **Características:**
  - Todo lo del plan Premium +
  - Tiendas/Sucursales ilimitadas
  - Usuarios ilimitados
  - 100GB de almacenamiento
  - API de integración
  - Reportes personalizados
  - Análisis predictivo
  - Facturación electrónica
  - Multi-moneda y Multi-idioma
  - Soporte 24/7 dedicado
  - White-label (marca blanca)

## Estructura de Archivos

```
lib/
├── types/
│   ├── subscription.ts          # Tipos e interfaces
│   └── index.ts                 # Exportaciones
├── constants/
│   └── plans.ts                 # Definición de planes
└── utils/
    └── subscription.ts          # Utilidades y helpers

app/
└── (public)/
    └── pricing/
        └── page.tsx             # Página de precios
```

## Uso

### Importar tipos

```typescript
import {
  SubscriptionPlanType,
  SubscriptionPlan,
  UserSubscription,
} from "@/lib/types/subscription";
```

### Obtener información de un plan

```typescript
import { getPlanByType } from "@/lib/constants/plans";

const premiumPlan = getPlanByType(SubscriptionPlanType.PREMIUM);
console.log(premiumPlan.price); // 10
```

### Verificar límites

```typescript
import { canCreateMore } from "@/lib/utils/subscription";

const canAddProduct = canCreateMore(userSubscription, "products");

if (!canAddProduct.allowed) {
  console.log(canAddProduct.message);
  // "Has alcanzado el límite de 100 products para tu plan FREE"
}
```

### Verificar si debe actualizar el plan

```typescript
import { shouldUpgradePlan } from "@/lib/utils/subscription";

const { shouldUpgrade, reasons } = shouldUpgradePlan(userSubscription);

if (shouldUpgrade) {
  console.log("Razones para actualizar:", reasons);
}
```

## Características por Plan

| Característica | Free | Premium | Pro |
|----------------|------|---------|-----|
| Tiendas | 1 | 5 | ∞ |
| Productos | 100 | ∞ | ∞ |
| Clientes | 50 | ∞ | ∞ |
| Empleados | 1 | 10 | ∞ |
| Almacenamiento | 500MB | 10GB | 100GB |
| Gestión de Compras | ❌ | ✅ | ✅ |
| Reportes Avanzados | ❌ | ✅ | ✅ |
| Exportación Datos | ❌ | ✅ | ✅ |
| API | ❌ | ❌ | ✅ |
| Multi-moneda | ❌ | ❌ | ✅ |
| Soporte 24/7 | ❌ | ❌ | ✅ |

## Integración con Backend

Para implementar el sistema de suscripciones en el backend, necesitarás:

1. **Modelo de Suscripción en Prisma:**
```prisma
model Subscription {
  id                   String   @id @default(uuid())
  userId               String   @unique
  planType             String   // 'free', 'premium', 'pro'
  status               String   // 'active', 'canceled', etc.
  startDate            DateTime @default(now())
  endDate              DateTime?
  cancelAtPeriodEnd    Boolean  @default(false)

  // Stripe
  stripeCustomerId     String?
  stripeSubscriptionId String?

  // Uso
  storesCount          Int      @default(0)
  productsCount        Int      @default(0)
  customersCount       Int      @default(0)
  employeesCount       Int      @default(0)
  storageUsed          BigInt   @default(0)

  user                 User     @relation(fields: [userId], references: [id])

  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

2. **Endpoints de API:**
```
POST   /api/subscriptions/create          # Crear suscripción
GET    /api/subscriptions/current         # Obtener suscripción actual
PATCH  /api/subscriptions/upgrade         # Actualizar plan
PATCH  /api/subscriptions/cancel          # Cancelar suscripción
GET    /api/subscriptions/usage           # Obtener uso actual
POST   /api/subscriptions/check-limit     # Verificar límite
```

3. **Middleware de Verificación:**
Crear un middleware que verifique los límites antes de crear recursos:

```typescript
async function checkSubscriptionLimit(
  userId: string,
  resource: 'stores' | 'products' | 'customers' | 'employees'
) {
  const subscription = await getSubscription(userId);
  const canCreate = canCreateMore(subscription, resource);

  if (!canCreate.allowed) {
    throw new Error(canCreate.message);
  }
}
```

## Integración con Stripe (Opcional)

Para procesar pagos, integrar con Stripe:

1. Instalar Stripe SDK
2. Crear productos y precios en Stripe
3. Implementar webhooks para sincronizar estados
4. Manejar renovaciones automáticas

## Próximos Pasos

- [ ] Implementar sistema de pagos con Stripe
- [ ] Agregar página de gestión de suscripción en el dashboard
- [ ] Crear notificaciones cuando se alcancen límites
- [ ] Implementar prueba gratuita de 14 días para planes pagos
- [ ] Agregar métricas de uso en tiempo real
- [ ] Implementar descuentos y cupones
- [ ] Agregar facturación automática
