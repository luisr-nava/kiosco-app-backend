import { useCurrencyFormatter } from "@/src/hooks/useCurrencyFormatter";
import { Product } from "../types";

interface ProductExpandedProps {
  product: Product;
}

export default function ProductExpanded({ product }: ProductExpandedProps) {
  const formatCurrency = useCurrencyFormatter();

  return (
    <div className="grid grid-cols-2 gap-4 p-4 text-sm">
      {/* Columna izquierda */}
      <div className="space-y-2">
        <div>
          <p className="text-muted-foreground">Descripción:</p>
          <p className="text-right font-medium sm:text-left">
            {product.description || "Sin descripción"}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Código de barras:</p>
          <p className="text-right font-medium sm:text-left">
            {product.barcode || "No asignado"}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Categoria:</p>
          <p className="text-right font-medium sm:text-left">
            {product.categoryName || "Sin categoria"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Proveedor:</p>
          <p className="text-right font-medium sm:text-left">
            {product.supplierName || "Sin proveedor"}
          </p>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="space-y-2">
        <div>
          <p className="text-muted-foreground">Precio de costo:</p>
          <p className="text-right font-medium sm:text-left">
            {formatCurrency(product.costPrice)}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Precio de venta:</p>
          <p className="text-right font-medium sm:text-left">
            {formatCurrency(product.salePrice)}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Stock actual:</p>
          <p
            className={`text-right font-medium sm:text-left ${
              product.stock <= 10 ? "text-destructive" : ""
            }`}
          >
            {product.stock} {product.measurementUnit?.name}
            {product.stock <= 10 && " ⚠️"}
          </p>
        </div>
      </div>
    </div>
  );
}
