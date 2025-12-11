# Kiosco App - Sistema de Gestión para Kioscos

API REST desarrollada con NestJS para la gestión completa de kioscos y comercios minoristas. Sistema multi-tienda con control de inventario, compras, ventas, proveedores y empleados.

## Tabla de Contenidos

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Base de Datos](#base-de-datos)
- [Ejecutar la Aplicación](#ejecutar-la-aplicación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Módulos y Endpoints](#módulos-y-endpoints)
- [Modelo de Datos](#modelo-de-datos)
- [Autenticación y Autorización](#autenticación-y-autorización)

## Características

- **Multi-tienda**: Gestión de múltiples locales desde una sola aplicación
- **Control de inventario**: Gestión de productos con precios y stock específicos por tienda
- **Compras**: Registro de compras a proveedores con items individuales
- **Historial de cambios**: Auditoría completa de modificaciones de productos
- **Categorización**: Organización de productos y proveedores por categorías
- **Gestión de empleados**: Control de acceso por roles (OWNER/EMPLOYEE)
- **Sistema fiscal**: Soporte para diferentes condiciones fiscales y cálculo de IVA
- **Soft delete**: Desactivación en lugar de eliminación permanente
- **Validaciones robustas**: DTOs con class-validator
- **Paginación y búsqueda**: En todos los listados

## Stack Tecnológico

- **Framework**: [NestJS](https://nestjs.com/) v11
- **Lenguaje**: TypeScript
- **ORM**: [Prisma](https://www.prisma.io/) v6
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT + Passport
- **Validación**: class-validator, class-transformer, Joi
- **Testing**: Jest

## Requisitos Previos

- Node.js 18+ y npm
- PostgreSQL 14+
- Git

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd kiosco-app
```

2. Instalar dependencias:
```bash
npm install
```

## Configuración

### Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Database
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/kiosco_db?schema=public"

# Server
PORT=3003

# Auth Service (si se usa un servicio externo)
AUTH_SERVICE_URL="http://localhost:3000"

# JWT
JWT_SECRET="tu_clave_secreta_aqui"
```

### Ejemplo de `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kiosco_db?schema=public"
PORT=3003
AUTH_SERVICE_URL="http://localhost:3000"
JWT_SECRET="kiosco-secret-key-2024"
```

## Base de Datos

### 1. Crear la base de datos

Conectarse a PostgreSQL y crear la base de datos:
```sql
CREATE DATABASE kiosco_db;
```

### 2. Ejecutar migraciones

El proyecto usa una arquitectura modular de Prisma con múltiples schemas en `prisma/schemas/`.

Generar el cliente de Prisma:
```bash
npx prisma generate
```

Crear y aplicar migraciones:
```bash
npx prisma migrate dev --name init
```

### 3. (Opcional) Visualizar la base de datos

Prisma Studio proporciona una interfaz visual:
```bash
npx prisma studio
```

## Ejecutar la Aplicación

### Modo Desarrollo (con hot-reload)
```bash
npm run start:dev
```

### Modo Producción
```bash
# Build
npm run build

# Ejecutar
npm run start:prod
```

### Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

La aplicación estará disponible en: `http://localhost:3003/api`

## Estructura del Proyecto

```
kiosco-app/
├── prisma/
│   ├── schemas/              # Schemas modulares de Prisma
│   │   ├── shop.prisma
│   │   ├── product.prisma
│   │   ├── purchase.prisma
│   │   ├── supplier.prisma
│   │   ├── category.prisma
│   │   ├── employee.prisma
│   │   ├── sale.prisma
│   │   ├── income.prisma
│   │   └── expense.prisma
│   └── schema.prisma         # Schema principal
├── src/
│   ├── auth-client/          # Autenticación JWT
│   ├── shop/                 # Gestión de tiendas
│   ├── product/              # Gestión de productos
│   ├── category/             # Categorías de productos
│   ├── purchase/             # Gestión de compras
│   ├── supplier/             # Gestión de proveedores
│   ├── employee/             # Gestión de empleados
│   ├── prisma/               # Módulo Prisma global
│   ├── config/               # Configuración y variables de entorno
│   ├── app.module.ts
│   └── main.ts
├── .env                      # Variables de entorno (crear)
├── package.json
└── tsconfig.json
```

## Módulos y Endpoints

### Autenticación (`/api/auth-client`)
- `POST /login` - Iniciar sesión
- `POST /register` - Registrar usuario

### Tiendas (`/api/shop`)
- `POST /` - Crear tienda
- `GET /` - Listar tiendas
- `GET /:id` - Obtener tienda por ID
- `PATCH /:id` - Actualizar tienda
- `PATCH /toggle/:id` - Activar/desactivar tienda

### Productos (`/api/product`)
- `POST /` - Crear producto
- `GET /` - Listar productos (con paginación y búsqueda)
  - Query params: `shopId`, `search`, `page`, `limit`
- `GET /barcode/:barcode` - Buscar por código de barras
  - Query param: `shopId`
- `PATCH /:id` - Actualizar producto
- `PATCH /toggle/:id` - Activar/desactivar producto

### Categorías (`/api/category`)
- `POST /` - Crear categoría
- `GET /` - Listar categorías (con paginación y búsqueda)
  - Query params: `shopId`, `search`, `page`, `limit`, `includeInactive`
- `GET /:id` - Obtener categoría por ID
- `PATCH /:id` - Actualizar categoría
- `PATCH /toggle/:id` - Activar/desactivar categoría
- `DELETE /:id` - Eliminar categoría (solo si no tiene productos)

### Compras (`/api/purchase`)
- `POST /` - Registrar compra
- `GET /` - Listar compras
- `GET /:id` - Obtener compra por ID
- `PATCH /:id` - Actualizar compra

### Proveedores (`/api/supplier`)
- `POST /` - Crear proveedor
- `GET /` - Listar proveedores
- `GET /:id` - Obtener proveedor por ID
- `PATCH /:id` - Actualizar proveedor
- `PATCH /toggle/:id` - Activar/desactivar proveedor

### Empleados (`/api/employee`)
- `POST /` - Crear empleado
- `GET /` - Listar empleados
- `GET /:id` - Obtener empleado por ID
- `PATCH /:id` - Actualizar empleado
- `PATCH /toggle/:id` - Activar/desactivar empleado

### Métodos de Pago (`/api/payment-method`)
- `POST /` - Crear método de pago
- `GET /shop/:shopId` - Listar métodos de pago de una tienda
- `GET /:id` - Obtener método de pago por ID
- `PATCH /:id` - Actualizar método de pago
- `PATCH /:id/toggle` - Activar/desactivar método de pago
- `DELETE /:id` - Eliminar método de pago

### Ingresos (`/api/income`)
- `POST /` - Registrar ingreso (requiere paymentMethodId)
- `GET /` - Listar ingresos (solo OWNER)
- `GET /:id` - Obtener ingreso por ID
- `PATCH /:id` - Actualizar ingreso
- `DELETE /:id` - Eliminar ingreso

### Egresos/Gastos (`/api/expense`)
- `POST /` - Registrar gasto (requiere paymentMethodId)
- `GET /` - Listar gastos (solo OWNER)
- `GET /:id` - Obtener gasto por ID
- `PATCH /:id` - Actualizar gasto
- `DELETE /:id` - Eliminar gasto

### Caja Registradora (`/api/cash-register`)
- `POST /open` - Abrir caja registradora
- `PATCH /:id/close` - Cerrar caja registradora
- `GET /current/:shopId` - Obtener caja actual abierta
- `GET /history/:shopId` - Historial de cajas
- `GET /:id` - Obtener detalle de caja por ID
- `GET /report/:shopId` - **Reporte de movimientos con filtros** (día, semana, mes, año)
- `GET /available-years/:shopId` - Obtener años disponibles con movimientos

#### Reportes de Caja Registradora
Ver [CASH_REGISTER_REPORTS.md](./CASH_REGISTER_REPORTS.md) para documentación completa de reportes con:
- Filtros por día, semana, mes, año y período personalizado
- Por defecto muestra la semana actual
- Producto más vendido del mes con ganancia
- Totales desglosados por tipo de operación
- Ejemplos de uso y casos comunes

## Modelo de Datos

### Entidades Principales

#### Shop (Tienda)
```typescript
{
  id: string (UUID)
  name: string
  address: string
  phone: string
  ownerId: string
  taxIdNumber?: string
  taxCondition?: string  // "Responsable Inscripto", "Monotributista", etc.
  taxAddress?: string
  isActive: boolean
  createdAt: DateTime
}
```

#### Product (Producto)
```typescript
{
  id: string (UUID)
  name: string
  description?: string
  barcode?: string
  categoryId?: string
  taxRate?: number       // Porcentaje de IVA (0-27)
  taxCategory?: string   // "Gravado", "Exento", "No Alcanzado"
  createdAt: DateTime
}
```

#### ShopProduct (Producto en Tienda)
Relación many-to-many entre Product y Shop con datos específicos:
```typescript
{
  id: string (UUID)
  shopId: string
  productId: string
  costPrice: number
  salePrice: number
  stock?: number
  currency: string       // Default: "ARS"
  isActive: boolean
  createdBy?: string
  createdAt: DateTime
}
```

#### Category (Categoría)
```typescript
{
  id: string (UUID)
  name: string
  shopId: string
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
  createdBy?: string
  updatedBy?: string
  disabledAt?: DateTime
  disabledBy?: string
}
```

#### Purchase (Compra)
```typescript
{
  id: string (UUID)
  supplierId?: string
  shopId: string
  paymentMethodId: string  // Método de pago utilizado
  totalAmount?: number
  purchaseDate: DateTime
  notes?: string
  items: PurchaseItem[]
}
```

#### PurchaseItem (Item de Compra)
```typescript
{
  id: string (UUID)
  purchaseId: string
  shopProductId: string
  quantity: number
  unitCost: number
  subtotal: number
}
```

#### Supplier (Proveedor)
```typescript
{
  id: string (UUID)
  name: string
  ownerId: string
  contactName?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  categoryId?: string
  isActive: boolean
  createdAt: DateTime
}
```

#### Employee (Empleado)
```typescript
{
  id: string (UUID)
  fullName: string
  email: string (unique)
  role: string
  shopId: string
  phone?: string
  dni?: string
  salary?: number
  hireDate?: DateTime
  isActive: boolean
  createdAt: DateTime
}
```

#### PaymentMethod (Método de Pago)
```typescript
{
  id: string (UUID)
  shopId: string
  name: string           // "Efectivo", "Tarjeta Débito", etc.
  code: string          // "CASH", "DEBIT_CARD", etc.
  description?: string
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Income (Ingreso)
```typescript
{
  id: string (UUID)
  shopId: string
  paymentMethodId: string  // Método de pago utilizado
  amount: number
  description: string
  category?: string
  date: DateTime
  createdBy?: string
}
```

#### Expense (Gasto/Egreso)
```typescript
{
  id: string (UUID)
  shopId: string
  paymentMethodId: string  // Método de pago utilizado
  amount: number
  description: string
  category?: string
  date: DateTime
  createdBy?: string
}
```

## Autenticación y Autorización

### Autenticación JWT

Todos los endpoints (excepto `/login` y `/register`) requieren autenticación mediante JWT.

#### Obtener Token
```bash
POST /api/auth-client/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
```

Respuesta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "role": "OWNER"
  }
}
```

#### Usar Token
```bash
GET /api/product
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Roles

- **OWNER**: Propietario con acceso completo a sus tiendas
  - Puede crear, editar y eliminar cualquier recurso
  - Gestiona múltiples tiendas
  - Puede activar/desactivar recursos

- **EMPLOYEE**: Empleado con acceso limitado
  - Solo puede ver y editar recursos de su tienda asignada
  - No puede eliminar ni desactivar recursos
  - Acceso de solo lectura a ciertos recursos

## Características de Seguridad

- Validación de entrada con DTOs
- Protección contra inyección SQL (Prisma ORM)
- CORS configurado
- Variables de entorno para secretos
- Control de acceso por roles
- Soft delete en lugar de eliminación física

## Configuración CORS

Por defecto, CORS está configurado para `http://localhost:5173`. Para modificarlo:

```typescript
// src/main.ts
app.enableCors({
  origin: 'http://tu-frontend.com',
  credentials: true,
  methods: 'GET,POST,DELETE,PUT,PATCH',
  allowedHeaders: '*',
});
```

## Scripts Disponibles

```bash
# Desarrollo
npm run start:dev

# Build
npm run build

# Producción
npm run start:prod

# Tests
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e

# Linting y formato
npm run lint
npm run format

# Prisma
npx prisma generate        # Generar cliente
npx prisma migrate dev     # Crear migración
npx prisma studio          # Abrir Prisma Studio
npx prisma db push         # Push schema a DB (sin migraciones)
```

## Próximas Características

- [ ] Módulo de ventas completo
- [ ] Reportes y estadísticas
- [ ] Gestión de ingresos y gastos
- [ ] Dashboard con métricas
- [ ] Exportación a Excel/PDF
- [ ] Notificaciones de stock bajo
- [ ] Sistema de cajas

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto es privado y no tiene licencia pública.

## Soporte

Para reportar bugs o solicitar features, crear un issue en el repositorio.
