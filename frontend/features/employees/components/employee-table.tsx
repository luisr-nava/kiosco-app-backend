import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { expandableRowVariants } from "@/lib/animations";
import {
  Mail,
  Phone,
  MapPin,
  NotebookPen,
  Calendar,
  Edit3,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { Employee } from "../types";
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
import { useCurrencyFormatter } from "@/src/hooks/useCurrencyFormatter";

interface EmployeeTableProps {
  employees: Employee[];
  page: number;
  limit: number;
  setLimit: (value: number) => void;
  setPage: (value: number) => void;
  isFetching: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  handleEdit: (employee: Employee) => void;
}

export default function EmployeeTable({
  employees,
  page,
  limit,
  setLimit,
  setPage,
  isFetching,
  pagination,
  handleEdit,
}: EmployeeTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const formatCurrency = useCurrencyFormatter();
  return (
    <Table className="overflow-hidden rounded-md border">
      <TableHeader className="bg-muted">
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead className="text-right">Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.length === 0 ? (
          <EmptyTable title="No hay empleados cargados." colSpan={5} />
        ) : (
          employees.map((employee) => {
            console.log(employee);

            const isOpen = expandedRow === employee.id;
            return (
              <React.Fragment key={employee.id}>
                <TableRow
                  onClick={() => setExpandedRow(isOpen ? null : employee.id)}>
                  <TableCell>{employee.fullName}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell align="right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="icon"
                        variant="outline"
                        className="text-primary border-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(employee);
                        }}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {isOpen && (
                  <TableRow className="bg-muted/40">
                    <TableCell colSpan={7} className="p-0">
                      <div className="grid grid-cols-2 gap-4 p-4 text-sm">
                        <div className="space-y-2">
                          <div className="">
                            <p className="text-muted-foreground">DNI:</p>
                            <p className="font-medium text-right sm:text-left">
                              {employee.dni || "Sin DNI"}
                            </p>
                          </div>
                          <div className="">
                            <p className="text-muted-foreground">
                              Fecha de contratación:
                            </p>
                            <p className="font-medium text-right sm:text-left">
                              {employee.hireDate || "Sin fecha"}
                            </p>
                          </div>
                          <div className="">
                            <p className="text-muted-foreground">Salario:</p>
                            <p className="font-medium text-right sm:text-left">
                              {formatCurrency(employee.salary!)}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="">
                            <p className="text-muted-foreground">Direccion:</p>
                            <p className="font-medium text-right sm:text-left">
                              {employee.address || "Sin Direccion"}
                            </p>
                          </div>
                          <div className="">
                            <p className="text-muted-foreground">
                              Contacto de emergencia:
                            </p>
                            <p className="font-medium text-right sm:text-left">
                              {employee.emergencyContact || "Sin contacto"}
                            </p>
                          </div>
                          <div className="">
                            <p className="text-muted-foreground">Notas:</p>
                            <p className="font-medium text-right sm:text-left">
                              {employee.notes || "Sin notas"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })
        )}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell
            colSpan={7}
            className="text-center text-sm text-muted-foreground">
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
    // <div className="overflow-hidden rounded-md border">
    //   <div className="hidden sm:grid grid-cols-4 bg-muted px-4 py-2 text-sm font-semibold">
    //     <span>Nombre</span>
    //     <span className="text-center">Email</span>
    //     <span className="text-center">Teléfono</span>
    //     <span className="text-right">Acción</span>
    //   </div>
    //   <div className="divide-y">
    //     {employees.map((employee, index) => {
    //       const isOpen = expandedRow === employee.id;
    //       const isLastRow = index === employees.length - 1;

    //       return (
    //         <div key={employee.id} className="last:border-b-0">
    //           <motion.div
    //             whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.04)" }}
    //             whileTap={{ scale: 0.995 }}
    //             className={`w-full text-left transition-colors px-4 py-3 grid grid-cols-[1fr_auto] items-center gap-3 sm:grid-cols-4 sm:items-center ${
    //               isOpen ? "bg-muted/50" : ""
    //             }`}
    //             role="button"
    //             tabIndex={0}
    //             onClick={() => setExpandedRow(isOpen ? null : employee.id)}>
    //             <div className="sm:col-span-1 flex items-start justify-between gap-2">
    //               <div className="flex items-start gap-3 min-w-0">
    //                 <div className="h-10 w-10 rounded-full overflow-hidden border bg-muted/50 shrink-0">
    //                   <Image
    //                     src={
    //                       employee.profileImage && employee.profileImage.trim()
    //                         ? employee.profileImage
    //                         : "/balanzio.png"
    //                     }
    //                     alt={employee.fullName}
    //                     width={40}
    //                     height={40}
    //                     className="h-full w-full object-cover"
    //                   />
    //                 </div>
    //                 <div className="flex flex-col gap-1 min-w-0">
    //                   <span className="font-medium line-clamp-1 flex items-center gap-2">
    //                     {employee.fullName}
    //                   </span>
    //                   <span className="text-xs text-muted-foreground line-clamp-1">
    //                     {employee.email}
    //                   </span>
    //                 </div>
    //               </div>
    //             </div>
    //             <div className="hidden sm:flex items-center justify-center text-sm text-muted-foreground">
    //               <span className="truncate">{employee.email}</span>
    //             </div>
    //             <div className="hidden sm:flex items-center justify-center text-sm text-muted-foreground">
    //               <span className="truncate">
    //                 {employee.phone || "Sin teléfono"}
    //               </span>
    //             </div>
    //             <div className="hidden sm:flex justify-end">
    //               <Button
    //                 size="icon"
    //                 variant="outline"
    //                 onClick={(e) => {
    //                   e.stopPropagation();
    //                   onEdit(employee);
    //                 }}
    //                 aria-label={`Editar ${employee.fullName}`}>
    //                 <Edit3 className="h-4 w-4" />
    //               </Button>
    //               <Button
    //                 size="icon"
    //                 variant="destructive"
    //                 className="ml-2"
    //                 disabled={deletingId === employee.id}
    //                 onClick={(e) => {
    //                   e.stopPropagation();
    //                   onDelete(employee);
    //                 }}
    //                 aria-label={`Eliminar ${employee.fullName}`}>
    //                 <Trash2 className="h-4 w-4" />
    //               </Button>
    //             </div>
    //             <div className="sm:hidden col-span-2 flex items-center justify-between text-xs text-muted-foreground pt-1">
    //               <span>{employee.phone || "Sin teléfono"}</span>
    //             </div>
    //           </motion.div>
    //           <AnimatePresence initial={false}>
    //             {isOpen && (
    //               <motion.div
    //                 initial="collapsed"
    //                 animate="expanded"
    //                 exit="collapsed"
    //                 variants={expandableRowVariants}
    //                 className="overflow-hidden">
    //                 <div className="space-y-3 bg-muted/40 px-4 py-3 text-sm">
    //                   <div className="grid gap-3 sm:grid-cols-2">
    //                     <div className="space-y-2">
    //                       <div className="flex items-start justify-between sm:flex-col sm:items-start sm:gap-1">
    //                         <span className="text-muted-foreground flex items-center gap-2">
    //                           <Mail className="h-4 w-4" />
    //                           Email:
    //                         </span>
    //                         <p className="font-medium text-right sm:text-left">
    //                           {employee.email}
    //                         </p>
    //                       </div>
    //                       <div className="flex items-start justify-between sm:flex-col sm:items-start sm:gap-1">
    //                         <span className="text-muted-foreground flex items-center gap-2">
    //                           <Phone className="h-4 w-4" />
    //                           Teléfono:
    //                         </span>
    //                         <p className="font-medium text-right sm:text-left">
    //                           {employee.phone || "Sin teléfono"}
    //                         </p>
    //                       </div>
    //                       <div className="flex items-start justify-between sm:flex-col sm:items-start sm:gap-1">
    //                         <span className="text-muted-foreground flex items-center gap-2">
    //                           <MapPin className="h-4 w-4" />
    //                           Dirección:
    //                         </span>
    //                         <p className="font-medium text-right sm:text-left">
    //                           {employee.address || "Sin dirección"}
    //                         </p>
    //                       </div>
    //                     </div>
    //                     <div className="space-y-2">
    //                       <div className="flex items-start justify-between sm:flex-col sm:items-start sm:gap-1">
    //                         <span className="text-muted-foreground flex items-center gap-2">
    //                           <Calendar className="h-4 w-4" />
    //                           Fecha de Nacimiento:
    //                         </span>
    //                         <p className="font-medium text-right sm:text-left">
    //                           {employee.hireDate
    //                             ? new Date(
    //                                 employee.hireDate,
    //                               ).toLocaleDateString()
    //                             : "Sin fecha"}
    //                         </p>
    //                       </div>
    //                       <div className="flex items-start justify-between sm:flex-col sm:items-start sm:gap-1">
    //                         <span className="text-muted-foreground flex items-center gap-2">
    //                           <NotebookPen className="h-4 w-4" />
    //                           Notas:
    //                         </span>
    //                         <p className="font-medium text-right sm:text-left">
    //                           {employee.notes?.trim() || "Sin notas"}
    //                         </p>
    //                       </div>
    //                     </div>
    //                   </div>
    //                   <div className="flex justify-end gap-2 sm:hidden">
    //                     <Button
    //                       size="sm"
    //                       variant="outline"
    //                       onClick={(e) => {
    //                         e.stopPropagation();
    //                         onEdit(employee);
    //                       }}>
    //                       <Edit3 className="h-4 w-4 mr-2" />
    //                       Editar
    //                     </Button>
    //                     <Button
    //                       size="sm"
    //                       variant="destructive"
    //                       disabled={deletingId === employee.id}
    //                       onClick={(e) => {
    //                         e.stopPropagation();
    //                         onDelete(employee);
    //                       }}>
    //                       <Trash2 className="h-4 w-4 mr-2" />
    //                       {deletingId === employee.id
    //                         ? "Eliminando..."
    //                         : "Eliminar"}
    //                     </Button>
    //                   </div>
    //                 </div>
    //               </motion.div>
    //             )}
    //           </AnimatePresence>
    //           {!isLastRow && <div className="border-b sm:hidden" />}
    //         </div>
    //       );
    //     })}
    //   </div>
    //   {isFetching && (
    //     <div className="flex items-center gap-2 border-t px-4 py-3 text-xs text-muted-foreground">
    //       <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    //       Actualizando lista...
    //     </div>
    //   )}
    // </div>
  );
}

