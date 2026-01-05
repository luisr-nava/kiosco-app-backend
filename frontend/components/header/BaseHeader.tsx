import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReactNode } from "react";
import { useHeaderSearch } from "./useHeaderSearch";

interface BaseHeaderProps {
  search: string;
  setSearch: (value: string) => void;

  searchLabel?: string;
  searchPlaceholder?: string;

  onCreate?: () => void;
  createLabel?: string;

  filters?: ReactNode;
}

export function BaseHeader({
  search,
  setSearch,
  searchLabel = "Buscar",
  searchPlaceholder = "Buscar...",
  onCreate,
  createLabel = "Nuevo",
  filters,
}: BaseHeaderProps) {
  const { localSearch, setLocalSearch, resetSearch } = useHeaderSearch(
    search,
    setSearch,
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
        {/* Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-sm text-muted-foreground whitespace-nowrap">
            {searchLabel}
          </Label>
          <Input
            className="w-full sm:w-64"
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>

        {/* Extra filters */}
        {filters}

        {/* Create */}
        {onCreate && (
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              onCreate();
            }}>
            {createLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

