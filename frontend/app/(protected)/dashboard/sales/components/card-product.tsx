import { motion } from "framer-motion";
import { Product } from "../../products/interfaces";

type CardProductProps = {
  product: Product;
  incrementProduct: (product: Product) => void;
  isAddDisabled?: boolean;
};
export const CardProduct = ({
  product,
  incrementProduct,
  isAddDisabled = false,
}: CardProductProps) => {
  const stock = Math.max(0, Number(product.stock ?? 0));
  const shouldDisable = isAddDisabled;
  const cardStateClasses = shouldDisable
    ? "opacity-60 cursor-not-allowed"
    : "hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";
  return (
    <motion.button
      key={product.id}
      type="button"
      disabled={shouldDisable}
      aria-disabled={shouldDisable}
      className={`bg-background flex flex-col gap-2 rounded-lg border p-3 text-left shadow-sm transition duration-150 ${cardStateClasses}`}
      onClick={() => {
        if (shouldDisable) return;
        incrementProduct(product);
      }}
    >
      <div className="bg-muted aspect-video w-full overflow-hidden rounded-md">
        <div className="from-muted to-muted/80 h-full w-full bg-linear-to-br" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold">{product.name}</p>
        <p className="text-muted-foreground truncate text-xs">
          {product.description || "Sin descripción"}
        </p>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">
          ${product.salePrice?.toLocaleString("es-AR") || 0}
        </span>
        <span className="text-muted-foreground text-xs">Stock: {stock}</span>
      </div>
      <div className="flex justify-end">
        <span
          aria-hidden="true"
          className={`flex h-8 w-8 items-center justify-center rounded-full border text-lg font-semibold transition ${
            shouldDisable
              ? "border-muted-foreground/40 text-muted-foreground/40 opacity-50"
              : "border-foreground text-foreground"
          }`}
        >
          +
        </span>
      </div>
    </motion.button>
  );
};
