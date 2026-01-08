"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { ShopFormValues } from "@/features/shop/types";
import { useForm } from "react-hook-form";
import { useShopMutation } from "@/features/shop/hooks/useShopMutation";
import { useCurrencySymbols } from "@/src/hooks/useCurrencySymbols";
import { useCountriesWithLabels } from "@/src/hooks/useCountriesWithLabels";
import { useShopStore } from "../shop.store";
import { useShopQuery } from "../hooks/useShopQuery";

const MIN_NAME_LENGTH = 4;

export function StoreSelector() {
  const { setActiveShopId, setShouldForceStoreSelection } = useShopStore();
  const { shops } = useShopQuery();
  const { mutate, isPending } = useShopMutation();
  const currencySymbols = useCurrencySymbols();

  const [selectedShopId, setSelectedShopId] = useState<string | null>(
    shops?.[0]?.id ?? null
  );
  const countries = useCountriesWithLabels();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    reset,
  } = useForm<ShopFormValues>({
    mode: "onChange",
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      countryCode: "",
      currencyCode: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("Tienda creada", {
          description: "Seleccionamos tu nueva tienda para continuar",
        });
        // invalidar Query
      },
      onError: () => {
        toast.error("Error al crear", {
          description: "No pudimos crear la tienda",
        });
      },
    });
    reset();
  });
  useEffect(() => {
    if (!selectedShopId && shops.length > 0) {
      setSelectedShopId(shops[0].id);
    }
  }, [shops, selectedShopId]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      data-store-selector-trigger
    >
      <Card className="w-full max-w-5xl shadow-xl">
        <CardHeader className="flex flex-col gap-2">
          <CardTitle className="text-2xl">Selecciona tu tienda</CardTitle>
          <CardDescription>
            {shops
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

            {shops ? (
              <div className="space-y-3">
                {shops.map((shop, index) => {
                  if (!shop.id) return null;
                  return (
                    <button
                      key={shop.id}
                      onClick={() => setSelectedShopId(shop.id)}
                      className={`hover:border-primary w-full rounded-lg border p-4 text-left transition ${
                        selectedShopId === shop.id
                          ? "border-primary bg-primary/5"
                          : "border-muted"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <Store className="text-primary mt-1 h-5 w-5" />
                          <div>
                            <p className="font-semibold">{shop.name}</p>
                            <p className="text-muted-foreground text-sm">
                              {shop.address || "Sin dirección"}
                            </p>
                            {shop.phone && (
                              <p className="text-muted-foreground text-xs">
                                Tel: {shop.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        {selectedShopId === shop.id && (
                          <CheckCircle2 className="text-primary h-5 w-5 shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}

                <Button
                  className="w-full"
                  onClick={() => {
                    if (!selectedShopId) return;
                    setActiveShopId(selectedShopId);
                    setShouldForceStoreSelection(false);
                  }}
                  disabled={!selectedShopId}
                >
                  Usar tienda seleccionada
                </Button>
              </div>
            ) : (
              <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                Aún no tienes tiendas creadas.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              <h3 className="font-semibold">Crear nueva tienda</h3>
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="store-name">Nombre *</Label>
                <Input
                  id="store-name"
                  placeholder="Mi Kiosco"
                  maxLength={20}
                  {...register("name", {
                    required: "El nombre es obligatorio.",
                    minLength: {
                      value: MIN_NAME_LENGTH,
                      message: `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres.`,
                    },
                  })}
                />
                <p
                  className={`text-xs ${
                    touchedFields.name && errors.name
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {touchedFields.name && errors.name
                    ? errors.name.message
                    : "El nombre debe tener al menos 4 caracteres."}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="store-address">Dirección</Label>
                <Input
                  id="store-address"
                  placeholder="Av. Principal #123"
                  maxLength={60}
                  {...register("address")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="store-phone">Teléfono</Label>
                <Input
                  id="store-phone"
                  placeholder="+1234567890"
                  maxLength={20}
                  {...register("phone")}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="store-country">País</Label>
                  <select
                    id="store-country"
                    className="bg-background h-10 rounded-md border px-3 text-sm"
                    {...register("countryCode", {
                      required: "Selecciona tu país.",
                    })}
                  >
                    <option value="" disabled>
                      Selecciona tu país
                    </option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                  {touchedFields.countryCode && errors.countryCode && (
                    <p className="text-destructive text-xs">
                      {errors.countryCode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="store-currency">Moneda</Label>
                  <select
                    id="store-currency"
                    className="bg-background h-10 rounded-md border px-3 text-sm"
                    {...register("currencyCode", {
                      required: "Selecciona tu moneda.",
                    })}
                  >
                    <option value="" disabled>
                      Selecciona tu moneda
                    </option>
                    {currencySymbols.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} - {currency.code}
                      </option>
                    ))}
                  </select>
                  {touchedFields.currencyCode && errors.currencyCode && (
                    <p className="text-destructive text-xs">
                      {errors.currencyCode.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!isValid || isPending}
              >
                {isPending ? "Creando..." : "Crear tienda"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
