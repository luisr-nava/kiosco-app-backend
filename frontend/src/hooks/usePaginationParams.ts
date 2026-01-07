import { useEffect, useState } from "react";
import { useQueryParams } from "./useQueryParams";
import { useDebounce } from "./useDebounce";

export function usePaginationParams(debounceDelay = 500) {
  const { params, updateParams, resetParams } = useQueryParams();

  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const [searchInput, setSearchInput] = useState(params.search ?? "");

  const debouncedSearch = useDebounce(searchInput, debounceDelay);

  useEffect(() => {
    const current = params.search ?? "";
    const next = debouncedSearch.trim();

    if (current === next) return;

    updateParams({
      search: next || undefined,
      page: 1,
    });
  }, [debouncedSearch, params.search, updateParams]);

  return {
    searchInput,
    debouncedSearch,
    page,
    limit,
    setSearch: setSearchInput,
    setPage: (p: number) => updateParams({ page: p }),
    setLimit: (l: number) => updateParams({ limit: l, page: 1 }),
    reset: resetParams,
  };
}
