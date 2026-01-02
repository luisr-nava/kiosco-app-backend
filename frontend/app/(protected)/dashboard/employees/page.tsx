"use client";

import { Loading } from "@/components/loading";
import { EmployeeHeader, ModalEmployee } from "@/features/employees/components";
import { useEmployeeModals, useEmployees } from "@/features/employees/hooks/";
import { usePaginationParams } from "@/src/hooks/usePaginationParams";

export default function EmployeesPage() {
  const { openCreate } = useEmployeeModals();
  const { search, setSearch, debouncedSearch, page, limit, setPage, setLimit } =
    usePaginationParams(300);
  const { employees, employeesLoading, pagination, isFetching } = useEmployees(
    debouncedSearch,
    page,
    limit,
  );

  return (
    <div className="space-y-6">
      <EmployeeHeader
        handleOpenCreate={openCreate}
        search={search}
        setSearch={setSearch}
      />
      {employeesLoading ? <Loading /> : <div className="p-5 space-y-4"></div>}
      {/*
      <EmployeeTable
        employees={employees}
        isLoading={employeesLoading}
        isFetching={isFetching}
        onEdit={(employee) => {
          handleEdit(employee);
        }}
        onDelete={handleDelete}
        deletingId={deletingId}
      /> */}

      {/* {employees.length > 0 && (
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
      )} */}

      <ModalEmployee />
      {/* <Modal
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
      </Modal> */}
    </div>
  );
}

