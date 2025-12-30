import { useShallow } from "zustand/react/shallow";
import {
  useCustomerCreateMutation,
  useCustomerDeleteMutation,
  useCustomerUpdateMutation,
} from "./customer.mutation";
import type { CreateCustomerDto, Customer } from "../interfaces";
import { useForm } from "react-hook-form";
import { useModal } from "@/app/(protected)/hooks/useModal";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";
import { useShopStore } from "@/features/shop/shop.store";

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

export const useCustomerForm = () => {
  const { activeShopId } = useShopStore(
    useShallow((state) => ({
      activeShopId: state.activeShopId,
    })),
  );
  const customerModal = useModal("createCustomer");
  const editCustomerModal = useModal("editCustomer");

  const createMutation = useCustomerCreateMutation();
  const updateMutation = useCustomerUpdateMutation();
  const deleteMutation = useCustomerDeleteMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateCustomerDto>({
    defaultValues: {
      ...initialForm,
      shopId: activeShopId || "",
    },
  });

  const resetForm = () =>
    reset({
      ...initialForm,
      shopId: activeShopId || "",
    });

  const closeModals = () => {
    customerModal.close();
    editCustomerModal.close();
  };

  const handleSuccess = () => {
    resetForm();
    closeModals();
  };

  const onSubmit = handleSubmit((values) => {
    if (!activeShopId) return;

    const payload: CreateCustomerDto = {
      fullName: values.fullName.trim(),
      email: values.email?.trim() || null,
      phone: values.phone?.trim() || null,
      dni: values.dni?.toString().trim(),
      address: values.address?.trim() || null,
      creditLimit: values.creditLimit || 0,
      notes: values.notes?.trim() || null,
      shopId: activeShopId,
    };

    if (editCustomerModal.isOpen && editCustomerModal.data) {
      updateMutation.mutate(
        {
          id: String(editCustomerModal.data),
          payload,
        },
        {
          onSuccess: () => {
            toast.success("Cliente actualizado");
            handleSuccess();
          },
          onError: (error) => {
            const { message } = getErrorMessage(
              error,
              "No se pudo actualizar el cliente",
            );
            toast.error("Error", { description: message });
          },
        },
      );
    } else {
      createMutation.mutate(
        { ...payload },
        {
          onSuccess: () => {
            toast.success("Cliente creado");
            handleSuccess();
          },
          onError: (error) => {
            const { message } = getErrorMessage(
              error,
              "No se pudo crear el cliente",
            );
            toast.error("Error", { description: message });
          },
        },
      );
    }
  });

  const handleEdit = (customer: Customer) => {
    editCustomerModal.open(customer.id);
    reset({
      fullName: customer.fullName || "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      dni: customer.dni ?? "",
      address: customer.address ?? "",
      creditLimit: customer.creditLimit ?? undefined,
      notes: customer.notes ?? "",
      shopId: customer.shopId || activeShopId || "",
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    customerModal.open();
  };

  const handleDelete = (id: string, onSuccess?: () => void) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Cliente eliminado");
          handleSuccess();
          onSuccess?.();
        },
        onError: (error) => {
          const { message } = getErrorMessage(
            error,
            "No se pudo eliminar el cliente",
          );
          toast.error("Error", { description: message });
        },
      },
    );
  };

  return {
    activeShopId,
    createMutation,
    updateMutation,
    deleteMutation,
    register,
    onSubmit,
    reset,
    handleEdit,
    handleOpenCreate,
    handleDelete,
    customerModal,
    editCustomerModal,
    initialForm,
    setValue,
    control,
    errors,
  };
};

export type UseCustomerFormReturn = ReturnType<typeof useCustomerForm>;

