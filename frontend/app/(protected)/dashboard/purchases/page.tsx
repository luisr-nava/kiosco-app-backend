"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { purchaseApi } from "@/lib/api/purchase.api";
import { productApi } from "@/lib/api/product.api";
import { supplierApi } from "@/lib/api/supplier.api";
import type {
  CreatePurchaseDto,
  Purchase,
  PurchaseItem,
} from "@/lib/types/purchase";
import type { Product } from "@/app/(protected)/dashboard/products/interfaces";
import type { Supplier } from "@/lib/types/supplier";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChevronDown } from "lucide-react";
import { expandableRowVariants } from "@/lib/animations";
import { getErrorMessage } from "@/lib/error-handler";
import { Modal } from "@/components/ui/modal";
import { useShopStore } from "@/features/shop/shop.store";

const normalize = <T,>(value: T[] | { data: T[] } | undefined): T[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.data ?? [];
};

const buildItem = (): PurchaseItem => ({
  shopProductId: "",
  quantity: 1,
  unitCost: 0,
  subtotal: 0,
  includesTax: true,
});

export default function ComprasPage() {
  const { activeShopId } = useShopStore();
  const queryClient = useQueryClient();

  const [notes, setNotes] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([buildItem()]);
  const [productSearch, setProductSearch] = useState<string[]>([""]);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(
    null,
  );
  const [dropdownRect, setDropdownRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const hasIncompleteItem = items.some(
    (item) =>
      !item.shopProductId ||
      Number(item.quantity) <= 0 ||
      Number(item.unitCost) <= 0,
  );

  const { data: purchasesResponse, isLoading: purchasesLoading } = useQuery<
    Purchase[]
  >({
    queryKey: ["purchases", "all"],
    queryFn: () => purchaseApi.listAll(),
    staleTime: 1000 * 30,
  });

  const { data: productsResponse, isLoading: productsLoading } = useQuery<
    Product[]
  >({
    queryKey: ["products", activeShopId, "for-purchases"],
    queryFn: () =>
      productApi.listByShop(activeShopId || "", {
        limit: 100,
      }),
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
  });

  const { data: suppliersResponse, isLoading: suppliersLoading } = useQuery<
    Supplier[]
  >({
    queryKey: ["suppliers", activeShopId, "for-purchases"],
    queryFn: () => supplierApi.listByShop(activeShopId || ""),
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePurchaseDto) => purchaseApi.create(payload),
    onSuccess: () => {
      toast.success("Compra registrada");
      queryClient.invalidateQueries({ queryKey: ["purchases", "all"] });
      setNotes("");
      setSupplierId("");
      setItems([buildItem()]);
      setProductSearch([""]);
      setCreateOpen(false);
    },
    onError: (error: unknown) => {
      const { message } = getErrorMessage(
        error,
        "No se pudo registrar la compra",
      );
      toast.error("Error", { description: message });
    },
  });

  const purchases = useMemo(
    () => normalize<Purchase>(purchasesResponse),
    [purchasesResponse],
  );

  const products = useMemo(
    () => normalize<Product>(productsResponse),
    [productsResponse],
  );
  const suppliers = useMemo(
    () => normalize<Supplier>(suppliersResponse),
    [suppliersResponse],
  );
  const getProductName = (productId: string | undefined) =>
    products.find((p) => p.id === productId)?.name || "";
  const setSearchValue = (index: number, value: string) => {
    setProductSearch((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };
  const handleSelectProduct = (index: number, product: Product | undefined) => {
    updateItem(index, {
      shopProductId: product?.id || "",
      unitCost: product?.costPrice ?? items[index]?.unitCost ?? 0,
    });
    setSearchValue(index, product?.name || "");
    setActiveSearchIndex(null);
  };
  const resetForm = () => {
    setNotes("");
    setSupplierId("");
    setItems([buildItem()]);
    setProductSearch([""]);
    setActiveSearchIndex(null);
  };

  const total = useMemo(
    () => items.reduce((acc, item) => acc + Number(item.subtotal || 0), 0),
    [items],
  );

  const updateItem = (index: number, next: Partial<PurchaseItem>) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const merged = { ...item, ...next };
        const subtotal =
          Number(merged.quantity || 0) * Number(merged.unitCost || 0);
        return { ...merged, subtotal };
      }),
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, buildItem()]);
    setProductSearch((prev) => [...prev, ""]);
  };
  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setProductSearch((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!activeShopId) return;
    const hasInvalid = items.some(
      (item) =>
        !item.shopProductId ||
        Number(item.quantity) <= 0 ||
        Number(item.unitCost) <= 0,
    );
    if (hasInvalid) {
      toast.error("Completa los datos de cada ítem");
      return;
    }

    const payload: CreatePurchaseDto = {
      shopId: activeShopId,
      supplierId: supplierId || undefined,
      notes: notes || undefined,
      items: items.map((item) => ({
        shopProductId: item.shopProductId,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
        subtotal: Number(item.subtotal),
        includesTax: Boolean(item.includesTax),
      })),
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compras</h1>
          <p className="text-muted-foreground">
            Revisa todas las compras y registra nuevas.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreateOpen(true);
          }}
          disabled={!activeShopId}>
          Registrar compra
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Historial de compras</CardTitle>
            <CardDescription>
              Listado de compras registradas en todas tus tiendas.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["purchases", "all"] })
            }>
            Actualizar
          </Button>
        </CardHeader>
        <CardContent>
          {purchasesLoading ? (
            <p className="text-sm text-muted-foreground">Cargando compras...</p>
          ) : purchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no registraste compras.
            </p>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <div className="grid grid-cols-6 bg-muted px-4 py-2 text-sm font-semibold">
                <span>Fecha</span>
                <span>Tienda</span>
                <span>Proveedor</span>
                <span>Ítems</span>
                <span>Total</span>
                <span className="text-right">Detalle</span>
              </div>
              <div className="divide-y">
                {purchases.map((purchase) => {
                  const isOpen = expandedRow === purchase.id;
                  const supplier = suppliers.find(
                    (s) => s.id === purchase.supplierId,
                  );
                  const dateValue =
                    purchase.purchaseDate ||
                    purchase.createdAt ||
                    purchase.updatedAt;
                  const totalValue =
                    purchase.totalAmount ?? purchase.total ?? 0;
                  const itemsCount =
                    purchase.itemsCount ?? purchase.items?.length ?? 0;
                  return (
                    <div key={purchase.id}>
                      <motion.button
                        whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.03)" }}
                        whileTap={{ scale: 0.995 }}
                        className="grid w-full grid-cols-6 items-center px-4 py-3 text-left transition-colors"
                        onClick={() =>
                          setExpandedRow(isOpen ? null : purchase.id)
                        }>
                        <span className="text-sm text-muted-foreground">
                          {dateValue
                            ? new Date(dateValue).toLocaleString()
                            : "Sin fecha"}
                        </span>
                        <span className="text-sm">
                          {purchase.shopName || "N/D"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {supplier?.name ||
                            purchase.supplierId ||
                            "Sin proveedor"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {itemsCount} ítems
                        </span>
                        <span className="font-semibold">
                          ${totalValue.toLocaleString("es-AR")}
                        </span>
                        <span className="flex justify-end text-sm text-primary">
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}>
                            <ChevronDown className="h-4 w-4" />
                          </motion.div>
                        </span>
                      </motion.button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            variants={expandableRowVariants}
                            className="overflow-hidden">
                            <div className="space-y-3 bg-muted/40 px-4 py-3 text-sm">
                              <div className="grid gap-2 md:grid-cols-2">
                                <div>
                                  <span className="text-muted-foreground">
                                    Proveedor:
                                  </span>
                                  <p className="font-medium">
                                    {supplier?.name || "Sin proveedor"}
                                  </p>
                                </div>
                                {purchase.notes && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Notas:
                                    </span>
                                    <p className="font-medium">
                                      {purchase.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <Separator />
                              <div className="space-y-2">
                                <p className="font-semibold">
                                  Ítems de la compra:
                                </p>
                                {purchase.items?.map((item, idx) => {
                                  const product = products.find(
                                    (p) => p.id === item.shopProductId,
                                  );
                                  return (
                                    <motion.div
                                      key={item.id || idx}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="rounded-md border bg-background px-3 py-2">
                                      <p className="font-medium">
                                        {product?.name ||
                                          item.productName ||
                                          item.shopProductId}
                                      </p>
                                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-1">
                                        <span>Cantidad: {item.quantity}</span>
                                        <span>
                                          Costo unitario: ${item.unitCost}
                                        </span>
                                        <span>Subtotal: ${item.subtotal}</span>
                                        <span>
                                          {item.includesTax
                                            ? "Con IVA"
                                            : "Sin IVA"}
                                        </span>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={createOpen}
        onClose={() => {
          resetForm();
          setCreateOpen(false);
        }}
        title="Registrar compra"
        description={
          activeShopId
            ? "Ingresa los datos de la compra para la tienda activa."
            : "Selecciona una tienda para registrar compras."
        }
        size="lg"
        closeOnOverlayClick={!createMutation.isPending}>
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Proveedor (opcional)</Label>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                disabled={suppliersLoading || !activeShopId}>
                <option value="">Sin proveedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label>Notas</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Compra quincenal de mercadería"
                disabled={!activeShopId}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Ítems de la compra</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={addItem}
                disabled={!activeShopId || hasIncompleteItem}>
                Agregar ítem
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-md border bg-muted/40 p-3 md:grid-cols-6 md:items-end">
                  <div className="grid gap-1 md:col-span-2">
                    <Label>Producto *</Label>
                    <div className="relative z-50">
                      <button
                        type="button"
                        className="flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-left text-sm hover:bg-accent/50"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setDropdownRect({
                            top: rect.bottom + 4,
                            left: rect.left,
                            width: rect.width,
                          });
                          setSearchValue(
                            index,
                            getProductName(item.shopProductId),
                          );
                          setActiveSearchIndex(index);
                        }}
                        disabled={productsLoading || !activeShopId}>
                        <span className="truncate">
                          {getProductName(item.shopProductId) ||
                            "Seleccionar producto"}
                        </span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </button>

                      {activeSearchIndex === index &&
                        dropdownRect &&
                        typeof document !== "undefined" &&
                        createPortal(
                          <div
                            className="z-9999 rounded-md border bg-card shadow-lg"
                            style={{
                              position: "fixed",
                              top: dropdownRect.top,
                              left: dropdownRect.left,
                              width: dropdownRect.width,
                            }}>
                            <div className="border-b px-3 py-2">
                              <input
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                autoFocus
                                value={productSearch[index] ?? ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSearchValue(index, value);
                                  if (!activeShopId) return;
                                  if (!value) {
                                    handleSelectProduct(index, undefined);
                                  }
                                }}
                                placeholder="Buscar producto"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {products
                                .filter((product) =>
                                  product.name
                                    .toLowerCase()
                                    .includes(
                                      (
                                        productSearch[index] ?? ""
                                      ).toLowerCase(),
                                    ),
                                )
                                .slice(0, 20)
                                .map((product) => (
                                  <button
                                    key={product.id}
                                    type="button"
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                      handleSelectProduct(index, product);
                                    }}>
                                    <span className="truncate">
                                      {product.name}
                                    </span>
                                  </button>
                                ))}
                              {products.length === 0 && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                  Sin productos
                                </div>
                              )}
                            </div>
                          </div>,
                          document.body,
                        )}
                    </div>
                  </div>

                  <div className="grid gap-1">
                    <Label>Cantidad *</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      min={0}
                      onChange={(e) =>
                        updateItem(index, { quantity: Number(e.target.value) })
                      }
                      disabled={!activeShopId}
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label>Costo unitario *</Label>
                    <Input
                      type="number"
                      value={item.unitCost}
                      min={0}
                      onChange={(e) =>
                        updateItem(index, { unitCost: Number(e.target.value) })
                      }
                      disabled={!activeShopId}
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label>Subtotal</Label>
                    <Input value={item.subtotal} readOnly />
                  </div>

                  <div className="grid gap-1">
                    <Label>Impuesto incluido</Label>
                    <select
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                      value={item.includesTax ? "yes" : "no"}
                      onChange={(e) =>
                        updateItem(index, {
                          includesTax: e.target.value === "yes",
                        })
                      }
                      disabled={!activeShopId}>
                      <option value="yes">Sí</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end md:justify-end">
                    {items.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={!activeShopId}>
                        Quitar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-md border bg-background px-4 py-3">
              <p className="text-sm text-muted-foreground">Total estimado</p>
              <p className="text-xl font-semibold">
                ${total.toLocaleString("es-AR")}
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={
                  createMutation.isPending ||
                  items.length === 0 ||
                  !activeShopId
                }>
                {createMutation.isPending ? "Guardando..." : "Registrar compra"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

