"use client";

import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notificationApi } from "@/lib/api/notification.api";
import type { NotificationPreferences } from "@/lib/types/notification";
import { getErrorMessage } from "@/lib/error-handler";
import { useShopStore } from "@/features/shop/shop.store";

export default function PreferencesPage() {
  const { activeShopId } = useShopStore();

  const form = useForm<NotificationPreferences>({
    defaultValues: {
      receiveNotifications: true,
      lowStockThreshold: 3,
    },
  });

  const preferencesQuery = useQuery({
    queryKey: ["notification-preferences", activeShopId],
    queryFn: () => notificationApi.getPreferences(activeShopId || ""),
    enabled: Boolean(activeShopId),
    refetchOnWindowFocus: false,
    // onSuccess: (data) => form.reset(data),
    // onError: (error) => {
    //   const { title, message } = getErrorMessage(
    //     error,
    //     "No se pudieron cargar las preferencias",
    //   );
    //   toast.error(title, { description: message });
    // },
  });

  const updatePreferences = useMutation({
    mutationFn: (payload: NotificationPreferences) =>
      notificationApi.updatePreferences(activeShopId || "", payload),
    onSuccess: (data) => {
      form.reset(data);
      toast.success("Preferencias guardadas", {
        description: "Tus ajustes de notificaciones fueron actualizados.",
      });
    },
    onError: (error) => {
      const { title, message } = getErrorMessage(error, "No se pudieron guardar las preferencias");
      toast.error(title, { description: message });
    },
  });

  const onSubmit = form.handleSubmit((values) => updatePreferences.mutate(values));

  if (!activeShopId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preferencias de notificaciones</CardTitle>
          <CardDescription>
            Selecciona una tienda para configurar cómo quieres recibir alertas.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          No hay tienda activa. Selecciona una tienda desde el menú para continuar.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preferencias de notificaciones</CardTitle>
          <CardDescription>
            Define cómo quieres recibir alertas para{" "}
            <span className="text-foreground font-semibold">
              {/* {activeShop?.name || activeShopId} */}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <Label className="text-base">Recibir notificaciones</Label>
                <p className="text-muted-foreground text-sm">
                  Activa o desactiva los avisos en tiempo real para esta tienda.
                </p>
              </div>
              <Controller
                control={form.control}
                name="receiveNotifications"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={preferencesQuery.isLoading || updatePreferences.isPending}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Umbral de stock bajo</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min={0}
                step={1}
                {...form.register("lowStockThreshold", {
                  valueAsNumber: true,
                  min: 0,
                })}
                disabled={preferencesQuery.isLoading || updatePreferences.isPending}
              />
              <p className="text-muted-foreground text-sm">
                Se enviarán notificaciones cuando un producto esté por debajo de este stock.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="submit"
                disabled={
                  preferencesQuery.isLoading ||
                  updatePreferences.isPending ||
                  !form.formState.isDirty
                }
              >
                {updatePreferences.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
