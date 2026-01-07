import { cn } from "@/lib/utils"; // si ya lo usás con shadcn
import { ReactNode } from "react";

interface FormGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3;
  className?: string;
}

export function FormGrid({ children, cols = 2, className }: FormGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 2 && "md:grid-cols-2",
        cols === 3 && "md:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}
