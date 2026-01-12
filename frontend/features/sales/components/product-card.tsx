import { Button } from "@/components/ui/button";
import { Product } from "@/features/products/types";
import { Package } from "lucide-react";

type CardProductProps = {
  product: Product;
  incrementProduct: (product: Product) => void;
  isAddDisabled?: boolean;
  quantityInCart?: number;
};

export default function ProductCard({
  product,
  incrementProduct,
  isAddDisabled = false,
  quantityInCart = 0,
}: CardProductProps) {
  const stock = Math.max(0, Number(product.stock ?? 0));
  const disabled = isAddDisabled;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled}
      onClick={() => {
        if (disabled) return;
        incrementProduct(product);
      }}
      className={`group bg-background flex h-full flex-col gap-3 rounded-xl border p-3 text-left shadow-sm transition ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : "hover:border-primary/40 focus-visible:outline-primary hover:shadow-lg focus-visible:outline-2"
      } `}
    >
      {/* Imagen / Ícono */}
      <div className="bg-muted flex aspect-video items-center justify-center rounded-lg">
        <Package className="text-muted-foreground h-8 w-8" />
      </div>

      {/* Info */}
      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-semibold">{product.name}</p>
        <p className="text-muted-foreground truncate text-xs">
          {product.description || "Sin descripción"}
        </p>
      </div>

      {/* Precio + Stock */}
      <div className="mt-auto flex items-center justify-between">
        <span className="text-base font-bold">
          ${product.salePrice?.toLocaleString("es-AR") || 0}
        </span>

        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            stock > 0
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive"
          } `}
        >
          Stock: {stock}
        </span>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-end gap-2">
        {quantityInCart > 0 ? (
          <span className="text-muted-foreground text-xs font-semibold">
            x{quantityInCart}
          </span>
        ) : null}
        <span
          aria-hidden
          className={`flex h-9 w-9 items-center justify-center rounded-full border text-lg font-semibold transition ${
            disabled
              ? "border-muted-foreground/30 text-muted-foreground/40"
              : "border-primary text-primary group-hover:bg-primary/10"
          } `}
        >
          +
        </span>
      </div>
    </button>
  );
}
