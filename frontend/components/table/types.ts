import React from "react";

export type SortDirection = "asc" | "desc";

export interface TableColumn<T> {
  header: string;
  cell: (row: T) => React.ReactNode;

  // sorting
  sortable?: boolean;
  sortKey?: (row: T) => string | number;

  align?: "left" | "right";
}

export interface TablePagination {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}
export interface BaseTableAction<T> {
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
}

export type TableAction<T> =
  | (BaseTableAction<T> & {
      type: "edit";
    })
  | (BaseTableAction<T> & {
      type: "delete";

    });