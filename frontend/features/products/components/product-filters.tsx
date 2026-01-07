import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Supplier } from "@/features/suppliers/types";
export interface ProductFiltersValue {
  categoryId?: string;
  supplierId?: string;
}
interface Props {
  value: ProductFiltersValue;
  onChange: (value: ProductFiltersValue) => void;
  //   categories: { id: string; name: string }[];

  suppliers: Supplier[];
}

export default function ProductFilters({
  value,
  onChange,
  //   categories,
  suppliers,
}: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Category */}
      {/* <div className="space-y-1">
        <Label>Categoría</Label>
        <Select
          value={value.categoryId ?? "all"}
          onValueChange={(v) =>
            onChange({ ...value, categoryId: v === "all" ? undefined : v })
          }>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div> */}

      {/* Supplier */}
      <div className="flex flex-col gap-1">
        <Label>Proveedor</Label>
        <Select
          value={value.supplierId ?? "all"}
          onValueChange={(v) => onChange({ ...value, supplierId: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
