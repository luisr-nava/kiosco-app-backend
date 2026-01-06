import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReactNode, useEffect, useState } from "react";
import { useHeaderSearch } from "./useHeaderSearch";
import { useDebounce } from "@/src/hooks/useDebounce";

interface BaseHeaderProps {
  search: string;
  setSearch: (value: string) => void;

  searchLabel?: string;
  searchPlaceholder?: string;

  onCreate?: () => void;
  createLabel?: string;

  filters?: ReactNode;

  onClearFilters?: () => void;
  showClearFilters?: boolean;
}
export function BaseHeader({
  search,
  setSearch,
  searchLabel = "Buscar",
  searchPlaceholder = "Buscar...",
  onCreate,
  createLabel = "Nuevo",
  filters,
  onClearFilters,
  showClearFilters,
}: BaseHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      {/* LEFT */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 w-full">
        {/* Search */}
        <div className="space-y-1">
          <Label>{searchLabel}</Label>
          <Input
            className="w-full sm:w-64"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          {filters}

          {showClearFilters && onClearFilters && (
            <div className="flex flex-col gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-10"
                onClick={onClearFilters}>
                Borrar filtros
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      {onCreate && (
        <div className="flex justify-end sm:items-end">
          <Button onClick={onCreate} className="w-full">
            {createLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

