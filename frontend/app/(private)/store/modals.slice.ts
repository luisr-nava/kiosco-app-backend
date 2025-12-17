import { create } from "zustand";

/**
 * Tipos de modales disponibles en la aplicación
 */
export type ModalType =
  | "createProduct"
  | "editProduct"
  | "createCategory"
  | "editCategory"
  | "createSupplier"
  | "editSupplier"
  | "createPurchase"
  | "editPurchase"
  | "createSale"
  | "editSale"
  | "createCustomer"
  | "editCustomer"
  | "createEmployee"
  | "editEmployee"
  | null;

/**
 * Estado de un modal individual
 */
interface ModalState {
  isOpen: boolean;
  data?: unknown;
}

/**
 * Estado global de modales
 */
interface ModalsState {
  modals: Record<string, ModalState>;
  openModal: (type: ModalType, data?: unknown) => void;
  closeModal: (type: ModalType) => void;
  closeAllModals: () => void;
  getModalState: (type: ModalType) => ModalState;
  isModalOpen: (type: ModalType) => boolean;
  getModalData: (type: ModalType) => unknown;
}

/**
 * Store global de modales
 * Centraliza el manejo de todos los modales de la aplicación
 */
export const useModalsStore = create<ModalsState>((set, get) => ({
  modals: {},

  /**
   * Abre un modal específico con datos opcionales
   */
  openModal: (type, data) => {
    if (!type) return;
    set((state) => ({
      modals: {
        ...state.modals,
        [type]: {
          isOpen: true,
          data: data || undefined,
        },
      },
    }));
  },

  /**
   * Cierra un modal específico
   */
  closeModal: (type) => {
    if (!type) return;
    set((state) => ({
      modals: {
        ...state.modals,
        [type]: {
          isOpen: false,
          data: undefined,
        },
      },
    }));
  },

  /**
   * Cierra todos los modales abiertos
   */
  closeAllModals: () => {
    set({ modals: {} });
  },

  /**
   * Obtiene el estado completo de un modal
   */
  getModalState: (type) => {
    if (!type) return { isOpen: false, data: undefined };
    return get().modals[type] || { isOpen: false, data: undefined };
  },

  /**
   * Verifica si un modal está abierto
   */
  isModalOpen: (type) => {
    if (!type) return false;
    return get().modals[type]?.isOpen || false;
  },

  /**
   * Obtiene los datos de un modal
   */
  getModalData: (type) => {
    if (!type) return undefined;
    return get().modals[type]?.data;
  },
}));
