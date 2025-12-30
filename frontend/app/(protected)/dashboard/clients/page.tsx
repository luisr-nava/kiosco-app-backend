"use client";
import { useEffect, useState } from "react";
import { usePaginationParams } from "../../hooks/useQueryParams";
import { useCustomers } from "./hooks/useCustomers";
import { useCustomerForm } from "./hooks/useCustomerForm";
import { CustomerForm, CustomerHeader, TableCustomers } from "./components";
import { Modal } from "@/components/ui/modal";
import { ShopEmpty } from "@/components/shop-emty";
import { ShopLoading } from "@/components/shop-loading";
import { Empty, Loading } from "../../components";
import { Pagination } from "@/app/(protected)/components";
import { Button } from "@/components/ui/button";
import type { Customer } from "./interfaces";
import { useShopStore } from "@/features/shop/shop.store";

export default function ClientesPage() {
  const { activeShopId } = useShopStore();

  const { search, setSearch, debouncedSearch, page, limit, setPage, setLimit } =
    usePaginationParams(300);
  const { customers, customersLoading, pagination, isFetching } = useCustomers(
    debouncedSearch,
    page,
    limit,
  );

  const form = useCustomerForm();
  const { customerModal, editCustomerModal, initialForm, reset } = form;
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const deletingId =
    form.deleteMutation.isPending &&
    form.deleteMutation.variables &&
    "id" in form.deleteMutation.variables
      ? (form.deleteMutation.variables.id as string)
      : null;

  const confirmDelete = () => {
    if (!deleteTarget) return;
    form.handleDelete(deleteTarget.id, () => setDeleteTarget(null));
  };

  useEffect(() => {
    if (!pagination) return;
    const maxPage = Math.max(pagination.totalPages, 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, pagination, setPage]);

  if (!activeShopId) return <ShopEmpty />;

  return (
    <div className="space-y-4">
      <CustomerHeader
        handleOpenCreate={form.handleOpenCreate}
        search={search}
        setSearch={setSearch}
      />
      {customersLoading ? (
        <Loading />
      ) : !customers || customers.length === 0 ? (
        <Empty description="No hay clientes cargados." />
      ) : (
        <div className="p-5 space-y-4">
          <TableCustomers
            customers={customers}
            handleEdit={form.handleEdit}
            handleDelete={(customer) => setDeleteTarget(customer)}
            deletingId={deletingId}
          />
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
        </div>
      )}

      <Modal
        isOpen={customerModal.isOpen || editCustomerModal.isOpen}
        onClose={() => {
          customerModal.close();
          editCustomerModal.close();
          reset({ ...initialForm, shopId: activeShopId || "" });
        }}
        title={editCustomerModal.isOpen ? "Editar cliente" : "Crear cliente"}
        description="Completa los datos del cliente"
        size="lg">
        <CustomerForm
          activeShopId={form.activeShopId}
          createMutation={form.createMutation}
          updateMutation={form.updateMutation}
          register={form.register}
          onSubmit={form.onSubmit}
          reset={form.reset}
          customerModal={form.customerModal}
          editCustomerModal={form.editCustomerModal}
          initialForm={form.initialForm}
          control={form.control}
          errors={form.errors}
        />
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar cliente"
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
              disabled={form.deleteMutation.isPending}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={form.deleteMutation.isPending}>
              {form.deleteMutation.isPending
                ? "Eliminando..."
                : "Eliminar definitivamente"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

