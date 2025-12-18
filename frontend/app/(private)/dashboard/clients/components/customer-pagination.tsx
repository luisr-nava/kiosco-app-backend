import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  totalPages: number;
  totalItems?: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
}

export const CustomerPagination = ({
  page,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
  isLoading = false,
}: Props) => {
  const safeTotalPages = Math.max(totalPages || 1, 1);
  const prevDisabled = page <= 1 || isLoading;
  const nextDisabled = page >= safeTotalPages || isLoading;

  const pagesToRender = useMemo(() => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }

    if (page <= 4) {
      return [1, 2, 3, 4, 5, "...", safeTotalPages];
    }

    if (page >= safeTotalPages - 3) {
      return [
        1,
        "...",
        safeTotalPages - 4,
        safeTotalPages - 3,
        safeTotalPages - 2,
        safeTotalPages - 1,
        safeTotalPages,
      ];
    }

    return [1, "...", page - 1, page, page + 1, "...", safeTotalPages];
  }, [page, safeTotalPages]);

  return (
    <div className="relative flex flex-col items-center gap-3 px-4 py-3 text-sm shadow-sm sm:flex-row sm:justify-center">
      <div className="flex items-center justify-center gap-2">
        {page > 1 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => !prevDisabled && onPageChange(page - 1)}
            className="h-9 w-9 p-0 border border-primary/50 bg-card/80 text-primary hover:bg-primary/20">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        ) : (
          <div className="h-9 w-9" />
        )}

        <div className="flex items-center gap-2">
          {pagesToRender.map((item, idx) => {
            if (item === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-primary/80 font-semibold">
                  ...
                </span>
              );
            }

            const pageNumber = item as number;
            const isActive = pageNumber === page;
            return (
              <Button
                variant={isActive ? "secondary" : "outline"}
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                disabled={isLoading || isActive}
                className={
                  "min-w-9 h-9 rounded-md px-2 text-sm font-semibold transition border shadow-sm"
                }>
                {pageNumber}
              </Button>
            );
          })}
        </div>

        {page < safeTotalPages ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => !nextDisabled && onPageChange(page + 1)}
            className="h-9 w-9 p-0 border border-primary/50 bg-card/80 text-primary hover:bg-primary/20">
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="h-9 w-9" />
        )}
      </div>

      <div className="flex items-center gap-2 justify-center sm:absolute sm:right-4">
        <select
          className="h-9 rounded-md border bg-background px-3 text-sm w-1/2 max-w-[220px] sm:w-44 sm:min-w-[170px]"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          disabled={isLoading}>
          {[10, 25, 50].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

