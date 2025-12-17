import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Supplier } from "@/lib/types/supplier";
import type { Shop } from "@/lib/types/shop";

export interface SupplierFormValues {
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  categoryId?: string | null;
  shopIds: string[];
}

interface SupplierFormProps {
  onSubmit: (values: SupplierFormValues) => void;
  isSubmitting: boolean;
  editingSupplier?: Supplier | null;
  onCancelEdit: () => void;
  shops: Shop[];
  isOwner: boolean;
  activeShopId: string | null;
  categories: { id: string; name: string }[];
  loadMoreCategories?: () => void;
  hasMoreCategories?: boolean;
  isLoadingCategories?: boolean;
}

const DEFAULT_VALUES: SupplierFormValues = {
  name: "",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
  categoryId: "",
  shopIds: [],
};

export const SupplierForm = ({
  onSubmit,
  isSubmitting,
  editingSupplier,
  onCancelEdit,
  shops,
  isOwner,
  activeShopId,
  categories,
  loadMoreCategories,
  hasMoreCategories,
  isLoadingCategories,
}: SupplierFormProps) => {
  const form = useForm<SupplierFormValues>({
    defaultValues: DEFAULT_VALUES,
  });

  const RequiredMark = () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="ml-1 text-destructive" aria-label="Requerido">
          *
        </span>
      </TooltipTrigger>
      <TooltipContent>Campo requerido por el backend</TooltipContent>
    </Tooltip>
  );

  useEffect(() => {
    if (editingSupplier) {
      form.reset({
        name: editingSupplier.name,
        contactName: editingSupplier.contactName || "",
        phone: editingSupplier.phone || "",
        email: editingSupplier.email || "",
        address: editingSupplier.address || "",
        notes: editingSupplier.notes || "",
        categoryId: editingSupplier.categoryId || "",
        shopIds: editingSupplier.shopIds || (editingSupplier.shopId ? [editingSupplier.shopId] : activeShopId ? [activeShopId] : []),
      });
    } else {
      form.reset({
        ...DEFAULT_VALUES,
        shopIds: activeShopId ? [activeShopId] : [],
      });
    }
  }, [editingSupplier, form, activeShopId]);

  const handleSubmit = form.handleSubmit((values) =>
    onSubmit({
      ...values,
      contactName: values.contactName?.trim() || null,
      phone: values.phone?.trim() || null,
      email: values.email?.trim() || null,
      address: values.address?.trim() || null,
      notes: values.notes?.trim() || null,
      categoryId: values.categoryId?.trim() || null,
      shopIds: values.shopIds.length
        ? values.shopIds
        : activeShopId
          ? [activeShopId]
          : [],
    }),
  );

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">
          Nombre
          <RequiredMark />
        </Label>
        <Input
          id="name"
          placeholder="Proveedor S.A."
          {...form.register("name", { required: true })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contactName">Persona de contacto</Label>
          <Input
            id="contactName"
            placeholder="Nombre contacto"
            {...form.register("contactName")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            placeholder="+54 9 11 1234 5678"
            {...form.register("phone")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="contacto@proveedor.com"
          {...form.register("email")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            placeholder="Calle 123"
            {...form.register("address")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Input
            id="notes"
            placeholder="Notas internas"
            {...form.register("notes")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Categoría (opcional)</Label>
        <div className="space-y-2">
          <select
            id="categoryId"
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...form.register("categoryId")}>
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {hasMoreCategories && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadMoreCategories}
              disabled={isLoadingCategories}>
              {isLoadingCategories ? "Cargando..." : "Cargar más categorías"}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Tiendas
          <RequiredMark />
        </Label>
        <div className="max-h-40 overflow-y-auto space-y-2 rounded-md border p-3">
          {shops.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay tiendas disponibles.
            </p>
          ) : (
            shops.map((shop) => {
              const checked = form.watch("shopIds").includes(shop.id);
              return (
                <label
                  key={shop.id}
                  className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const current = form.watch("shopIds") || [];
                      const next = e.target.checked
                        ? [...current, shop.id]
                        : current.filter((id) => id !== shop.id);
                      form.setValue("shopIds", next);
                    }}
                  />
                  <span>{shop.name}</span>
                </label>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? editingSupplier
              ? "Guardando..."
              : "Creando..."
            : editingSupplier
              ? "Actualizar proveedor"
              : "Crear proveedor"}
        </Button>
        {editingSupplier && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelEdit}
            disabled={isSubmitting}>
            Cancelar edición
          </Button>
        )}
      </div>
    </form>
  );
};
