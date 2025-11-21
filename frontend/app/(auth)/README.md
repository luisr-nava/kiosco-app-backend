# Sistema de Autenticación - Arquitectura

Este directorio contiene toda la lógica de autenticación de la aplicación usando **Zustand** para estado global, **TanStack Query** para mutations, y **react-hook-form** para formularios.

## 📁 Estructura

```
app/(auth)/
├── actions/              # Llamadas API (login, register)
│   ├── loginActions.ts
│   └── registerAction.ts
├── components/           # Componentes de UI
│   ├── auth-provider.tsx # Provider que hidrata el estado
│   ├── login-form.tsx    # Formulario de login
│   ├── register-form.tsx # Formulario de registro
│   ├── navbar.tsx        # Navbar pública
│   └── user-menu.tsx     # Menú de usuario autenticado
├── hooks/                # Custom hooks
│   ├── useAuth.ts        # Hook para acceder al estado
│   ├── useLogin.ts       # Hook para login con TanStack Query
│   ├── useRegister.ts    # Hook para registro
│   ├── useLogout.ts      # Hook para logout
│   ├── useGoogleAuth.ts  # Hook para Google OAuth
│   └── index.ts          # Barrel export
├── interfaces/           # TypeScript interfaces
│   └── index.ts
├── store/                # Zustand store
│   ├── slices/
│   │   └── auth.slice.ts # Store de autenticación
│   └── types/
│       └── auth.entity.ts # Types del store
├── login/                # Página de login
│   └── page.tsx
└── register/             # Página de registro
    └── page.tsx
```

## 🔑 Estado Global con Zustand

### Store (`auth.slice.ts`)

El store maneja:
- **Estado de autenticación**: `user`, `token`, `refreshToken`, `projectId`, `isAuthenticated`, `isLoading`
- **Persistencia**: Usa `zustand/middleware` para persistir `user` y `projectId` en localStorage
- **Seguridad**: Los tokens se guardan en **cookies** (no en localStorage por seguridad)

### Funciones del Store

#### `setAuth(data)`
Guarda los datos de autenticación después del login:
```typescript
setAuth({
  user: { id, fullName, email, role, ... },
  token: "jwt_token",
  refreshToken: "refresh_token",
  projectId: "uuid"
});
```
- Guarda tokens en **cookies** (httpOnly simulado)
- Actualiza el estado de Zustand
- Marca `isAuthenticated = true`

#### `setUser(user)`
Actualiza solo los datos del usuario:
```typescript
setUser({ ...user, fullName: "Nuevo Nombre" });
```

#### `clearAuth()`
Limpia toda la autenticación (logout):
- Elimina cookies (`token`, `refreshToken`, `projectId`)
- Resetea el estado de Zustand
- Marca `isAuthenticated = false`

#### `checkAuth()`
Verifica si hay una sesión válida:
- Lee cookies
- Si hay token y projectId → autentica
- Si no → limpia el estado

#### `hydrate()`
Se ejecuta al iniciar la app para restaurar la sesión:
- Lee cookies y localStorage
- Restaura el estado si hay sesión válida
- Se llama automáticamente en `AuthProvider`

## 🪝 Custom Hooks

### `useAuth()` - Acceder al Estado
```typescript
const { user, token, projectId, isAuthenticated, isLoading } = useAuth();

// Ejemplo de uso
if (!isAuthenticated) return <LoginForm />;
return <Dashboard user={user} />;
```

### `useLogin()` - Login con TanStack Query
```typescript
const { login, isLoading, error, isError } = useLogin();

// Uso en formulario
const onSubmit = (data) => {
  login({ email: data.email, password: data.password });
};
```

**Flujo:**
1. Llama a `loginActions(email, password)`
2. Backend responde con `{ user, token, refreshToken, projectId }`
3. Guarda en Zustand store con `setAuth()`
4. Redirige a `/dashboard`

### `useRegister()` - Registro
```typescript
const { register, isLoading, error, isError } = useRegister();

// Uso
register({ fullName, email, password });
```

**Flujo:**
1. Llama a `registerAction(payload)`
2. Backend crea usuario y envía email de verificación
3. Redirige a `/login` para que el usuario verifique su email

### `useLogout()` - Cerrar Sesión
```typescript
const { logout, isLoading } = useLogout();

// Uso
<Button onClick={() => logout()}>Cerrar sesión</Button>
```

**Flujo:**
1. (Opcional) Llama a `POST /auth-client/logout` en backend
2. Ejecuta `clearAuth()` del store
3. Redirige a `/login`

### `useGoogleAuth()` - Google OAuth
```typescript
const { signInWithGoogle, isLoading } = useGoogleAuth();

// Uso
<Button onClick={() => signInWithGoogle()}>Google</Button>
```

**Flujo:**
1. Redirige a `${backend}/api/auth-client/google`
2. Backend maneja el OAuth con Google
3. Callback devuelve usuario autenticado

## 🔄 Flujo Completo de Autenticación

### 1. Inicio de Aplicación
```
App carga → AuthProvider se monta → hydrate() se ejecuta
  ↓
¿Hay token en cookies?
  ✓ SÍ → Restaurar sesión (isAuthenticated = true)
  ✗ NO → Estado inicial (isAuthenticated = false)
```

### 2. Login
```
Usuario llena formulario → useLogin().login() → loginActions()
  ↓
Backend responde → setAuth() → Cookies + Zustand
  ↓
Redirige a /dashboard → useAuth() lee el estado → Renderiza info del usuario
```

### 3. Registro
```
Usuario llena formulario → useRegister().register() → registerAction()
  ↓
Backend crea usuario → Envía email de verificación
  ↓
Redirige a /login → Usuario verifica email → Login
```

### 4. Logout
```
Usuario hace clic → useLogout().logout() → clearAuth()
  ↓
Limpia cookies + Zustand → Redirige a /login
```

## 🛡️ Seguridad

### Tokens en Cookies (NO localStorage)
```typescript
// ✅ CORRECTO (en auth.slice.ts)
Cookies.set("token", data.token, { expires: 7 });

// ❌ INCORRECTO (vulnerable a XSS)
localStorage.setItem("token", data.token);
```

### Persistencia Selectiva
```typescript
// Solo se persisten datos no sensibles
partialize: (state) => ({
  user: state.user,
  projectId: state.projectId,
  // NO se persisten: token, refreshToken
})
```

### Hidratación Segura
```typescript
// Al hidratar, los tokens vienen de cookies (más seguras)
hydrate: () => {
  const token = Cookies.get("token"); // ✅
  // NO de localStorage
}
```

## 📦 Componentes

### `AuthProvider`
Provider global que hidrata el estado al montar:
```tsx
// app/providers.tsx
<AuthProvider>
  {children}
</AuthProvider>
```

### `LoginForm`
Formulario con react-hook-form + useLogin:
```tsx
const { login, isLoading, error } = useLogin();
const { register, handleSubmit } = useForm();

const onSubmit = (data) => login(data);
```

### `RegisterForm`
Formulario simplificado (fullName, email, password):
```tsx
const { register: registerUser, isLoading } = useRegister();
```

### `UserMenu`
Dropdown con info del usuario y logout:
```tsx
const { user } = useAuth();
const { logout } = useLogout();

return (
  <DropdownMenu>
    <UserInfo user={user} />
    <LogoutButton onClick={logout} />
  </DropdownMenu>
);
```

## 🎯 Ventajas de esta Arquitectura

### ✅ Sin useState en Lógica de Auth
- Todo el estado global en **Zustand**
- Estado de formularios en **react-hook-form**
- Estado de mutations en **TanStack Query**

### ✅ Separación de Responsabilidades
- **Actions**: Llamadas API puras
- **Hooks**: Lógica de negocio + mutations
- **Store**: Estado global centralizado
- **Components**: Solo UI

### ✅ Type-Safe
```typescript
interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  // ...
}
```
Todo tipado con TypeScript, autocomplete completo.

### ✅ Testeable
```typescript
// Mock del store
jest.mock("../store/slices/auth.slice");

// Test del hook
const { result } = renderHook(() => useLogin());
act(() => result.current.login({ email, password }));
```

### ✅ Performance
- Zustand: Re-renders optimizados (solo componentes que usan el estado cambiado)
- TanStack Query: Caché automático, retry, deduplicación
- react-hook-form: Menos re-renders que controlled inputs

### ✅ Persistencia Inteligente
- User y projectId en **localStorage** (sobreviven refresh)
- Tokens en **cookies** (más seguros, expiran automáticamente)

## 🚀 Uso en Nuevos Componentes

### Verificar Autenticación
```tsx
"use client";
import { useAuth } from "@/app/(auth)/hooks";

export default function ProtectedPage() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return <div>Hola, {user.fullName}</div>;
}
```

### Hacer Logout
```tsx
"use client";
import { useLogout } from "@/app/(auth)/hooks";

export function LogoutButton() {
  const { logout, isLoading } = useLogout();

  return (
    <Button onClick={() => logout()} disabled={isLoading}>
      {isLoading ? "Cerrando..." : "Cerrar sesión"}
    </Button>
  );
}
```

### Acceder a Datos del Usuario
```tsx
const { user, projectId } = useAuth();

console.log(user.role); // "OWNER" | "EMPLOYEE" | "MANAGER"
console.log(projectId); // "uuid-del-proyecto"
```

## 🔗 Integración con Backend

### Endpoints Usados
- `POST /auth-client/login` → useLogin
- `POST /auth-client/register` → useRegister
- `POST /auth-client/logout` → useLogout
- `GET /auth-client/google` → useGoogleAuth

### Axios Interceptor
El interceptor en `lib/kioscoApi.ts` automáticamente:
- Agrega el token en header: `Authorization: Bearer ${token}`
- Maneja 401: Limpia auth y redirige a `/login`

```typescript
kioscoApi.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 📝 Notas Importantes

1. **NO usar useState para auth**: Todo en Zustand
2. **Tokens en cookies**: Nunca en localStorage
3. **Hidratar al inicio**: AuthProvider hace hydrate() automáticamente
4. **Logout limpia todo**: clearAuth() elimina cookies + estado
5. **TypeScript strict**: Todas las interfaces están tipadas

---

**Última actualización:** 2024
**Autor:** Sistema de autenticación moderno con Zustand + TanStack Query
