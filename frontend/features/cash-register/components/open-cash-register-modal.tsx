"use client";

import { useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks";
import { useCashRegisterForm } from "../hooks/useCashRegisterForm";

interface OpenCashRegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OpenCashRegisterModal({ onOpenChange, open }: OpenCashRegisterModalProps) {
  const { isLoadingCreate, register, onSubmit, setValue } = useCashRegisterForm(() =>
    onOpenChange(false)
  );
  const { user } = useAuth();
  const openedByName = user?.fullName?.trim() ?? "";
  const hasResponsibleName = Boolean(openedByName.length);

  useEffect(() => {
    if (openedByName) {
      setValue("openedByName", openedByName, {
        shouldValidate: true,
      });
    }
  }, [openedByName, setValue]);

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Abrir caja"
      description="No encontramos una caja abierta para esta tienda. Ingresa el monto inicial para continuar."
      size="lg"
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div className="space-y-4">
        <Label htmlFor="opening-amount">
          Monto inicial <span className="text-destructive">*</span>
        </Label>
        <Input
          id="opening-amount"
          type="number"
          min={0}
          step={0.01}
          placeholder="Ingresa el monto inicial"
          autoFocus
          {...register("openingAmount", {
            required: "El monto inicial es obligatorio",
            valueAsNumber: true,
            min: {
              value: 0,
              message: "El monto debe ser mayor o igual a 0",
            },
          })}
        />
        <p className="text-muted-foreground text-xs">
          Este será el efectivo de inicio para la caja de la tienda.
        </p>
        {!hasResponsibleName ? (
          <p className="text-destructive text-xs">
            No se detecta el responsable en el store. Actualiza tu perfil para poder abrir la caja.
          </p>
        ) : (
          <p className="text-muted-foreground text-xs">
            Responsable: <span className="font-medium">{openedByName}</span>
          </p>
        )}
      </div>

      <ModalFooter className="justify-end">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button type="submit" variant="default" onClick={onSubmit} disabled={isLoadingCreate}>
          Abrir caja
        </Button>
      </ModalFooter>
    </Modal>
  );
}
