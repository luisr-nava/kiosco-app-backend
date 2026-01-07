import { create } from "zustand";
import { ModalStore } from "./modal.types";

export const useModalStore = create<ModalStore>((set) => ({
  type: null,
  data: null,

  openModal: (type, data) =>
    set({
      type,
      data: data ?? null,
    }),

  closeModal: () =>
    set({
      type: null,
      data: null,
    }),
}));
