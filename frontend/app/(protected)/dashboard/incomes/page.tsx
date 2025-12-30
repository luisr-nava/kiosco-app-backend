"use client";

import { useAuth } from "@/features/auth/hooks";

import { ShopLoading } from "@/components/shop-loading";
import { Modal } from "@/components/ui/modal";
import {
  AccessRestrictedCard,
  Pagination,
  SelectShopCard,
} from "@/app/(protected)/components";
import { usePaymentMethods } from "@/app/(protected)/settings/payment-method/hooks";
import { IncomeHeader, IncomeForm, IncomeTable } from "./components";
import { useIncome } from "./hooks/useIncome";
import { Button } from "@/components/ui/button";
import { useShopStore } from "@/features/shop/shop.store";

export default function IncomesPage() {
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const { activeShopId } = useShopStore();

  const {
    search,
    setSearch,
    page,
    limit,
    setPage,
    setLimit,
    pagination,
    incomes,
    incomesLoading,
    isFetching,
    isModalOpen,
    editingIncome,
    deleteTarget,
    deletingId,
    handleSubmit,
    handleOpenCreate,
    handleEdit,
    handleCancelEdit,
    handleDelete,
    closeDeleteModal,
    confirmDelete,
    createMutation,
    updateMutation,
    deleteMutation,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    dateError,
    openCashLoading,
    openCashFetching,
  } = useIncome({ isOwner, activeShopId });

  const {
    paymentMethods,
    isLoading: paymentMethodsLoading,
    isFetching: paymentMethodsFetching,
  } = usePaymentMethods();

  if (!isOwner) {
    return <AccessRestrictedCard />;
  }

  if (!activeShopId) {
    return (
      <SelectShopCard description="Debes elegir una tienda activa para gestionar los ingresos." />
    );
  }

  return (
    <div className="space-y-6">
      <IncomeHeader
        search={search}
        setSearch={setSearch}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        dateError={dateError}
        handleOpenCreate={handleOpenCreate}
      />

      <IncomeTable
        incomes={incomes}
        isLoading={incomesLoading}
        isFetching={isFetching}
        onEdit={(income) => {
          handleEdit(income);
        }}
        onDelete={handleDelete}
        deletingId={deletingId}
        paymentMethods={paymentMethods}
      />

      {incomes.length > 0 && (
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
        title={editingIncome ? "Editar ingreso" : "Nuevo ingreso"}
        // description={`Tienda: ${activeShop?.name || activeShopId}`}
        >
        <IncomeForm
          onSubmit={handleSubmit}
          isSubmitting={
            createMutation.isPending ||
            updateMutation.isPending ||
            openCashLoading ||
            openCashFetching
          }
          editingIncome={editingIncome}
          onCancelEdit={handleCancelEdit}
          paymentMethods={paymentMethods}
          paymentMethodsLoading={paymentMethodsLoading}
          paymentMethodsFetching={paymentMethodsFetching}
        />
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        title="Eliminar ingreso"
        description="Esta acción es permanente y no podrás recuperar el registro.">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ¿Seguro que deseas eliminar{" "}
            <span className="font-semibold">{deleteTarget?.description}</span>?
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

