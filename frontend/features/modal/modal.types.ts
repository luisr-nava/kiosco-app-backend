export type ModalType =
  | "createProduct"
  | "editProduct"
  | "createCategory"
  | "editCategory"
  | "createSupplier"
  | "editSupplier"
  | "deleteSupplier"
  | "createPurchase"
  | "editPurchase"
  | "createSale"
  | "editSale"
  | "createCustomer"
  | "editCustomer"
  | "deleteCustomer"
  | "createEmployee"
  | "editEmployee"
  | "createExpense"
  | "editExpense"
  | "deleteExpense"
  | "createIncome"
  | "editIncome"
  | "deleteIncome"
  | null;

export interface ModalStoreState {
  type: ModalType;
  data: unknown | null;
}

export interface ModalStoreActions {
  openModal: (type: Exclude<ModalType, null>, data?: unknown) => void;
  closeModal: () => void;
}

export type ModalStore = ModalStoreState & ModalStoreActions;

