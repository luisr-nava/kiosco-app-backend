import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { TableAction, TableColumn, TablePagination } from "./types";
import { useTableSort } from "./useTableSort";
import { TableActions } from "./TableActions";

interface BaseTableProps<T> {
  data: T[];
  getRowId: (row: T) => string;
  columns: TableColumn<T>[];
  actions?: (row: T) => TableAction<T>[];
  renderExpandedContent?: (row: T) => React.ReactNode;
  pagination?: TablePagination;
}

export function BaseTable<T>({
  data,
  getRowId,
  columns,
  actions,
  renderExpandedContent,
  pagination,
}: BaseTableProps<T>) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const isExpandable = Boolean(renderExpandedContent);

  const { sortedData, sortBy, toggleSort } = useTableSort(data, columns);

  return (
    <Table className="overflow-hidden rounded-md border">
      {/* HEADER */}
      <TableHeader className="bg-muted">
        <TableRow>
          {columns.map((col, index) => {
            const isSorted = sortBy?.index === index;

            return (
              <TableHead
                key={col.header}
                className={`select-none ${
                  col.align === "right" ? "text-right" : ""
                } ${col.sortable ? "cursor-pointer" : ""}`}
                onClick={col.sortable ? () => toggleSort(index) : undefined}>
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable &&
                    isSorted &&
                    (sortBy.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                </div>
              </TableHead>
            );
          })}

          {actions && <TableHead className="text-right">Acción</TableHead>}
        </TableRow>
      </TableHeader>

      {/* BODY */}
      <TableBody>
        {sortedData.map((row) => {
          const id = getRowId(row);
          const isOpen = expandedRow === id;

          return (
            <React.Fragment key={id}>
              <TableRow
                className={isExpandable ? "cursor-pointer" : undefined}
                onClick={
                  isExpandable
                    ? () => setExpandedRow(isOpen ? null : id)
                    : undefined
                }>
                {columns.map((col) => (
                  <TableCell
                    key={col.header}
                    className={col.align === "right" ? "text-right" : ""}>
                    {col.cell(row)}
                  </TableCell>
                ))}

                {actions && (
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <TableActions
                      row={row}
                      actions={actions(row).map((a) => ({
                        ...a,
                        disabled: a.disabled?.(row),
                      }))}
                    />
                  </TableCell>
                )}
              </TableRow>

              {isExpandable && isOpen && (
                <TableRow className="bg-muted/40">
                  <TableCell
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="p-0">
                    {renderExpandedContent!(row)}
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          );
        })}
      </TableBody>

      {/* FOOTER (opcional) */}
      {pagination && (
        <TableFooter>
          <TableRow>
            <TableCell
              colSpan={columns.length + (actions ? 1 : 0)}
              className="text-center text-sm text-muted-foreground">
              <Pagination
                page={pagination.page}
                limit={pagination.limit}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                isLoading={pagination.isFetching}
                onPageChange={(page) => {
                  if (page < 1) return;
                  pagination.onPageChange(page);
                }}
                onLimitChange={pagination.onLimitChange}
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      )}
    </Table>
  );
}

