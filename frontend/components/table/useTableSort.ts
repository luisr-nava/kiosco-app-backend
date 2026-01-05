import { useMemo, useState } from "react";
import { SortDirection, TableColumn } from "./types";

export function useTableSort<T>(data: T[], columns: TableColumn<T>[]) {
  const [sortBy, setSortBy] = useState<{
    index: number;
    direction: SortDirection;
  } | null>(null);

  const sortedData = useMemo(() => {
    if (!sortBy) return data;

    const column = columns[sortBy.index];
    if (!column?.sortKey) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = column.sortKey!(a);
      const bValue = column.sortKey!(b);

      if (aValue < bValue) return sortBy.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortBy.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, columns, sortBy]);

  const toggleSort = (index: number) => {
    setSortBy((prev) => {
      if (!prev || prev.index !== index) {
        return { index, direction: "asc" };
      }

      if (prev.direction === "asc") {
        return { index, direction: "desc" };
      }

      return null; // reset sort
    });
  };

  return {
    sortedData,
    sortBy,
    toggleSort,
  };
}

