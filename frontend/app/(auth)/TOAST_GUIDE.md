# Guía de Toasts con Sonner

Este proyecto usa **Sonner** para mostrar notificaciones toast de una manera moderna y elegante.

## 📦 Configuración

### Instalación
Sonner ya está instalado en el proyecto:
```json
"sonner": "^2.0.7"
```

### Provider
El `<Toaster />` está configurado en `app/providers.tsx`:
```tsx
import { Toaster } from "sonner";

<Toaster
  position="top-right"  // Posición de los toasts
  richColors            // Colores según el tipo (success, error, etc)
  closeButton          // Botón de cerrar en cada toast
/>
```

## 🎨 Tipos de Toasts

### ✅ Success (Éxito)
```typescript
import { toast } from "sonner";

toast.success("Título del éxito", {
  description: "Descripción detallada del éxito",
  duration: 4000, // 4 segundos (opcional)
});
```

**Ejemplo en Login:**
```typescript
toast.success("¡Bienvenido!", {
  description: `Inicio de sesión exitoso. Hola, ${data.user.fullName}`,
});
```

### ❌ Error
```typescript
toast.error("Título del error", {
  description: "Descripción del error",
});
```

**Ejemplo en Login:**
```typescript
const errorMessage =
  error?.response?.data?.message ||
  error?.message ||
  "Error al iniciar sesión. Verifica tus credenciales.";

toast.error("Error de autenticación", {
  description: errorMessage,
});
```

### ⚠️ Warning (Advertencia)
```typescript
toast.warning("Título de advertencia", {
  description: "Mensaje de advertencia",
});
```

**Ejemplo en Logout (cuando falla el backend pero se hace logout local):**
```typescript
toast.warning("Sesión cerrada localmente", {
  description: "No se pudo contactar con el servidor, pero la sesión se cerró localmente.",
});
```

### ℹ️ Info (Información)
```typescript
toast.info("Título informativo", {
  description: "Mensaje informativo",
});
```

**Ejemplo en Google OAuth:**
```typescript
toast.info("Redirigiendo a Google", {
  description: "Serás redirigido a Google para autenticarte",
});
```

### 🔄 Loading (Cargando)
```typescript
const toastId = toast.loading("Procesando...");

// Cuando termine:
toast.success("¡Completado!", { id: toastId });
// o
toast.error("Error", { id: toastId });
```

### 🎯 Promise (Para async/await)
```typescript
toast.promise(
  fetch('/api/data'),
  {
    loading: 'Cargando datos...',
    success: (data) => `${data.count} datos cargados`,
    error: 'Error al cargar datos',
  }
);
```

## 🎛️ Opciones Avanzadas

### Duration (Duración)
```typescript
toast.success("Mensaje", {
  duration: 5000, // 5 segundos
});

// Infinito (hasta que el usuario lo cierre)
toast.success("Mensaje permanente", {
  duration: Infinity,
});
```

### Action (Botón de acción)
```typescript
toast.success("Archivo guardado", {
  description: "¿Quieres abrirlo?",
  action: {
    label: "Abrir",
    onClick: () => window.open('/file'),
  },
});
```

### Cancelar un Toast
```typescript
const id = toast.success("Mensaje");

// Más tarde...
toast.dismiss(id);

// Cancelar todos
toast.dismiss();
```

### Custom Toast
```typescript
toast.custom((t) => (
  <div className="bg-primary text-primary-foreground p-4 rounded-lg">
    <h3 className="font-bold">Custom Toast</h3>
    <p>Contenido personalizado</p>
    <button onClick={() => toast.dismiss(t)}>Cerrar</button>
  </div>
));
```

## 📍 Implementación en el Proyecto

### En Hooks (Patrón Recomendado)

#### useLogin.ts
```typescript
import { toast } from "sonner";

export const useLogin = () => {
  const mutation = useMutation({
    onSuccess: (data) => {
      toast.success("¡Bienvenido!", {
        description: `Hola, ${data.user.fullName}`,
      });
    },
    onError: (error) => {
      toast.error("Error de autenticación", {
        description: error?.response?.data?.message || "Error al iniciar sesión",
      });
    },
  });
};
```

#### useRegister.ts
```typescript
onSuccess: (data) => {
  toast.success("¡Cuenta creada exitosamente!", {
    description: "Te hemos enviado un email de verificación.",
    duration: 5000, // 5 segundos
  });
};
```

#### useLogout.ts
```typescript
onSuccess: () => {
  toast.success("Sesión cerrada", {
    description: "Has cerrado sesión correctamente",
  });
};
```

### En Componentes (Uso Directo)

```tsx
import { toast } from "sonner";

function MyComponent() {
  const handleSave = async () => {
    try {
      await saveData();
      toast.success("Datos guardados");
    } catch (error) {
      toast.error("Error al guardar");
    }
  };

  return <button onClick={handleSave}>Guardar</button>;
}
```

## 🎨 Integración con Temas (Dark/Light)

Sonner detecta automáticamente el tema:
- En **light mode**: Fondo blanco, texto oscuro
- En **dark mode**: Fondo oscuro, texto claro

La opción `richColors` aplica colores semánticos:
- Success: Verde
- Error: Rojo
- Warning: Amarillo/Naranja
- Info: Azul

## 🔥 Mejores Prácticas

### ✅ DO (Hacer)

1. **Usar toasts en hooks**, no en componentes:
```typescript
// ✅ CORRECTO - En el hook
export const useLogin = () => {
  const mutation = useMutation({
    onSuccess: () => toast.success("Login exitoso"),
  });
};
```

2. **Mensajes descriptivos**:
```typescript
// ✅ CORRECTO
toast.error("Error de autenticación", {
  description: "El email o la contraseña son incorrectos",
});

// ❌ INCORRECTO
toast.error("Error");
```

3. **Duración apropiada**:
```typescript
// ✅ Mensaje importante - más tiempo
toast.success("Cuenta creada", { duration: 5000 });

// ✅ Mensaje simple - menos tiempo
toast.success("Guardado", { duration: 2000 });
```

4. **Manejo de errores del backend**:
```typescript
// ✅ CORRECTO - Muestra mensaje del backend si existe
const errorMessage =
  error?.response?.data?.message ||
  error?.message ||
  "Error desconocido";

toast.error("Error", { description: errorMessage });
```

### ❌ DON'T (No hacer)

1. **No usar toasts Y alertas al mismo tiempo**:
```typescript
// ❌ INCORRECTO
toast.error("Error");
<Alert variant="destructive">Error</Alert> // Redundante
```

2. **No usar toasts para validaciones de formulario**:
```typescript
// ❌ INCORRECTO
if (!email) {
  toast.error("Email requerido");
}

// ✅ CORRECTO - Usar errores de react-hook-form
<p className="text-destructive">{errors.email?.message}</p>
```

3. **No hacer spam de toasts**:
```typescript
// ❌ INCORRECTO
items.forEach(item => {
  toast.success(`Item ${item} guardado`);
});

// ✅ CORRECTO
toast.success(`${items.length} items guardados`);
```

## 🚀 Casos de Uso en el Proyecto

### Autenticación
- ✅ Login exitoso
- ❌ Error de credenciales
- ✅ Registro exitoso + recordatorio de verificación de email
- ✅ Logout exitoso
- ℹ️ Redirigiendo a Google OAuth

### Operaciones CRUD
```typescript
// Crear
toast.success("Producto creado", {
  description: "El producto se agregó al inventario",
});

// Actualizar
toast.success("Producto actualizado");

// Eliminar
toast.success("Producto eliminado");

// Error
toast.error("Error al crear producto", {
  description: error?.response?.data?.message,
});
```

### Formularios
```typescript
// Validación exitosa
toast.success("Formulario enviado");

// Error de validación
toast.error("Faltan campos requeridos");
```

### Operaciones Asíncronas
```typescript
toast.promise(
  uploadFile(file),
  {
    loading: 'Subiendo archivo...',
    success: (data) => `Archivo ${data.name} subido`,
    error: 'Error al subir archivo',
  }
);
```

## 📊 Posiciones Disponibles

```typescript
<Toaster position="top-right" />    // ✅ Actual (recomendado)
<Toaster position="top-left" />
<Toaster position="top-center" />
<Toaster position="bottom-right" />
<Toaster position="bottom-left" />
<Toaster position="bottom-center" />
```

## 🔗 Referencias

- [Documentación oficial de Sonner](https://sonner.emilkowal.ski/)
- [Ejemplos interactivos](https://sonner.emilkowal.ski/examples)
- [GitHub](https://github.com/emilkowalski/sonner)

---

**Resumen:** Sonner está integrado en todo el sistema de autenticación. Los errores de API se muestran automáticamente como toasts, manteniendo los formularios limpios y enfocados solo en validaciones de campos.
