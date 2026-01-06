"use client";

import { useRouter, useSearchParams } from "next/navigation";

type ProductFilterValue = string | number | boolean | undefined;

export const useProductFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setFilter = (key: string, value: ProductFilterValue) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === undefined || value === "" || value === false) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }

    // 🔁 cualquier cambio de filtro resetea page
    if (key !== "page") {
      params.set("page", "1");
    }

    router.push(`?${params.toString()}`, {
      scroll: false,
    });
  };

  return { setFilter };
};

