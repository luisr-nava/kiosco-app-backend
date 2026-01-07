import { useModal } from "@/features/modal/hooks/useModal";
import type { Product } from "../types";

export const useProductModals = () => {
  const createProductModal = useModal("createProduct");
  const editProductModal = useModal<Product>("editProduct");

  // 🔹 estado derivado (clave)
  const editProduct = editProductModal.data ?? null;
  const isEdit = Boolean(editProduct);

  const openCreate = () => {
    createProductModal.open();
  };

  const openEdit = (product: Product) => {
    editProductModal.open(product);
  };

  const closeAll = () => {
    createProductModal.close();
    editProductModal.close();
  };

  return {
    // UI modals (si alguna vez los necesitás)
    createProductModal,
    editProductModal,

    // dominio
    editProduct,
    isEdit,

    // acciones
    openCreate,
    openEdit,
    closeAll,
  };
};
