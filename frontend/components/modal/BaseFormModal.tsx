import { ReactNode } from "react";
import { Modal } from "@/components/ui/modal";

interface BaseFormModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  isSubmitting?: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function BaseFormModal({
  isOpen,
  title,
  description,
  size = "md",
  isSubmitting = false,
  onClose,
  children,
}: BaseFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      description={description}
      size={size}
      onClose={() => {
        if (isSubmitting) return; // 👈 bloqueo simple
        onClose();
      }}>
      {children}
    </Modal>
  );
}

