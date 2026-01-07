import { Button } from "@/components/ui/button";
import { Supplier } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EmptyTable from "@/components/empty-table";
import { Pagination } from "@/components/pagination";
import { Edit3, Trash2 } from "lucide-react";
import React, { useState } from "react";

interface Props {
  handleEdit: (supplier: Supplier) => void;
  handleDelete: (supplier: Supplier) => void;
  limit: number;
  page: number;
  suppliers: Supplier[];
  setLimit: (value: number) => void;
  setPage: (value: number) => void;
  isFetching: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function SupplierTable({
  suppliers,
  handleEdit,
  handleDelete,
  limit,
  page,
  setLimit,
  setPage,
  isFetching,
  pagination,
}: Props) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  return (
    <Table className="overflow-hidden rounded-md border">
      <TableHeader className="bg-muted">
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Contacto</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead className="text-right">Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.length === 0 ? (
          <EmptyTable title="No hay proveedores cargados." colSpan={7} />
        ) : (
          suppliers.map((expense, index) => {
            const isOpen = expandedRow === expense.id;

            return (
              <React.Fragment key={expense.id}>
                <TableRow onClick={() => setExpandedRow(isOpen ? null : expense.id)}>
                  <TableCell align="right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="text-primary border-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(expense);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="border-red-500 text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(expense);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })
        )}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={7} className="text-muted-foreground text-center text-sm">
            <Pagination
              page={page}
              totalPages={pagination?.totalPages ?? 1}
              limit={limit}
              onPageChange={(nextPage) => {
                if (nextPage < 1) return;
                setPage(nextPage);
              }}
              onLimitChange={(nextLimit) => setLimit(nextLimit)}
              isLoading={isFetching}
              totalItems={pagination?.total ?? 0}
            />
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
