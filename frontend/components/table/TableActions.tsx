import { Button } from "@/components/ui/button";
import { Edit3, Trash2 } from "lucide-react";

interface Props<T> {
  row: T;
  actions: {
    type: "edit" | "delete";
    onClick: (row: T) => void;
    disabled?: boolean;
  }[];
}

export function TableActions<T>({ row, actions }: Props<T>) {
  return (
    <div className="flex justify-end gap-2">
      {actions.map((action, index) => {
        if (action.type === "edit") {
          return (
            <Button
              key={index}
              size="icon"
              variant="outline"
              className="text-primary border-primary"
              onClick={() => action.onClick(row)}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          );
        }

        if (action.type === "delete") {
          return (
            <Button
              key={index}
              size="icon"
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive"
              disabled={action.disabled}
              onClick={() => action.onClick(row)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          );
        }

        return null;
      })}
    </div>
  );
}
