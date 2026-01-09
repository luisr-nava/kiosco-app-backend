import { useShopStore } from "@/features/shop/shop.store";
import { CreatePurchaseDto, Purchase, PurchaseItemForm } from "../types";
import { useFieldArray, useForm } from "react-hook-form";
import { useEffect } from "react";
import {
  usePurchaseCreateMutation,
  usePurchaseDeleteMutation,
  usePurchaseUpdateMutation,
} from "./usePurchaseMutations";
import { toast } from "sonner";

const initialForm: CreatePurchaseDto = {
  shopId: "",
  supplierId: null,
  notes: null,
  items: [],
};

function mapPurchaseToForm(
  purchase: Purchase,
  initialForm: CreatePurchaseDto
): CreatePurchaseDto {
  return {
    ...initialForm,
    shopId: purchase.shopId,
    supplierId: purchase.supplierId ?? initialForm.supplierId,
    paymentMethodId: purchase.paymentMethodId
      ? String(purchase.paymentMethodId)
      : "",
    notes: purchase.notes ?? initialForm.notes,
    items: purchase.items.map((item) => ({
      shopProductId: item.shopProductId,
      quantity: item.quantity,
      unitCost: item.unitCost,
      subtotal: item.subtotal,
    })),
  };
}

export const usePurchaseForm = (
  cashRegisterId: string,
  editPurchase?: Purchase,
  deletePurchase?: Purchase,
  isEdit?: boolean,
  onClose?: () => void
) => {
  const { activeShopId } = useShopStore();

  const createMutation = usePurchaseCreateMutation();
  const updateMutation = usePurchaseUpdateMutation();
  const deleteMutation = usePurchaseDeleteMutation();

  const form = useForm<CreatePurchaseDto>({
    defaultValues: initialForm,
    mode: "onChange",
  });

  const {
    fields: items,
    append,
    remove,
    update,
    replace,
  } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const buildItem = (): PurchaseItemForm => ({
    shopProductId: "",
    quantity: undefined,
    unitCost: undefined,
    subtotal: 0,
  });

  const isLastItemComplete = () => {
    const items = form.getValues("items");
    if (items.length === 0) return true;

    const last = items[items.length - 1];

    return Boolean(
      last.shopProductId &&
      Number(last.quantity) > 0 &&
      Number(last.unitCost) > 0
    );
  };

  const addItem = () => {
    if (!isLastItemComplete()) return;

    append(buildItem());
  };

  const resetForm = () => {
    form.reset(initialForm);
    replace([]);
  };

  const updateItem = (
    index: number,
    next: Partial<CreatePurchaseDto["items"][number]>
  ) => {
    const current = form.getValues(`items.${index}`);

    const quantity = next.quantity ?? current.quantity ?? 0;

    const unitCost = next.unitCost ?? current.unitCost ?? 0;

    const subtotal = quantity * unitCost;

    if (next.quantity !== undefined) {
      form.setValue(`items.${index}.quantity`, quantity, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    if (next.unitCost !== undefined) {
      form.setValue(`items.${index}.unitCost`, unitCost, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    form.setValue(`items.${index}.subtotal`, subtotal, {
      shouldDirty: false,
      shouldValidate: false,
    });
  };

  const onSubmit = async (values: CreatePurchaseDto) => {
    const payload: CreatePurchaseDto = {
      ...values,
      shopId: activeShopId!,
      items: values.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
        subtotal: Number(item.subtotal),
      })),
    };

    if (isEdit && editPurchase) {
      updateMutation.mutate(
        { id: editPurchase.id, payload },
        {
          onSuccess: () => {
            onClose?.();
            form.reset(initialForm);
            toast.success("Compra actualizada");
          },
          onError: () => {
            toast.error("No se pudo actualizar la compra");
          },
        }
      );
      return;
    }

    if (deletePurchase) {
      deleteMutation.mutate(
        { id: deletePurchase.id },
        {
          onSuccess: () => {
            onClose?.();
            form.reset(initialForm);
            toast.success("Compra eliminada correctamente");
          },
          onError: () => {
            toast.error("No se pudo eliminar la compra");
          },
        }
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        onClose?.();
        form.reset(initialForm);
        toast.success("Compra creada");
      },
      onError: () => {
        toast.error("No se pudo crear la compra");
      },
    });
  };
  console.log(editPurchase);

  useEffect(() => {
    if (!isEdit) {
      form.reset(initialForm);
      return;
    }

    if (editPurchase) {
      form.reset(mapPurchaseToForm(editPurchase, initialForm));
    }
  }, [isEdit, editPurchase]);

  const removeItem = (index: number) => {
    remove(index);
  };

  return {
    form,
    items,
    addItem,
    removeItem,
    updateItem,
    onSubmit,
    reset: form.reset,
    isLastItemComplete,
    resetForm,
    isLoadingCreate: createMutation.isPending,
    isLoadingUpdate: updateMutation.isPending,
    isLoadingDelete: deleteMutation.isPending,
  };
};
