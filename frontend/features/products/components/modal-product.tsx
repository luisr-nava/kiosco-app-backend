import { Modal } from "@/components/ui/modal";
import { useProductForm } from "../hooks/useProductForm";
import { MeasurementUnit } from "@/app/(protected)/settings/measurement-unit/interfaces";
import ProductForm from "./product-form";
import { useProductModals } from "../hooks/useProductModals";
import { Supplier } from "@/features/suppliers/types";

interface ModalProductProps {
  suppliers: Supplier[];
  measurementUnits: MeasurementUnit[];
  modals: ReturnType<typeof useProductModals>;
}
export default function ModalProduct({
  suppliers,
  measurementUnits,
  modals,
}: ModalProductProps) {
  const {
    createProductModal,
    editProductModal,
    editProduct,
    isEdit,
    closeAll,
  } = modals;

  const { form, isLoadingCreate, isLoadingUpdate, onSubmit, reset } =
    useProductForm(editProduct!, isEdit, measurementUnits, () => {
      closeAll();
      reset();
    });
  const isSubmitting = isLoadingCreate || isLoadingUpdate;

  const handleClose = () => {
    closeAll();
    reset();
  };

  return (
    <Modal
      isOpen={createProductModal.isOpen || editProductModal.isOpen}
      onClose={handleClose}
      title={isEdit ? "Editar producto" : "Crear producto"}
      description="Completa los datos del producto"
      size="lg"
    >
      <ProductForm
        form={form}
        onSubmit={onSubmit}
        onCancel={handleClose}
        isEdit={isEdit}
        isSubmitting={isLoadingCreate || isLoadingUpdate}
        suppliers={suppliers}
        measurementUnits={measurementUnits}
        editProduct={editProduct!}
      />
    </Modal>
  );
}
