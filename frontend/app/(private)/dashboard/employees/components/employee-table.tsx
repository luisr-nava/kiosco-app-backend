import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Employee } from "../interfaces";
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

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  isFetching: boolean;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  deletingId?: string | null;
}

export const EmployeeTable = ({
  employees,
  isLoading,
  isFetching,
  onEdit,
  onDelete,
  deletingId,
}: EmployeeTableProps) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Cargando empleados...
      </div>
    );
  }

  if (!employees.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay empleados registrados en esta tienda.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="hidden sm:grid grid-cols-4 bg-muted px-4 py-2 text-sm font-semibold">
        <span>Nombre</span>
        <span className="text-center">Email</span>
        <span className="text-center">Teléfono</span>
        <span className="text-right">Acción</span>
      </div>
      <div className="divide-y">
        {employees.map((employee, index) => {
          const isOpen = expandedRow === employee.id;
          const isLastRow = index === employees.length - 1;

          return (
            <div key={employee.id} className="last:border-b-0">
              <motion.div
                whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.04)" }}
                whileTap={{ scale: 0.995 }}
                className={`w-full text-left transition-colors px-4 py-3 grid grid-cols-[1fr_auto] items-center gap-3 sm:grid-cols-4 sm:items-center ${
                  isOpen ? "bg-muted/50" : ""
                }`}
                role="button"
                tabIndex={0}
                onClick={() => setExpandedRow(isOpen ? null : employee.id)}>
                <div className="sm:col-span-1 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full overflow-hidden border bg-muted/50 flex-shrink-0">
                      <Image
                        src={
                          employee.profileImage && employee.profileImage.trim()
                            ? employee.profileImage
                            : "/kioscoapp.png"
                        }
                        alt={employee.fullName}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-medium line-clamp-1 flex items-center gap-2">
                        {employee.fullName}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {employee.email}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center justify-center text-sm text-muted-foreground">
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="hidden sm:flex items-center justify-center text-sm text-muted-foreground">
                  <span className="truncate">
                    {employee.phone || "Sin teléfono"}
                  </span>
                </div>
                <div className="hidden sm:flex justify-end">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(employee);
                    }}
                    aria-label={`Editar ${employee.fullName}`}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="ml-2"
                    disabled={deletingId === employee.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(employee);
                    }}
                    aria-label={`Eliminar ${employee.fullName}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="sm:hidden col-span-2 flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>{employee.phone || "Sin teléfono"}</span>
                </div>
              </motion.div>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    variants={expandableRowVariants}
                    className="overflow-hidden">
                    <div className="space-y-3 bg-muted/40 px-4 py-3 text-sm">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between sm:flex-col sm:items-start sm:gap-1">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email:
                            </span>
                            <p className="font-medium text-right sm:text-left">
                              {employee.email}
                            </p>
                          </div>
                          <div className="flex items-start justify-between sm:flex-col sm:items-start sm:gap-1">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Teléfono:
                            </span>
                            <p className="font-medium text-right sm:text-left">
                              {employee.phone || "Sin teléfono"}
                            </p>
                          </div>
                          <div className="flex items-start justify-between sm:flex-col sm:items-start sm:gap-1">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Dirección:
                            </span>
                            <p className="font-medium text-right sm:text-left">
                              {employee.address || "Sin dirección"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between sm:flex-col sm:items-start sm:gap-1">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Fecha de Nacimiento:
                            </span>
                            <p className="font-medium text-right sm:text-left">
                              {employee.hireDate
                                ? new Date(employee.hireDate).toLocaleDateString()
                                : "Sin fecha"}
                            </p>
                          </div>
                          <div className="flex items-start justify-between sm:flex-col sm:items-start sm:gap-1">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <NotebookPen className="h-4 w-4" />
                              Notas:
                            </span>
                            <p className="font-medium text-right sm:text-left">
                              {employee.notes?.trim() || "Sin notas"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 sm:hidden">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(employee);
                          }}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deletingId === employee.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(employee);
                          }}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deletingId === employee.id ? "Eliminando..." : "Eliminar"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!isLastRow && <div className="border-b sm:hidden" />}
            </div>
          );
        })}
      </div>
      {isFetching && (
        <div className="flex items-center gap-2 border-t px-4 py-3 text-xs text-muted-foreground">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Actualizando lista...
        </div>
      )}
    </div>
  );
};
