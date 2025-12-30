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
import { ExpenseHeader, ExpenseForm, ExpenseTable } from "./components";
import { useExpense } from "./hooks/useExpense";
import { Button } from "@/components/ui/button";
import { useShopStore } from "@/features/shop/shop.store";

export default function ExpensesPage() {
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
    expenses,
    expensesLoading,
    isFetching,
    isModalOpen,
    editingExpense,
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
  } = useExpense({ isOwner, activeShopId });

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
      <SelectShopCard description="Debes elegir una tienda activa para gestionar los gastos." />
    );
  }

  return (
    <div className="space-y-6">
      <ExpenseHeader
        search={search}
        setSearch={setSearch}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        dateError={dateError}
        handleOpenCreate={handleOpenCreate}
      />

      <ExpenseTable
        expenses={expenses}
        isLoading={expensesLoading}
        isFetching={isFetching}
        onEdit={(expense) => {
          handleEdit(expense);
        }}
        onDelete={handleDelete}
        deletingId={deletingId}
        paymentMethods={paymentMethods}
      />

      {expenses.length > 0 && (
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
        title={editingExpense ? "Editar gasto" : "Nuevo gasto"}
        // description={`Tienda: ${activeShop?.name || activeShopId}`}
        >
        <ExpenseForm
          onSubmit={handleSubmit}
          isSubmitting={
            createMutation.isPending ||
            updateMutation.isPending ||
            openCashLoading ||
            openCashFetching
          }
          editingExpense={editingExpense}
          onCancelEdit={handleCancelEdit}
          paymentMethods={paymentMethods}
          paymentMethodsLoading={paymentMethodsLoading}
          paymentMethodsFetching={paymentMethodsFetching}
        />
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        title="Eliminar gasto"
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

