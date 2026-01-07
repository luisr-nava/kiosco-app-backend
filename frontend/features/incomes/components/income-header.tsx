import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useEffect, useState } from "react";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  handleOpenCreate: () => void;
}

export default function IncomeHeader({ handleOpenCreate, search, setSearch }: Props) {
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
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Label className="text-muted-foreground text-sm whitespace-nowrap">Buscar</Label>
          <Input
            className="w-full sm:w-56"
            placeholder="Nombre"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        <Button className="w-full sm:w-auto" onClick={handleOpenCreate}>
          Nuevo ingreso
        </Button>
      </div>
    </div>
  );
}
