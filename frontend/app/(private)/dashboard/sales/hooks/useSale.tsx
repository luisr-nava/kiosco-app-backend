import { useShopStore } from "@/app/(private)/store/shops.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useProductQuery } from "../../products/hooks/product.query";
import { Product } from "../../products/interfaces";
import { CreateSaleDto, SaleItem } from "../interfaces";

export const useSale = () => {
  const { activeShopId, activeShop } = useShopStore();
  const queryClient = useQueryClient();

  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { products: productsResponse = [], productsLoading } = useProductQuery({
    search: "",
    limit: 10,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateSaleDto) => saleApi.create(payload),
    onSuccess: () => {
      toast.success("Venta registrada");
      queryClient.invalidateQueries({ queryKey: ["sales", activeShopId] });
      setNotes("");
      setItems([]);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo registrar la venta";
      toast.error("Error", { description: message });
    },
  });

  const products = productsResponse;

  const total = useMemo(
    () => items.reduce((acc, item) => acc + Number(item.subtotal || 0), 0),
    [items],
  );

  const resolveShopProductId = (product: Product) =>
    product.shopProductId || product.id || product.productId || "";

  const incrementProduct = (product: Product) => {
    const shopProductId = resolveShopProductId(product);
    if (!shopProductId) {
      toast.error("Producto inválido");
      return;
    }
    const stock = Number(product.stock ?? 0);
    if (stock <= 0) {
      toast.error("Producto sin stock disponible");
      return;
    }
    const baseUnitPrice =
      product.finalSalePrice || product.salePrice || product.price || 0;
    setItems((prev) => {
      const idx = prev.findIndex(
        (item) => item.shopProductId === shopProductId,
      );
      if (idx >= 0) {
        const next = [...prev];
        const current = next[idx];
        const quantity = Number(current.quantity) + 1;
        const unitPrice = current.unitPrice || baseUnitPrice;
        next[idx] = {
          ...current,
          quantity,
          unitPrice,
          subtotal: quantity * unitPrice,
        };
        return next;
      }
      return [
        ...prev,
        {
          shopProductId,
          unitPrice: baseUnitPrice,
          quantity: 1,
          subtotal: baseUnitPrice,
        },
      ];
    });
  };
  const incrementProductById = (productId: string) => {
    const product = products.find(
      (p) =>
        resolveShopProductId(p) === productId ||
        p.id === productId ||
        p.productId === productId,
    );
    if (product) {
      incrementProduct(product);
    }
  };

  const decrementProduct = (productId: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((item) => item.shopProductId === productId);
      if (idx < 0) return prev;
      const next = [...prev];
      const current = next[idx];
      const quantity = Number(current.quantity) - 1;
      if (quantity <= 0) {
        next.splice(idx, 1);
        return next;
      }
      const unitPrice = current.unitPrice || 0;
      next[idx] = {
        ...current,
        quantity,
        subtotal: quantity * unitPrice,
      };
      return next;
    });
  };

  const handleSubmit = () => {
    if (!activeShopId) return;
    if (!activeShop?.hasOpenCashRegister) {
      requestOpenCashRegisterModal();
      return;
    }
    if (items.length === 0) {
      toast.error("Agrega al menos un producto al carrito");
      return;
    }
    const hasInvalid = items.some(
      (item) =>
        !item.shopProductId ||
        Number(item.quantity) <= 0 ||
        Number(item.unitPrice) <= 0,
    );
    if (hasInvalid) {
      toast.error("Completa los datos de cada ítem");
      return;
    }

    const payload: CreateSaleDto = {
      shopId: activeShopId,
      notes: notes || undefined,
      items: items.map((item) => ({
        shopProductId: item.shopProductId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
    };

    createMutation.mutate(payload);
  };

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + Number(item.quantity || 0), 0),
    [items],
  );

  const isSubmitting = createMutation.isPending;
  const clearCart = () => setItems([]);
  return {
    isCartOpen,
    setIsCartOpen,
    createMutation,
    products,
    total,
    resolveShopProductId,
    incrementProduct,
    incrementProductById,
    decrementProduct,
    handleSubmit,
    totalItems,
    isSubmitting,
    clearCart,
    items,
    notes,
    setNotes,
    productsLoading,
  };
};

