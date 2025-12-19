"use client";

import { useAuth } from "@/app/(auth)/hooks";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import { ShopLoading } from "@/components/shop-loading";
import { Modal } from "@/components/ui/modal";
import {
  AccessRestrictedCard,
  Pagination,
  SelectShopCard,
} from "@/app/(private)/components";
import { ExpenseHeader, ExpenseForm, ExpenseTable } from "./components";
import { useExpense } from "./hooks/useExpense";
import { Button } from "@/components/ui/button";

export default function ExpensesPage() {
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const { activeShopId, activeShop, activeShopLoading } = useShopStore();

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
  } = useExpense({ isOwner, activeShopId });

  if (!isOwner) {
    return <AccessRestrictedCard />;
  }

  if (activeShopLoading) {
    return <ShopLoading />;
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
        description={`Tienda: ${activeShop?.name || activeShopId}`}>
        <ExpenseForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          editingExpense={editingExpense}
          onCancelEdit={handleCancelEdit}
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
            <span className="font-semibold">{deleteTarget?.description}</span>? Esta
            acción no se puede deshacer.
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
