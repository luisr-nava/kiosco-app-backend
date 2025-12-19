"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/(auth)/hooks";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Users } from "lucide-react";
import { Employee, CreateEmployeeDto } from "./interfaces";
import { useEmployees } from "./hooks/useEmployees";
import { useEmployeeMutations } from "./hooks/useEmployeeMutations";
import { EmployeeForm, EmployeeFormValues } from "./components/employee-form";
import { EmployeeTable } from "./components/employee-table";
import { toast } from "sonner";
import { ShopLoading } from "@/components/shop-loading";
import { Modal } from "@/components/ui/modal";
import { usePaginationParams } from "../../hooks/useQueryParams";
import { Pagination } from "@/app/(private)/components";

export default function EmployeesPage() {
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const { activeShopId, activeShop, activeShopLoading } = useShopStore();

  const {
    search,
    setSearch,
    debouncedSearch,
    page,
    limit,
    setPage,
    setLimit,
  } = usePaginationParams(300);

  const { employees, pagination, employeesLoading, isFetching } = useEmployees(
    debouncedSearch,
    page,
    limit,
    isOwner,
  );
  const { createMutation, updateMutation, deleteMutation } =
    useEmployeeMutations();

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const deletingId =
    deleteMutation.isPending && deleteMutation.variables
      ? (deleteMutation.variables as string)
      : null;

  const handleSubmit = (values: EmployeeFormValues) => {
    if (!activeShopId) {
      toast.error("Selecciona una tienda para gestionar empleados.");
      return;
    }

    const salaryValue = values.salary;
    const normalizedSalary =
      salaryValue === undefined ||
      salaryValue === null ||
      Number.isNaN(Number(salaryValue))
        ? null
        : Number(salaryValue);

    if (editingEmployee) {
      const updatePayload: Partial<CreateEmployeeDto> = {
        fullName: values.fullName,
        email: values.email,
        dni: values.dni,
        phone: values.phone || null,
        address: values.address || null,
        hireDate: values.hireDate || null,
        salary: normalizedSalary,
        notes: values.notes || null,
        profileImage: values.profileImage || null,
        emergencyContact: values.emergencyContact || null,
        role: "EMPLOYEE",
        shopId: activeShopId,
      };
      // Solo enviar password si se ingresó en edición
      if (values.password) {
        updatePayload.password = values.password;
      }

      updateMutation.mutate(
        { id: editingEmployee.id, payload: updatePayload },
        {
          onSuccess: () => {
            setEditingEmployee(null);
            setIsModalOpen(false);
          },
        },
      );
    } else {
      const createPayload: CreateEmployeeDto = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        dni: values.dni,
        phone: values.phone || null,
        address: values.address || null,
        hireDate: values.hireDate || null,
        salary: normalizedSalary,
        notes: values.notes || null,
        profileImage: values.profileImage || null,
        emergencyContact: values.emergencyContact || null,
        role: "EMPLOYEE",
        shopId: activeShopId,
      };

      createMutation.mutate(createPayload, {
        onSuccess: () => {
          setEditingEmployee(null);
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleDelete = (employee: Employee) => {
    setDeleteTarget(employee);
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setIsModalOpen(false);
  };
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        if (editingEmployee?.id === deleteTarget.id) {
          setEditingEmployee(null);
        }
        setDeleteTarget(null);
      },
    });
  };

  useEffect(() => {
    if (!pagination) return;
    const maxPage = Math.max(pagination.totalPages, 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, pagination, setPage]);

  if (!isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Acceso restringido
          </CardTitle>
          <CardDescription>
            Esta sección solo está disponible para propietarios de la cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Consulta con el owner del proyecto para obtener permisos.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (activeShopLoading) {
    return <ShopLoading />;
  }

  if (!activeShopId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Selecciona una tienda</CardTitle>
          <CardDescription>
            Debes elegir una tienda activa para gestionar los empleados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Abre el selector de tiendas para continuar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">
              Buscar
            </Label>
            <Input
              className="w-full sm:w-64"
              placeholder="Nombre o email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              setEditingEmployee(null);
              setIsModalOpen(true);
            }}>
            Nuevo empleado
          </Button>
        </div>
        <div className="rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4" />
          <div className="text-right leading-tight">
            <p className="font-medium">{activeShop?.name || "Tienda activa"}</p>
            <p>Empleados: {pagination?.total ?? employees.length}</p>
          </div>
        </div>
      </div>

      <EmployeeTable
        employees={employees}
        isLoading={employeesLoading}
        isFetching={isFetching}
        onEdit={(employee) => {
          setEditingEmployee(employee);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        deletingId={deletingId}
      />

      {employees.length > 0 && (
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
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelEdit}
        title={editingEmployee ? "Editar empleado" : "Nuevo empleado"}
        description={`Tienda: ${activeShop?.name || activeShopId}`}>
        <EmployeeForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          editingEmployee={editingEmployee}
          onCancelEdit={handleCancelEdit}
        />
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar empleado"
        description="Esta acción es permanente y no podrás recuperar el registro.">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ¿Seguro que deseas eliminar a{" "}
            <span className="font-semibold">{deleteTarget?.fullName}</span>?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar definitivamente"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
