"use client";

import { useSearchParams } from "next/navigation";

export const useProductParams = () => {
  const params = useSearchParams();

  return {
    search: params.get("search") ?? undefined,
    categoryId: params.get("categoryId") ?? undefined,
    supplierId: params.get("supplierId") ?? undefined,
    page: Number(params.get("page") ?? 1),
    limit: Number(params.get("limit") ?? 20),
  };
};
