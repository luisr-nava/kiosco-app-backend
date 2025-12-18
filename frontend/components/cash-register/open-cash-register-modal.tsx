"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cashRegisterApi } from "@/lib/api/cash-register.api";
import { getErrorMessage } from "@/lib/error-handler";

interface OpenCashRegisterModalProps {
  isOpen: boolean;
  shopId: string | null;
  shopName?: string | null;
  onOpened: () => void;
}

export function OpenCashRegisterModal({
  isOpen,
  shopId,
  shopName,
  onOpened,
}: OpenCashRegisterModalProps) {
  const queryClient = useQueryClient();
  const [openingAmount, setOpeningAmount] = useState<string>("0");

  useEffect(() => {
    if (isOpen) {
      setOpeningAmount("0");
    }
  }, [isOpen, shopId]);

  const parsedAmount = useMemo(() => {
    const value = Number(openingAmount);
    return Number.isNaN(value) ? NaN : value;
  }, [openingAmount]);

  const openMutation = useMutation({
    mutationFn: () =>
      cashRegisterApi.openCashRegister({
        shopId: shopId || "",
        openingAmount: Number.isNaN(parsedAmount)
          ? 0
          : Math.max(parsedAmount, 0),
      }),
    onSuccess: (response) => {
      toast.success("Caja abierta", {
        description: "Registramos el monto de apertura.",
      });
      queryClient.setQueryData(["cash-register-open", shopId], response);
      onOpened();
    },
    onError: (error: unknown) => {
      const { message } = getErrorMessage(
        error,
        "No pudimos abrir la caja",
      );
      toast.error("Error al abrir caja", {
        description: message,
      });
    },
  });

  const canSubmit =
    Boolean(shopId) && !Number.isNaN(parsedAmount) && parsedAmount >= 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      title="Abrir caja"
      description="No encontramos una caja abierta para esta tienda. Ingresa el monto inicial para continuar."
      size="md"
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Tienda seleccionada: <span className="font-medium text-foreground">{shopName || shopId}</span>
        </p>

        <div className="space-y-2">
          <Label htmlFor="opening-amount">
            Monto inicial <span className="text-destructive">*</span>
          </Label>
          <Input
            id="opening-amount"
            type="number"
            min={0}
            step={0.01}
            value={openingAmount}
            onChange={(e) => setOpeningAmount(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Este será el efectivo de inicio para la caja de la tienda.
          </p>
        </div>
      </div>
      <ModalFooter className="justify-end">
        <Button
          onClick={() => openMutation.mutate()}
          disabled={!canSubmit || openMutation.isPending}
        >
          {openMutation.isPending ? "Abriendo..." : "Abrir caja"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
