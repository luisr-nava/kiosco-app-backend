import { useEffect, useState } from "react";
import { useDebounce } from "@/app/(private)/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  handleOpenCreate: () => void;
}

export const EmployeeHeader = ({
  search,
  setSearch,
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
            className="w-full sm:w-64"
            placeholder="Nombre o email"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            setLocalSearch("");
            setSearch("");
            handleOpenCreate();
          }}>
          Nuevo empleado
        </Button>
      </div>
    </div>
  );
};
