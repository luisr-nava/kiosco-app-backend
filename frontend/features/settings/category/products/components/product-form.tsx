import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { useForm } from "react-hook-form";
import { UseCategoryFormReturn } from "../../hooks/useCategoryForm";
import { User } from "@/features/auth/types";
export interface CategoryFormValues {
  name: string;
  shopIds: string[];
}

interface Props {
  user: User | null;
  shops: { id: string; name: string }[];
  registerName: UseCategoryFormReturn["registerProduct"];
  selectedShopIds: string[];
  onToggleShop: (shopId: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isEditing: boolean;
  onCancelEdit: () => void;
  pending: boolean;
}

export default function ProductForm({
  user,
  shops,
  registerName,
  selectedShopIds,
  onToggleShop,
  onSubmit,
  canSubmit,
  isEditing,
  onCancelEdit,
  pending,
}: Props) {
  const isOwner = user?.role === "OWNER";
  const form = useForm<CategoryFormValues>({
    defaultValues: {
      name: "",
      shopIds: [],
    },
  });

  const { register, handleSubmit, watch, setValue } = form;
  const shopIds = watch("shopIds");

  const toggleShop = (shopId: string) => {
    setValue(
      "shopIds",
      shopIds.includes(shopId)
        ? shopIds.filter((id) => id !== shopId)
        : [...shopIds, shopId],
      { shouldDirty: true }
    );
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-1">
        <Label>Nombre *</Label>
        <Input
          {...register("name", { required: true })}
          placeholder="Lacteos"
        />
      </div>

      {/* {isOwner && (
        <div className="space-y-2">
          <Label>Tiendas</Label>

          {shops.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No hay tiendas disponibles.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {shops.map((shop) => {
                const selected = shopIds.includes(shop.id);
                return (
                  <label
                    key={shop.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggleShop(shop.id)}
                    />
                    <span>{shop.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )} */}

      <Button className="w-full" type="submit" disabled={pending}>
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
          disabled={pending}
        >
          Cancelar edición
        </Button>
      )}
    </form>
  );
}
