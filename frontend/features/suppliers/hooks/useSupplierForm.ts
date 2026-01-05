import { useShopStore } from "@/features/shop/shop.store";
import { CreateSupplierDto, Supplier } from "../types";
import {
  useSupplierCreateMutation,
  useSupplierDeleteMutation,
  useSupplierUpdateMutation,
} from "./useSupplierMutations";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const initialForm: CreateSupplierDto = {
  name: "",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
  categoryId: "",
  shopIds: [],
};

export const useSupplierForm = (
  editSupplier?: Supplier,
  deleteSupplier?: Supplier,
  onClose?: () => void,
) => {
  const { activeShopId } = useShopStore();

  const createMutation = useSupplierCreateMutation();
  const updateMutation = useSupplierUpdateMutation();
  const deleteMutation = useSupplierDeleteMutation();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors, isValid },
  } = useForm<CreateSupplierDto>({
    defaultValues: initialForm,
    mode: "onChange",
  });
  const onSubmit = handleSubmit((values) => {
    const basePayload: CreateSupplierDto = {
      ...values,
      shopIds: [activeShopId!],
    };
    if (editSupplier) {
      updateMutation.mutate(
        {
          id: editSupplier.id,
          payload: basePayload,
        },
        {
          onSuccess: () => {
            toast.success("Gasto actualizado");
          },
          onError: () => {
            toast.error("No se pudo actualizar el cliente");
          },
        },
      );
    } else if (deleteSupplier) {
      deleteMutation.mutate(
        {
          id: deleteSupplier.id,
        },
        {
          onSuccess: () => {
            toast.success("Gasto eliminado correctamente");
          },
          onError: () => {
            toast.error("No se pudo eliminar el gasto");
          },
        },
      );
    } else {
      createMutation.mutate(basePayload, {
        onSuccess: () => {
          toast.success("Gasto creado");
        },
        onError: () => {
          toast.error("No se pudo crear el gasto");
        },
      });
    }
    onClose?.();
    reset();
  });
  return {
    activeShopId,
    createMutation,
    updateMutation,
    deleteMutation,
    isLoadingCreate: createMutation.isPending,
    isLoadingUpdate: updateMutation.isPending,
    isLoadingDelete: deleteMutation.isPending,
    register,
    reset,
    onSubmit,
    initialForm,
    setValue,
    isValid,
    control,
    getValues,
    errors,
  };
};

