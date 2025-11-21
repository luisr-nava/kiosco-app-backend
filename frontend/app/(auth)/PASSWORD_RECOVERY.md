# Flujo de Recuperación de Contraseña

Documentación completa del sistema de recuperación de contraseña implementado con Next.js 16, react-hook-form, TanStack Query y Sonner.

## 🔄 Flujo Completo

### 1. Usuario Olvida su Contraseña

```
Usuario en /login
  ↓
Click en "¿Olvidaste tu contraseña?"
  ↓
Redirige a /forgot-password
```

### 2. Solicitar Email de Recuperación

```
/forgot-password
  ↓
Usuario ingresa email
  ↓
useForgotPassword().sendResetEmail()
  ↓
POST /auth-client/forgot-password
  ↓
Backend envía email con token
  ↓
Toast: "Email enviado - Te hemos enviado un email con instrucciones..."
```

### 3. Usuario Recibe Email

Email contiene un enlace:
```
http://localhost:3000/reset-password?token=abc123xyz
```

### 4. Restablecer Contraseña

```
Usuario hace click en el enlace del email
  ↓
/reset-password?token=abc123xyz
  ↓
Usuario ingresa nueva contraseña
  ↓
useResetPassword().resetPassword()
  ↓
POST /auth-client/reset-password
  ↓
Toast: "¡Contraseña restablecida! - Tu contraseña ha sido actualizada..."
  ↓
Espera 1.5 segundos
  ↓
Redirige a /login
```

## 📁 Archivos Creados

### Actions (API Calls)

**`forgotPasswordAction.ts`**
- Endpoint: `POST /auth-client/forgot-password`
- Input: `{ email: string }`
- Output: `{ message: string }`
- Maneja errores con AxiosError

**`resetPasswordAction.ts`**
- Endpoint: `POST /auth-client/reset-password`
- Input: `{ token: string, newPassword: string }`
- Output: `{ message: string }`
- Maneja errores con AxiosError

### Hooks (TanStack Query)

**`useForgotPassword.ts`**
- `sendResetEmail(email)` - Mutation
- Toast de éxito con instrucciones
- Manejo de errores:
  - 404: Email no encontrado
  - 429: Demasiadas solicitudes
  - 500: Error del servidor

**`useResetPassword.ts`**
- `resetPassword({ token, newPassword })` - Mutation
- Toast de éxito
- Redirige a `/login` después de 1.5s
- Manejo de errores:
  - 400: Token inválido o expirado
  - 404: Usuario no encontrado
  - 422: Contraseña inválida
  - 500: Error del servidor

### Componentes

**`forgot-password-form.tsx`**
- Formulario con react-hook-form
- Campo: Email
- Validación: Email requerido + formato válido
- Link: "Volver al inicio de sesión" → `/login`
- Botón: "Enviar enlace de recuperación"

**`reset-password-form.tsx`**
- Formulario con react-hook-form
- Campos: Nueva contraseña + Confirmar contraseña
- Validación:
  - Contraseña requerida
  - Mínimo 6 caracteres
  - Contraseñas deben coincidir
- Recibe token como prop
- Botón: "Restablecer contraseña"

### Páginas

**`/forgot-password/page.tsx`**
- Título: "Recuperar Contraseña"
- Descripción: "Ingresa tu email y te enviaremos un enlace..."
- Renderiza: `<ForgotPasswordForm />`

**`/reset-password/page.tsx`**
- Obtiene token de query params
- Si NO hay token: Muestra alerta con link a `/forgot-password`
- Si hay token: Renderiza `<ResetPasswordForm token={token} />`
- Usa Suspense para loading state
- Título: "Restablecer Contraseña"

## 🎨 Mensajes de Toast

### Forgot Password

**Éxito:**
```
✅ Email enviado
Te hemos enviado un email con instrucciones para restablecer
tu contraseña. Revisa tu bandeja de entrada.
```

**Errores:**
- **404:** "Email no encontrado - No existe una cuenta con este email."
- **429:** "Demasiadas solicitudes - Has solicitado demasiados emails..."
- **500:** "Error del servidor - Ocurrió un error en el servidor..."

### Reset Password

**Éxito:**
```
✅ ¡Contraseña restablecida!
Tu contraseña ha sido actualizada correctamente. Ahora puedes
iniciar sesión con tu nueva contraseña.
```

**Errores:**
- **400:** "Token inválido o expirado - El enlace es inválido o ha expirado."
- **404:** "Usuario no encontrado - No se encontró el usuario asociado."
- **422:** "Contraseña inválida - La contraseña debe tener al menos 6 caracteres."
- **500:** "Error del servidor - Ocurrió un error en el servidor..."

## 🔐 Validaciones

### Forgot Password Form

```typescript
email: {
  required: "El email es requerido",
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Ingresa un email válido"
  }
}
```

### Reset Password Form

```typescript
password: {
  required: "La contraseña es requerida",
  minLength: {
    value: 6,
    message: "La contraseña debe tener al menos 6 caracteres"
  }
}

confirmPassword: {
  required: "Debes confirmar la contraseña",
  validate: (value) =>
    value === password || "Las contraseñas no coinciden"
}
```

## 🎯 Integración en Login Form

En `login-form.tsx` se agregó el enlace:

```tsx
<div className="flex items-center justify-between">
  <Label htmlFor="password">Contraseña</Label>
  <a href="/forgot-password" className="text-sm text-primary hover:underline">
    ¿Olvidaste tu contraseña?
  </a>
</div>
```

## 📊 Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Login Page (/login)                                      │
│    - Click "¿Olvidaste tu contraseña?"                      │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Forgot Password Page (/forgot-password)                  │
│    - Ingresa email                                          │
│    - useForgotPassword().sendResetEmail()                   │
│    - POST /auth-client/forgot-password                      │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend                                                   │
│    - Genera token único (expira en 1 hora)                 │
│    - Envía email con enlace:                                │
│      http://localhost:3000/reset-password?token=xyz         │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Usuario Recibe Email                                     │
│    - Click en el enlace                                     │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Reset Password Page (/reset-password?token=xyz)         │
│    - Extrae token de query params                           │
│    - Ingresa nueva contraseña                               │
│    - useResetPassword().resetPassword()                     │
│    - POST /auth-client/reset-password                       │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Backend                                                   │
│    - Valida token (no expirado, existe)                     │
│    - Hashea nueva contraseña                                │
│    - Actualiza password en DB                               │
│    - Invalida token usado                                   │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Frontend                                                  │
│    - Toast: "¡Contraseña restablecida!"                     │
│    - Espera 1.5 segundos                                    │
│    - Redirige a /login                                      │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Login con Nueva Contraseña                               │
│    - Usuario inicia sesión normalmente                      │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Rutas Disponibles

| Ruta | Descripción |
|------|-------------|
| `/login` | Página de inicio de sesión con enlace a forgot-password |
| `/forgot-password` | Solicitar email de recuperación |
| `/reset-password?token=xyz` | Restablecer contraseña con token del email |

## 🔗 Backend Endpoints Utilizados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth-client/forgot-password` | Envía email de recuperación |
| POST | `/auth-client/reset-password` | Restablece la contraseña |

Ver documentación completa del backend en `../backend/CLAUDE.md`.

## 💡 Mejores Prácticas Implementadas

✅ **Validación de formularios** con react-hook-form
✅ **State management** con TanStack Query (no useState)
✅ **Toasts** con Sonner para feedback
✅ **Manejo de errores** específico por código HTTP
✅ **TypeScript** strict typing
✅ **Seguridad** - Token desde backend, no frontend
✅ **UX** - Mensajes claros y descriptivos
✅ **Accesibilidad** - Labels, placeholders, estados de loading

## 🛡️ Seguridad

1. **Token único por solicitud:** Cada email tiene un token diferente
2. **Expiración:** Los tokens expiran (configurado en backend)
3. **Un solo uso:** El token se invalida después de usarse
4. **No hay información sensible en URL:** Solo el token (opaco)
5. **Validación en backend:** Toda la lógica de seguridad está en el servidor

## 📝 Notas de Implementación

- Los tokens se envían por email, **NO** se generan en frontend
- La expiración del token es manejada por el backend
- Si el token es inválido/expirado, se muestra error claro
- El usuario puede solicitar múltiples emails (con rate limiting en backend)
- Después de resetear, el usuario debe hacer login manual

---

**Implementación completa y funcional del flujo de recuperación de contraseña siguiendo las mejores prácticas de Next.js 16 y React moderno.**
