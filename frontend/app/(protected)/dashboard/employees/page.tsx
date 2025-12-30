"use client";

import { useAuth } from "@/features/auth/hooks";
import { ShopLoading } from "@/components/shop-loading";
import { Modal } from "@/components/ui/modal";
import {
  AccessRestrictedCard,
  Pagination,
  SelectShopCard,
} from "@/app/(protected)/components";
import { EmployeeHeader, EmployeeForm, EmployeeTable } from "./components";
import { useEmployee } from "./hooks";
import { Button } from "@/components/ui/button";
import { useShopStore } from "@/features/shop/shop.store";

export default function EmployeesPage() {
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const { activeShopId} = useShopStore();

  const {
    search,
    setSearch,
    page,
    limit,
    setPage,
    setLimit,
    pagination,
    employees,
    employeesLoading,
    isFetching,
    isModalOpen,
    editingEmployee,
    deleteTarget,
    deletingId,
    handleSubmit,
    handleOpenCreate,
    handleEdit,
    handleCancelEdit,
    handleDelete,
    confirmDelete,
    createMutation,
    updateMutation,
    deleteMutation,
    closeDeleteModal,
  } = useEmployee({ isOwner, activeShopId });

  if (!isOwner) {
    return <AccessRestrictedCard />;
  }


  if (!activeShopId) {
    return (
      <SelectShopCard description="Debes elegir una tienda activa para gestionar los empleados." />
    );
  }

  return (
    <div className="space-y-6">
      <EmployeeHeader
        search={search}
        setSearch={setSearch}
        handleOpenCreate={handleOpenCreate}
      />

      <EmployeeTable
        employees={employees}
        isLoading={employeesLoading}
        isFetching={isFetching}
        onEdit={(employee) => {
          handleEdit(employee);
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
        // description={`Tienda: ${activeShop?.name || activeShopId}`}
        >
        <EmployeeForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          editingEmployee={editingEmployee}
          onCancelEdit={handleCancelEdit}
        />
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
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
              onClick={closeDeleteModal}
              disabled={deleteMutation.isPending}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}>
              {deleteMutation.isPending
                ? "Eliminando..."
                : "Eliminar definitivamente"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

