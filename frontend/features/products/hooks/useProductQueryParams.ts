import { useSearchParams } from "next/navigation";

export function useProductQueryParams() {
  const searchParams = useSearchParams();

  return {
    search: searchParams.get("search") ?? "",
    categoryId: searchParams.get("categoryId") ?? undefined,
    supplierId: searchParams.get("supplierId") ?? undefined,
    isActive: searchParams.get("isActive")
      ? searchParams.get("isActive") === "true"
      : undefined,
    lowStock: searchParams.get("lowStock") === "true",
    page: Number(searchParams.get("page") ?? 1),
    limit: Number(searchParams.get("limit") ?? 20),
  };
}

