import type { ReactNode, UIEvent } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit3 } from "lucide-react";
import { Loading } from "@/app/(private)/components";

interface Item {
  id: string;
  name: string;
  shopName?: string;
  shopId?: string;
  shopIds?: string[];
  shopNames?: string[];
}

interface Props<T extends Item> {
  title: string;
  icon: ReactNode;
  items: T[];
  loading: boolean;
  emptyText: string;
  isOwner: boolean;
  onEdit: (item: T) => void;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

export const CategoryList = <T extends Item>({
  title,
  icon,
  items,
  loading,
  emptyText,
  isOwner,
  onEdit,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: Props<T>) => {
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!hasNextPage || !fetchNextPage || isFetchingNextPage || loading) return;
    const target = event.currentTarget;
    const distanceToBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight;
    if (distanceToBottom < 60) {
      fetchNextPage();
    }
  };

  return (
    <div className="rounded-lg border bg-muted/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <p className="font-semibold">{title}</p>
      </div>
      <Separator className="my-3" />
      <div
        className="min-h-40 max-h-40 overflow-y-auto pr-1 space-y-2"
        onScroll={handleScroll}>
        {loading ? (
          <Loading />
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((category) => (
              <li
                key={category.id}
                className="rounded-md border bg-background px-3 py-2 flex items-center gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{category.name}</p>
                  {isOwner && (
                    <p className="text-xs text-muted-foreground truncate">
                      {(category.shopNames && category.shopNames.length > 0
                        ? category.shopNames
                        : [category.shopName || category.shopId]
                      )?.join(", ")}
                    </p>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {isOwner &&
                    (category.shopNames && category.shopNames.length > 0 ? (
                      category.shopNames.map((shop, idx) => (
                        <Badge
                          key={`${category.id}-${shop}-${idx}`}
                          variant="secondary"
                          className="whitespace-nowrap">
                          {shop}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary" className="whitespace-nowrap">
                        {category.shopName || category.shopId}
                      </Badge>
                    ))}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(category)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {isFetchingNextPage && (
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Cargando más categorías...</span>
          </div>
        )}
      </div>
    </div>
  );
};

