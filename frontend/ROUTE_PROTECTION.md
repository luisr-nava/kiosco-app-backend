# Sistema de Protección de Rutas - Kiosco App

## Descripción General

El sistema de protección de rutas asegura que:
- ✅ Los usuarios autenticados NO pueden acceder a rutas de autenticación
- ✅ Los usuarios NO autenticados NO pueden acceder a rutas privadas
- ✅ Las rutas públicas son accesibles para todos
- ✅ Se mantiene la URL de destino para redirección después del login

## Arquitectura

El sistema usa una estrategia de doble protección:

### 1. **Middleware (Server-Side)**
Protección en el nivel del servidor que intercepta las peticiones antes de renderizar.

**Archivo:** `middleware.ts`

**Funcionalidad:**
- Verifica el token en las cookies
- Redirige usuarios autenticados que intentan acceder a rutas auth → `/`
- Redirige usuarios NO autenticados que intentan acceder a rutas privadas → `/login?redirect=<ruta>`
- Permite acceso libre a rutas públicas

### 2. **Guards (Client-Side)**
Componentes React que verifican la autenticación en el lado del cliente.

#### AuthGuard
**Archivo:** `app/(auth)/components/auth-guard.tsx`

**Propósito:** Protege rutas de autenticación

**Uso:**
```tsx
<AuthGuard>
  <LoginForm />
</AuthGuard>
```

**Comportamiento:**
- Si el usuario está autenticado → Redirecciona a `/`
- Si el usuario NO está autenticado → Muestra el contenido
- Muestra loading durante la verificación

#### PrivateRouteGuard
**Archivo:** `components/guards/private-route-guard.tsx`

**Propósito:** Protege rutas privadas

**Uso:**
```tsx
<PrivateRouteGuard>
  <DashboardContent />
</PrivateRouteGuard>
```

**Comportamiento:**
- Si el usuario NO está autenticado → Redirecciona a `/login?redirect=<ruta>`
- Si el usuario está autenticado → Muestra el contenido
- Muestra loading durante la verificación

## Tipos de Rutas

### Rutas de Autenticación (Auth Routes)
**Acceso:** Solo usuarios NO autenticados

Rutas:
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-account`

**Protección:**
- Middleware ✅
- AuthGuard en layout ✅

### Rutas Privadas (Private Routes)
**Acceso:** Solo usuarios autenticados

Rutas:
- `/dashboard`
- (Todas las rutas dentro de `app/(private)/`)

**Protección:**
- Middleware ✅
- PrivateRouteGuard en layout ✅

### Rutas Públicas (Public Routes)
**Acceso:** Todos los usuarios

Rutas:
- `/` (Home)
- `/pricing`
- `/terms`
- `/privacy`

**Protección:** Ninguna (acceso libre)

## Flujo de Redirección

### Caso 1: Usuario NO autenticado intenta acceder a ruta privada

```
Usuario → /dashboard
   ↓
Middleware detecta ausencia de token
   ↓
Redirige a /login?redirect=/dashboard
   ↓
Usuario inicia sesión
   ↓
useLogin lee el parámetro redirect
   ↓
Redirige a /dashboard
```

### Caso 2: Usuario autenticado intenta acceder a ruta de auth

```
Usuario autenticado → /login
   ↓
Middleware detecta token
   ↓
Redirige a /
```

### Caso 3: Usuario autenticado accede a ruta privada

```
Usuario autenticado → /dashboard
   ↓
Middleware verifica token ✓
   ↓
PrivateRouteGuard verifica autenticación ✓
   ↓
Muestra contenido
```

## Implementación por Capas

### Layer 1: Middleware (Primera línea de defensa)
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  // Lógica de redirección
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!token && isPrivateRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
```

### Layer 2: Layout Guards (Segunda línea de defensa)

**Auth Layout:**
```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({ children }) {
  return (
    <AuthGuard>
      <Navbar />
      <main>{children}</main>
    </AuthGuard>
  );
}
```

**Private Layout:**
```tsx
// app/(private)/layout.tsx
export default function PrivateLayout({ children }) {
  return <PrivateRouteGuard>{children}</PrivateRouteGuard>;
}
```

### Layer 3: Hooks (Manejo de redirección post-auth)

**useLogin Hook:**
```typescript
export const useLogin = () => {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const mutation = useMutation({
    onSuccess: (data) => {
      setAuth(data);
      router.push(redirectUrl); // Usa el redirect param
    },
  });
};
```

## Estado de Autenticación

El estado de autenticación se maneja con Zustand:

**Store:** `app/(auth)/store/slices/auth.slice.ts`

**Persistencia:**
- Token en cookies (httpOnly recomendado en producción)
- User data en localStorage
- Hidratación al cargar la app

**Hooks disponibles:**
```typescript
const { isAuthenticated, isLoading, user } = useAuth();
```

## Matcher del Middleware

El middleware se aplica a todas las rutas excepto:
- `/api/*` - API routes
- `/_next/static/*` - Archivos estáticos
- `/_next/image/*` - Optimización de imágenes
- `/favicon.ico` - Favicon
- Archivos de imagen (svg, png, jpg, etc.)

```typescript
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

## Testing

### Escenarios de prueba:

1. ✅ Usuario NO autenticado intenta ir a `/dashboard` → Redirige a `/login?redirect=/dashboard`
2. ✅ Usuario NO autenticado hace login → Redirige a `/dashboard` (o URL en redirect param)
3. ✅ Usuario autenticado intenta ir a `/login` → Redirige a `/`
4. ✅ Usuario autenticado intenta ir a `/register` → Redirige a `/`
5. ✅ Usuario autenticado puede acceder a `/dashboard`
6. ✅ Cualquier usuario puede acceder a `/`, `/pricing`, `/terms`, `/privacy`
7. ✅ Usuario autenticado hace logout → Puede acceder a rutas auth
8. ✅ Token expirado se maneja correctamente

## Mejoras Futuras

- [ ] Implementar refresh token automático
- [ ] Agregar roles y permisos
- [ ] Implementar remember me
- [ ] Agregar rate limiting al login
- [ ] Implementar sesiones múltiples
- [ ] Agregar logging de eventos de seguridad
- [ ] Implementar 2FA obligatorio para admins
- [ ] Agregar detección de sesiones concurrentes

## Seguridad

### Recomendaciones de producción:

1. **Tokens en cookies httpOnly:**
```typescript
// En el backend
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
});
```

2. **CSRF Protection:**
Implementar tokens CSRF para peticiones POST/PUT/DELETE

3. **Rate Limiting:**
Limitar intentos de login fallidos

4. **Session Timeout:**
Implementar timeout de sesión por inactividad

5. **Secure Headers:**
Usar headers de seguridad (HSTS, CSP, etc.)

## Troubleshooting

### Problema: Loop de redirección
**Causa:** Cookie no se está guardando/leyendo correctamente
**Solución:** Verificar que el dominio de la cookie coincida

### Problema: Usuario redirigido incorrectamente
**Causa:** Orden de evaluación en middleware
**Solución:** Verificar que las condiciones del middleware sean correctas

### Problema: Loading infinito
**Causa:** Hook useAuth no actualiza isLoading
**Solución:** Verificar que hydrate() se llame correctamente en AuthProvider

## Conclusión

El sistema de protección de rutas implementa múltiples capas de seguridad para asegurar que solo los usuarios autorizados puedan acceder a recursos protegidos, mientras mantiene una experiencia de usuario fluida con redirecciones inteligentes.
