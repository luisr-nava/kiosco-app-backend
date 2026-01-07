"use client";

import * as React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { modalVariants, overlayVariants } from "@/lib/animations";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-full mx-4",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "lg",
  showCloseButton = true,
  closeOnOverlayClick = true,
}: ModalProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (closeOnOverlayClick && e.target === e.currentTarget) {
                onClose();
              }
            }}
          />

          {/* Modal Content */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn("bg-background relative w-full rounded-lg shadow-xl", sizeClasses[size])}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div className="flex-1">
                  {title && <h2 className="text-xl font-semibold">{title}</h2>}
                  {description && (
                    <p className="text-muted-foreground mt-1 text-sm">{description}</p>
                  )}
                </div>
                {showCloseButton && (
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "-mx-6 mt-6 -mb-6 flex items-center justify-end gap-3 border-t px-6 py-4",
        className
      )}
    >
      {children}
    </div>
  );
}
