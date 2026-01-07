import { useModalStore } from "../modal.store";
import { ModalType } from "../modal.types";

export const useModal = <TData = unknown>(modalType: Exclude<ModalType, null>) => {
  const type = useModalStore((state) => state.type);
  const data = useModalStore((state) => state.data);
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);

  const isOpen = type === modalType;

  return {
    isOpen,
    data: (isOpen ? data : null) as TData | null,

    open: (payload?: TData) => openModal(modalType, payload),
    close: closeModal,
  };
};
