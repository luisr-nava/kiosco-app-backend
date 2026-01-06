import {
  usePoductCreateMutation,
  useProductUpdateMutation,
} from "./useProductMutation";
import { CreateProductDto, Product } from "../types";
import { useForm } from "react-hook-form";
import { useShopStore } from "@/features/shop/shop.store";
import { toast } from "sonner";
import { useEffect } from "react";

const initialForm: CreateProductDto = {
  name: "",
  description: "",
  barcode: "",
  shopId: "",
  costPrice: undefined,
  salePrice: undefined,
  stock: undefined,
  supplierId: "",
  isActive: true,
  measurementUnitId: undefined,
};

function mapProductToForm(
  product: Product,
  initialForm: CreateProductDto,
): CreateProductDto {
  return {
    ...initialForm,
    name: product.name,
    description: product.description || "",
    barcode: product.barcode || "",
    costPrice: product.costPrice,
    salePrice: product.salePrice,
    stock: product.stock,
    supplierId: product.supplierId || "",
    isActive: product.isActive,
    measurementUnitId: product.measurementUnit?.id,
  };
}
export const useProductForm = (
  editProduct?: Product,
  isEdit?: boolean,
  onClose?: () => void,
) => {
  const { activeShopId } = useShopStore();

  const createMutation = usePoductCreateMutation();
  const updateMutation = useProductUpdateMutation();

  const form = useForm<CreateProductDto>({
    defaultValues: initialForm,
  });

  const onSubmit = async (values: CreateProductDto) => {
    const { isActive, ...restValues } = values;

    const basePayload: CreateProductDto = {
      ...restValues,
      shopId: activeShopId!,
      supplierId: restValues.supplierId || undefined,
    };

    if (editProduct) {
      updateMutation.mutate(
        {
          id: editProduct.id,
          payload: { ...basePayload, isActive },
        },
        {
          onSuccess: () => {
            toast.success("Producto actualizado");
          },
          onError: () => {
            toast.error("No se pudo actualizar el producto");
          },
        },
      );
    } else {
      createMutation.mutate(basePayload, {
        onSuccess: () => {
          toast.success("Producto creado");
        },
        onError: () => {
          toast.error("No se pudo crear el producto");
        },
      });
    }

    onClose?.();
    updateMutation.reset();
  };

  useEffect(() => {
    if (!isEdit) {
      form.reset(initialForm);
      return;
    }

    if (editProduct) {
      const mapped = mapProductToForm(editProduct, initialForm);
      console.log("MAPPED FORM", mapped);
      form.reset(mapped);
    }
  }, [isEdit, editProduct, form]);
  return {
    form,
    activeShopId,
    createMutation,
    updateMutation,
    isLoadingCreate: createMutation.isPending,
    isLoadingUpdate: updateMutation.isPending,
    onSubmit,
    reset: form.reset,
    initialForm,
  };
};

