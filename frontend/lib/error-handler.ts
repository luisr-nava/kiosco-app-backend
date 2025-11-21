import { AxiosError } from "axios";

/**
 * Helper para obtener mensajes de error amigables según el código HTTP
 */
export const getErrorMessage = (
  error: any,
  defaultMessage = "Ocurrió un error inesperado",
): { title: string; message: string } => {
  // Si el error ya tiene un mensaje personalizado (de los actions)
  if (error?.message) {
    const statusCode = error?.statusCode || error?.response?.status;
    return {
      title: getErrorTitle(statusCode),
      message: error.message,
    };
  }

  // Si es un error de Axios
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const backendMessage = error.response?.data?.message;

    return {
      title: getErrorTitle(statusCode),
      message: backendMessage || error.message || defaultMessage,
    };
  }

  // Error genérico
  return {
    title: "Error",
    message: defaultMessage,
  };
};

/**
 * Obtiene un título apropiado según el código de estado HTTP
 */
const getErrorTitle = (statusCode?: number): string => {
  switch (statusCode) {
    // 4xx - Errores del cliente
    case 400:
      return "Datos inválidos";
    case 401:
      return "No autenticado";
    case 403:
      return "Acceso denegado";
    case 404:
      return "No encontrado";
    case 409:
      return "Conflicto";
    case 422:
      return "Validación fallida";
    case 429:
      return "Demasiadas solicitudes";

    // 5xx - Errores del servidor
    case 500:
      return "Error del servidor";
    case 502:
      return "Servidor no disponible";
    case 503:
      return "Servicio no disponible";
    case 504:
      return "Tiempo de espera agotado";

    // Default
    default:
      return "Error";
  }
};

/**
 * Códigos de error HTTP comunes para autenticación
 */
export const AuthErrorCodes = {
  INVALID_CREDENTIALS: 401,
  EMAIL_NOT_VERIFIED: 403,
  USER_NOT_FOUND: 404,
  EMAIL_ALREADY_EXISTS: 409,
  TOO_MANY_ATTEMPTS: 429,
  SERVER_ERROR: 500,
} as const;

/**
 * Mensajes de error específicos para autenticación
 */
export const getAuthErrorMessage = (error: any): { title: string; message: string } => {
  const statusCode = error?.statusCode || error?.response?.status;

  switch (statusCode) {
    case AuthErrorCodes.INVALID_CREDENTIALS:
      return {
        title: "Credenciales incorrectas",
        message: error?.message || "El email o la contraseña son incorrectos.",
      };

    case AuthErrorCodes.EMAIL_NOT_VERIFIED:
      return {
        title: "Cuenta no verificada",
        message: error?.message || "Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.",
      };

    case AuthErrorCodes.USER_NOT_FOUND:
      return {
        title: "Usuario no encontrado",
        message: error?.message || "No existe una cuenta con este email. ¿Deseas registrarte?",
      };

    case AuthErrorCodes.EMAIL_ALREADY_EXISTS:
      return {
        title: "Email ya registrado",
        message: error?.message || "Este email ya está en uso. Por favor usa otro email o inicia sesión.",
      };

    case AuthErrorCodes.TOO_MANY_ATTEMPTS:
      return {
        title: "Demasiados intentos",
        message: error?.message || "Has excedido el número de intentos permitidos. Espera unos minutos antes de intentar nuevamente.",
      };

    case AuthErrorCodes.SERVER_ERROR:
      return {
        title: "Error del servidor",
        message: "Ocurrió un error en el servidor. Por favor intenta más tarde.",
      };

    default:
      return getErrorMessage(error, "Error al autenticar. Por favor intenta de nuevo.");
  }
};
