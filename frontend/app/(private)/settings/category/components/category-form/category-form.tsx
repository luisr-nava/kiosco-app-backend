import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UseCategoryFormReturn } from "../../hooks/useCategoryForm";

interface Props {
  type: "product" | "supplier";
  titlePlaceholder: string;
  shops: { id: string; name: string }[];
  isOwner: boolean;
  registerName: UseCategoryFormReturn["registerProduct"];
  selectedShopIds: string[];
  onToggleShop: (shopId: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isEditing: boolean;
  onCancelEdit: () => void;
  pending: boolean;
}

export const CategoryForm = ({
  type,
  titlePlaceholder,
  shops,
  isOwner,
  registerName,
  selectedShopIds,
  onToggleShop,
  onSubmit,
  canSubmit,
  isEditing,
  onCancelEdit,
  pending,
}: Props) => {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-1">
        <Label>Nombre *</Label>
        <Input
          {...registerName("name", { required: true })}
          placeholder={titlePlaceholder}
        />
      </div>
      {isOwner && (
        <div className="space-y-2">
          <Label>Tiendas</Label>
          {shops.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay tiendas disponibles.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {shops.map((shop) => {
                const selected = selectedShopIds.includes(shop.id);
                return (
                  <label
                    key={shop.id}
                    className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => onToggleShop(shop.id)}
                    />
                    <span>{shop.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
      <Button className="w-full" type="submit" disabled={!canSubmit || pending}>
        {pending
          ? isEditing
            ? "Actualizando..."
            : "Creando..."
          : isEditing
          ? "Actualizar categoría"
          : "Crear categoría"}
      </Button>
      {isEditing && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onCancelEdit}
          disabled={pending}>
          Cancelar edición
        </Button>
      )}
    </form>
  );
};

