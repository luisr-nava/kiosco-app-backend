"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { shopApi } from "@/lib/api/shop.api";
import type { Shop } from "@/lib/types/shop";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, PlusCircle, Store } from "lucide-react";
import { useAuth } from "@/app/(auth)/hooks";
import { SubscriptionPlanType } from "@/lib/types/subscription";
import { getErrorMessage } from "@/lib/error-handler";
import {
  COUNTRY_CODES,
  ORDERED_CURRENCY_OPTIONS,
  DEFAULT_COUNTRY_CODE,
  DEFAULT_CURRENCY_CODE,
} from "@/lib/constants/shop";

const STORE_LIMITS: Record<SubscriptionPlanType | "default", number> = {
  [SubscriptionPlanType.PRO]: 3,
  [SubscriptionPlanType.PREMIUM]: 3,
  [SubscriptionPlanType.FREE]: 1,
  default: 1,
};

interface StoreSelectorProps {
  shops: Shop[];
  onSelect: (shopId: string) => void;
  onCreateSuccess?: (shopId: string) => void;
}

/**
 * Muestra un overlay para seleccionar o crear tienda
 */
export function StoreSelector({
  shops,
  onSelect,
  onCreateSuccess,
}: StoreSelectorProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const regionDisplay = useMemo(() => {
    try {
      return new Intl.DisplayNames(["es", "en"], { type: "region" });
    } catch {
      return null;
    }
  }, []);

  const countriesWithLabels = useMemo(
    () =>
      COUNTRY_CODES.map((code) => {
        const name = regionDisplay?.of(code as any);
        return {
          code,
          label: name || code,
        };
      }),
    [regionDisplay],
  );

  const currencySymbols = useMemo(() => {
    const toSymbol = (code: string) => {
      try {
        const formatter = new Intl.NumberFormat("es", {
          style: "currency",
          currency: code,
          currencyDisplay: "symbol",
        });
        const parts = formatter.formatToParts(1);
        const currencyPart = parts.find((part) => part.type === "currency");
        return currencyPart?.value || code;
      } catch {
        return code;
      }
    };

    return ORDERED_CURRENCY_OPTIONS.map((currency) => ({
      code: currency.code,
      symbol: toSymbol(currency.code),
    }));
  }, []);

  const resolvePlanType = (): SubscriptionPlanType => {
    const rawPlan =
      user?.planType ||
      user?.subscriptionPlan ||
      user?.subscriptionType ||
      SubscriptionPlanType.FREE;

    const normalized =
      typeof rawPlan === "string" ? rawPlan.trim().toLowerCase() : "";

    // Aceptar variantes: "pro", "plan_pro", "pro-plan", etc.
    if (normalized.includes("pro")) return SubscriptionPlanType.PRO;
    if (normalized.includes("premium")) return SubscriptionPlanType.PREMIUM;
    // Si viene vacío o cualquier otro valor, degradar a FREE
    return SubscriptionPlanType.FREE;
  };

  const planType = resolvePlanType();
  const maxStores = STORE_LIMITS[planType] ?? STORE_LIMITS.default;

  const hasShops = shops.length > 0;
  const hasReachedLimit = shops.length >= maxStores;

  const getShopId = (shop: Partial<Shop> | null | undefined) => {
    if (!shop) return null;
    if (typeof shop.id === "string") return shop.id;
    if (typeof (shop as { _id?: string })._id === "string") {
      return (shop as { _id?: string })._id as string;
    }
    return null;
  };

  const extractShop = (response: unknown): Partial<Shop> | null => {
    if (!response || typeof response !== "object") return null;
    const responseObj = response as Record<string, unknown>;

    if ("shop" in responseObj) {
      return extractShop(responseObj.shop);
    }

    if ("data" in responseObj && responseObj.data) {
      return extractShop(responseObj.data);
    }

    return responseObj as Partial<Shop>;
  };

  const fallbackSelectedShopId = useMemo(
    () => (hasShops ? getShopId(shops[0]) : null),
    [hasShops, shops],
  );
  const effectiveSelectedShopId = selectedShopId ?? fallbackSelectedShopId;

  const createShopMutation = useMutation({
    mutationFn: () =>
      shopApi.createShop({
        name: name.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        countryCode,
        currencyCode,
        isActive: true,
      }),
    onSuccess: (response) => {
      const newShop = extractShop(response);
      const newShopId = getShopId(newShop);

      if (!newShop || !newShopId) {
        toast.error("Error al crear", {
          description: "No pudimos identificar la nueva tienda.",
        });
        return;
      }

      const normalizedShop: Shop = {
        id: newShopId,
        name: newShop.name ?? "Tienda",
        address: newShop.address ?? "",
        phone: newShop.phone ?? "",
        hasOpenCashRegister: Boolean(newShop.hasOpenCashRegister),
        countryCode: newShop.countryCode ?? DEFAULT_COUNTRY_CODE,
        currencyCode: newShop.currencyCode ?? DEFAULT_CURRENCY_CODE,
        isActive: newShop.isActive ?? true,
        createdAt: newShop.createdAt ?? new Date().toISOString(),
        updatedAt: newShop.updatedAt ?? new Date().toISOString(),
      };

      queryClient.setQueryData<Shop[] | undefined>(["my-shops"], (prev) =>
        prev ? [...prev, normalizedShop] : [normalizedShop],
      );
      setSelectedShopId(newShopId);
      onCreateSuccess?.(newShopId);
      toast.success("Tienda creada", {
        description: "Seleccionamos tu nueva tienda para continuar",
      });
      queryClient.invalidateQueries({ queryKey: ["my-shops"] });
    },
    onError: (error: unknown) => {
      const { message } = getErrorMessage(
        error,
        "No pudimos crear la tienda",
      );
      toast.error("Error al crear", {
        description: message,
      });
    },
  });

  const canCreate = useMemo(
    () =>
      name.trim().length >= 4 &&
      !hasReachedLimit &&
      Boolean(countryCode) &&
      Boolean(currencyCode),
    [name, hasReachedLimit, countryCode, currencyCode],
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      data-store-selector-trigger
    >
      <Card className="w-full max-w-5xl shadow-xl">
        <CardHeader className="flex flex-col gap-2">
          <CardTitle className="text-2xl">Selecciona tu tienda</CardTitle>
          <CardDescription>
            {hasShops
              ? "Elige una tienda para continuar o crea una nueva."
              : "No encontramos tiendas. Crea tu primera tienda para comenzar."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              <h3 className="font-semibold">Tus tiendas</h3>
            </div>

            {hasShops ? (
              <div className="space-y-3">
                {shops.map((shop, index) => {
                  const shopId = getShopId(shop) ?? `temp-${index}`;
                  const isActive = effectiveSelectedShopId === shopId;
                  return (
                    <button
                      key={shopId}
                  onClick={() => setSelectedShopId(shopId)}
                      className={`w-full text-left border rounded-lg p-4 transition hover:border-primary ${
                        isActive
                          ? "border-primary bg-primary/5"
                          : "border-muted"
                      }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <Store className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <p className="font-semibold">{shop.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {shop.address || "Sin dirección"}
                            </p>
                            {shop.phone && (
                              <p className="text-xs text-muted-foreground">
                                Tel: {shop.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        {isActive && (
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}

                <Button
                  className="w-full"
                  onClick={() =>
                    effectiveSelectedShopId && onSelect(effectiveSelectedShopId)
                  }
                  disabled={!effectiveSelectedShopId}>
                  Usar tienda seleccionada
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Aún no tienes tiendas creadas.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              <h3 className="font-semibold">Crear nueva tienda</h3>
            </div>

            <div className="space-y-3">
              {hasReachedLimit && (
                <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
                  Ya alcanzaste el máximo de {maxStores} tiendas para tu plan.
                  Selecciona una existente para continuar.
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="store-name">Nombre *</Label>
                <Input
                  id="store-name"
                  placeholder="Mi Kiosco"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={4}
                  maxLength={20}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="store-address">Dirección</Label>
                <Input
                  id="store-address"
                  placeholder="Av. Principal #123"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  maxLength={60}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="store-phone">Teléfono</Label>
                <Input
                  id="store-phone"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={20}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="store-country">País</Label>
                  <select
                    id="store-country"
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    <option value="" disabled>
                      Selecciona tu país
                    </option>
                    {countriesWithLabels.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="store-currency">Moneda</Label>
                  <select
                    id="store-currency"
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                  >
                    <option value="" disabled>
                      Selecciona tu moneda
                    </option>
                    {currencySymbols.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  if (hasReachedLimit) {
                    toast.error("Límite de tiendas alcanzado", {
                      description: `Solo puedes tener hasta ${maxStores} tiendas con tu plan ${planType.toUpperCase()}.`,
                    });
                    return;
                  }
                  createShopMutation.mutate();
                }}
                disabled={!canCreate || createShopMutation.isPending}>
                {createShopMutation.isPending ? "Creando..." : "Crear tienda"}
              </Button>

              <p className="text-xs text-muted-foreground">
                El nombre debe tener al menos 4 caracteres.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
