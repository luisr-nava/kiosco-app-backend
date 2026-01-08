import {
  useCustomerCreateMutation,
  useCustomerDeleteMutation,
  useCustomerUpdateMutation,
} from "./useCustomerMutation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useShopStore } from "@/features/shop/shop.store";
import { CreateCustomerDto, Customer } from "../types";
import { useEffect } from "react";

const initialForm: CreateCustomerDto = {
  fullName: "",
  email: "",
  phone: "",
  dni: "",
  address: "",
  creditLimit: undefined,
  notes: "",
  shopId: "",
};
function mapCustomerToForm(
  customer: Customer,
  initialForm: CreateCustomerDto
): CreateCustomerDto {
  return {
    ...initialForm,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    dni: customer.dni,
    address: customer.address,
    creditLimit: customer.creditLimit,
    notes: customer.notes,
  };
}
export const useCustomerForm = (
  editCustomer?: Customer,
  deleteCustomer?: Customer,
  isEdit?: boolean,
  onClose?: () => void
) => {
  const { activeShopId } = useShopStore();

  const createMutation = useCustomerCreateMutation();
  const updateMutation = useCustomerUpdateMutation();
  const deleteMutation = useCustomerDeleteMutation();

  const form = useForm<CreateCustomerDto>({
    defaultValues: initialForm,
  });

  const onSubmit = async (values: CreateCustomerDto) => {
    const basePayload: CreateCustomerDto = {
      ...values,
      shopId: activeShopId!,
      creditLimit: +values.creditLimit!,
    };
    if (editCustomer) {
      updateMutation.mutate(
        {
          id: editCustomer.id,
          payload: basePayload,
        },
        {
          onSuccess: () => {
            toast.success("Cliente actualizado");
            onClose?.();
            updateMutation.reset();
          },
          onError: () => {
            toast.error("No se pudo actualizar el cliente");
          },
        }
      );
    } else if (deleteCustomer) {
      deleteMutation.mutate(
        {
          id: deleteCustomer.id,
        },
        {
          onSuccess: () => {
            toast.success("Cliente eliminado correctamente");
            onClose?.();
            deleteMutation.reset();
          },
          onError: () => {
            toast.error("No se pudo eliminar el cliente");
          },
        }
      );
    } else {
      createMutation.mutate(basePayload, {
        onSuccess: () => {
          toast.success("Cliente creado");
          onClose?.();
          updateMutation.reset();
        },
        onError: () => {
          toast.error("No se pudo crear el cliente");
        },
      });
    }
  };

  useEffect(() => {
    if (!isEdit) {
      form.reset(initialForm);
      return;
    }

    if (editCustomer) {
      const mapped = mapCustomerToForm(editCustomer, initialForm);
      form.reset(mapped);
    }
  }, [isEdit, editCustomer, form]);

  return {
    form,
    activeShopId,
    createMutation,
    updateMutation,
    deleteMutation,
    isLoadingCreate: createMutation.isPending,
    isLoadingUpdate: updateMutation.isPending,
    isLoadingDelete: deleteMutation.isPending,
    onSubmit,
    initialForm,
    reset: form.reset,
  };
};
