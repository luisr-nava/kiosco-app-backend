"use client";

import { useSearchParams } from "next/navigation";

export function useProductParams() {
  const params = useSearchParams();

  return {
    search: params.get("search") ?? undefined,
    categoryId: params.get("categoryId") ?? undefined,
    supplierId: params.get("supplierId") ?? undefined,
    lowStock: params.get("lowStock") === "true",
    page: Number(params.get("page") ?? 1),
    limit: Number(params.get("limit") ?? 20),
  };
}

