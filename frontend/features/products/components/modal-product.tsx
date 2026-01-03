import { Modal } from "@/components/ui/modal";
import { useProductForm } from "../hooks/useProductForm";
import { useShopStore } from "@/features/shop/shop.store";
import { Supplier } from "@/lib/types";
import { MeasurementUnit } from "@/app/(protected)/settings/measurement-unit/interfaces";
import ProductForm from "./product-form";
import { useProductModals } from "../hooks/useProductModals";
import { useEffect } from "react";

interface ModalProductProps {
  suppliers: Supplier[];
  suppliersLoading: boolean;
  measurementUnits: MeasurementUnit[];
  measurementUnitsLoading: boolean;
}
export default function ModalProduct({
  suppliers,
  suppliersLoading,
  measurementUnits,
  measurementUnitsLoading,
}: ModalProductProps) {
  const { activeShopId } = useShopStore();
  const {
    createProductModal,
    editProductModal,
    editProduct,
    isEdit,
    closeAll,
  } = useProductModals();

  const {
    initialForm,
    reset,
    isLoadingCreate,
    isLoadingUpdate,
    register,
    control,
    errors,
    onSubmit,
  } = useProductForm(editProduct!, () => {
    closeAll();
    reset({ ...initialForm, shopId: activeShopId || "" });
  });
  const isSubmitting = isLoadingCreate || isLoadingUpdate;

  const handleClose = () => {
    closeAll();
    reset({ ...initialForm, shopId: activeShopId || "" });
  };

  useEffect(() => {
    if (!editProduct) return;

    reset({
      name: editProduct.name,
      description: editProduct.description || "",
      barcode: editProduct.barcode || "",
      costPrice: editProduct.costPrice ?? 0,
      salePrice: editProduct.salePrice ?? 0,
      stock: editProduct.stock ?? 1,
      supplierId: editProduct.supplierId || "",
      isActive: editProduct.isActive,
      measurementUnitId:
        editProduct.measurementUnitId || editProduct.measurementUnit?.id || "",
    });
  }, [editProduct, reset]);
  return (
    <Modal
      isOpen={createProductModal.isOpen || editProductModal.isOpen}
      onClose={handleClose}
      title={isEdit ? "Editar producto" : "Crear producto"}
      description="Completa los datos del producto"
      size="lg">
      <ProductForm
        register={register}
        control={control}
        errors={errors}
        onSubmit={onSubmit}
        onCancel={handleClose}
        isEdit={isEdit}
        isSubmitting={isSubmitting}
        suppliers={suppliers}
        suppliersLoading={suppliersLoading}
        measurementUnits={measurementUnits}
        measurementUnitsLoading={measurementUnitsLoading}
      />
    </Modal>
  );
}

