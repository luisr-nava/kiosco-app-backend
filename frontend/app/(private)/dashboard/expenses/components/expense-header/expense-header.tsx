import { useEffect, useState } from "react";
import { useDebounce } from "@/app/(private)/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  startDate: string;
  endDate: string;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  dateError?: string;
  handleOpenCreate: () => void;
}

export const ExpenseHeader = ({
  search,
  setSearch,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  dateError,
  handleOpenCreate,
}: Props) => {
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 400);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, search, setSearch]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-sm text-muted-foreground whitespace-nowrap">
            Buscar
          </Label>
          <Input
            className="w-full sm:w-60"
            placeholder="Descripción"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-sm text-muted-foreground whitespace-nowrap">
            Desde
          </Label>
          <Input
            type="date"
            className="w-full sm:w-44"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          {dateError && (
            <p className="text-xs text-destructive w-full sm:w-44">{dateError}</p>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-sm text-muted-foreground whitespace-nowrap">
            Hasta
          </Label>
          <Input
            type="date"
            className="w-full sm:w-44"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {dateError && (
            <p className="text-xs text-destructive w-full sm:w-44">{dateError}</p>
          )}
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            setLocalSearch("");
            setSearch("");
            handleOpenCreate();
          }}>
          Nuevo gasto
        </Button>
      </div>
    </div>
  );
};
