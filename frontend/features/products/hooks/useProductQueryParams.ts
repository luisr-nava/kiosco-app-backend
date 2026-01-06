import { useSearchParams } from "next/navigation";

export const useProductQueryParams = () => {
  const searchParams = useSearchParams();

  return {
    search: searchParams.get("search") ?? "",
    categoryId: searchParams.get("categoryId") ?? undefined,
    supplierId: searchParams.get("supplierId") ?? undefined,
    page: Number(searchParams.get("page") ?? 1),
    limit: Number(searchParams.get("limit") ?? 20),
  };
};

