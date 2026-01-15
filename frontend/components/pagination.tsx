import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  limit: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
  limitOptions?: number[];
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  limit,
  totalItems,
  onPageChange,
  onLimitChange,
  isLoading = false,
  limitOptions = [10, 25, 50],
  className,
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages || 1, 1);
  const prevDisabled = page <= 1 || isLoading;
  const nextDisabled = page >= safeTotalPages || isLoading;
  const disableLimitSelect =
    isLoading ||
    (totalItems !== undefined ? totalItems <= limit : safeTotalPages <= 1);

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
    <div
      className={cn(
        "relative flex flex-col items-center gap-3 text-sm sm:flex-row sm:justify-center",
        className
      )}
    >
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => !prevDisabled && onPageChange(page - 1)}
          className="border-primary/50 bg-card/80 text-primary hover:bg-primary/20 h-9 w-9 border p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          {pagesToRender.map((item, idx) => {
            if (item === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="text-primary/80 px-2 font-semibold"
                >
                  ...
                </span>
              );
            }

            const pageNumber = item as number;
            const isActive = pageNumber === page;
            return (
              <Button
                variant={isActive ? "ghost" : "outline"}
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                disabled={isLoading || isActive}
                className={cn(
                  "text-primary border-primary h-9 min-w-9 rounded-md border px-2 text-sm font-semibold shadow-sm transition",
                  isLoading && !isActive && "cursor-not-allowed opacity-70"
                )}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= safeTotalPages}
          onClick={() => !nextDisabled && onPageChange(page + 1)}
          className="border-primary/50 bg-card/80 text-primary hover:bg-primary/20 h-9 w-9 border p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 sm:absolute sm:right-4">
        <select
          className="bg-background border-primary h-9 max-w-[220px] min-w-[120px] rounded-md border px-3 text-sm sm:w-44 sm:min-w-[170px]"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          disabled={disableLimitSelect}
        >
          {limitOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
