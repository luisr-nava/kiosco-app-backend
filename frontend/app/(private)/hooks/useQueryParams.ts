import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "./useDebounce";

/**
 * Parámetros de query comunes
 */
export interface QueryParams {
  search?: string;
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Opciones para el hook
 */
interface UseQueryParamsOptions {
  debounceDelay?: number;
  debounceKeys?: string[];
}

/**
 * Hook personalizado para manejar query params con debounce
 * @param options - Opciones de configuración
 * @returns Objeto con valores y función de actualización
 */
export function useQueryParams<T extends QueryParams = QueryParams>(
  options: UseQueryParamsOptions = {}
) {
  const { debounceDelay = 500, debounceKeys = ["search"] } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Parsea los query params actuales a un objeto tipado
   */
  const params = useMemo(() => {
    const result: Record<string, string | number> = {};

    searchParams.forEach((value, key) => {
      // Intentar convertir a número si es posible
      const numValue = Number(value);
      result[key] = isNaN(numValue) ? value : numValue;
    });

    return result as T;
  }, [searchParams]);

  /**
   * Actualiza los query params en la URL
   * @param updates - Objeto con los parámetros a actualizar
   * @param options - Opciones adicionales
   */
  const updateParams = useCallback(
    (
      updates: Partial<T>,
      options?: { scroll?: boolean; replace?: boolean }
    ) => {
      const { scroll = false, replace = false } = options || {};

      const newParams = new URLSearchParams(searchParams.toString());

      // Actualizar o eliminar parámetros
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });

      const newUrl = `${pathname}?${newParams.toString()}`;

      if (replace) {
        router.replace(newUrl, { scroll });
      } else {
        router.push(newUrl, { scroll });
      }
    },
    [pathname, router, searchParams]
  );

  /**
   * Obtiene un valor específico de los params
   */
  const getParam = useCallback(
    <K extends keyof T>(key: K, defaultValue?: T[K]): T[K] | undefined => {
      return (params[key] as T[K]) ?? defaultValue;
    },
    [params]
  );

  /**
   * Resetea todos los parámetros
   */
  const resetParams = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  /**
   * Elimina parámetros específicos
   */
  const removeParams = useCallback(
    (...keys: (keyof T)[]) => {
      const newParams = new URLSearchParams(searchParams.toString());
      keys.forEach((key) => newParams.delete(String(key)));
      router.push(`${pathname}?${newParams.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return {
    params,
    updateParams,
    getParam,
    resetParams,
    removeParams,
  };
}

/**
 * Hook especializado para paginación con búsqueda
 * Incluye debounce automático para el campo de búsqueda
 */
export function usePaginationParams(debounceDelay: number = 500) {
  const { params, updateParams, resetParams } = useQueryParams({
    debounceDelay,
    debounceKeys: ["search"],
  });

  // Valores con defaults
  const search = (params.search as string) || "";
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;

  // Aplicar debounce solo para usarlo en queries, no para la URL
  const debouncedSearch = useDebounce(search, debounceDelay);

  /**
   * Actualiza la búsqueda (con debounce) y resetea la página a 1
   */
  const setSearch = useCallback(
    (value: string) => {
      updateParams({ search: value, page: 1 });
    },
    [updateParams]
  );

  /**
   * Actualiza la página
   */
  const setPage = useCallback(
    (value: number) => {
      updateParams({ page: value });
    },
    [updateParams]
  );

  /**
   * Actualiza el límite y resetea a página 1
   */
  const setLimit = useCallback(
    (value: number) => {
      updateParams({ limit: value, page: 1 });
    },
    [updateParams]
  );

  /**
   * Resetea todos los parámetros a sus valores por defecto
   */
  const reset = useCallback(() => {
    resetParams();
  }, [resetParams]);

  return {
    // Valores actuales
    search,
    page,
    limit,
    debouncedSearch, // Para usar en queries

    // Setters
    setSearch,
    setPage,
    setLimit,
    reset,

    // Utilidad para actualizar múltiples a la vez
    updateParams,
  };
}
