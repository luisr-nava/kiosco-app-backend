import { useEffect, useState } from "react";
import { useDebounce } from "@/src/hooks/useDebounce";

export function useHeaderSearch(
  search: string,
  setSearch: (value: string) => void,
  delay = 400,
) {
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, delay);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, search, setSearch]);

  const resetSearch = () => {
    setLocalSearch("");
    setSearch("");
  };

  return {
    localSearch,
    setLocalSearch,
    resetSearch,
  };
}

