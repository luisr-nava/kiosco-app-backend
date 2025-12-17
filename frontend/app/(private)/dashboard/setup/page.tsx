"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { shopApi } from "@/lib/api/shop.api";
import type { CreateShopDto } from "@/lib/types/shop";
import { getErrorMessage } from "@/lib/error-handler";

export default function SetupStorePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateShopDto>({
    name: "",
    address: "",
    phone: "",
    isActive: true,
  });

  const createShopMutation = useMutation({
    mutationFn: (data: CreateShopDto) => shopApi.createShop(data),
    onSuccess: () => {
      toast.success("Tienda creada exitosamente", {
        description: "Ya puedes comenzar a usar el sistema",
      });
      router.push("/dashboard");
    },
    onError: (error: unknown) => {
      const { message } = getErrorMessage(
        error,
        "Error al crear la tienda",
      );
      toast.error("Error", {
        description: message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Error", {
        description: "El nombre de la tienda es obligatorio",
      });
      return;
    }

    createShopMutation.mutate(formData);
  };

  const handleChange = (field: keyof CreateShopDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Configura tu Tienda</CardTitle>
          <CardDescription>
            Antes de comenzar, necesitamos algunos datos de tu tienda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre de la Tienda <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Mi Kiosco"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                minLength={4}
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                Entre 4 y 20 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                type="text"
                placeholder="Av. Principal #123"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                minLength={4}
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                Opcional - Entre 4 y 20 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Opcional - Número de contacto de la tienda
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createShopMutation.isPending}
            >
              {createShopMutation.isPending ? "Creando..." : "Crear Tienda"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
