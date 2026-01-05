"use client";

import { Loading } from "@/components/loading";
import { SupplierHeader, SupplierTable } from "@/features/suppliers/components";
import { useSupplier, useSupplierModals } from "@/features/suppliers/hooks";
import { usePaginationParams } from "@/src/hooks/usePaginationParams";

export default function SupplierPage() {
  const { openCreate, openEdit, openDelete } = useSupplierModals();
  const { search, setSearch, debouncedSearch, page, limit, setPage, setLimit } =
    usePaginationParams(300);
  const { suppliers, supplierLoading, pagination, isFetching } = useSupplier(
    debouncedSearch,
    page,
    limit,
  );

  return (
    <div className="space-y-6">
      <SupplierHeader
        handleOpenCreate={openCreate}
        search={search}
        setSearch={setSearch}
      />
      {supplierLoading ? (
        <Loading />
      ) : (
        <SupplierTable
          suppliers={suppliers}
          handleEdit={openEdit}
          limit={limit}
          page={page}
          setLimit={setLimit}
          setPage={setPage}
          pagination={pagination!}
          isFetching={isFetching}
          handleDelete={openDelete}
        />
      )}
    </div>
    // <div className="space-y-6">
    //   <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    //     <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
    //       <div className="flex items-center gap-2 w-full sm:w-auto">
    //         <Label className="text-sm text-muted-foreground whitespace-nowrap">
    //           Buscar
    //         </Label>
    //         <Input
    //           className="w-full sm:w-64"
    //           placeholder="Nombre o email"
    //           value={search}
    //           onChange={(e) => setSearch(e.target.value)}
    //         />
    //       </div>
    //       <Button
    //         className="w-full sm:w-auto"
    //         onClick={() => {
    //           setEditingSupplier(null);
    //           setIsModalOpen(true);
    //         }}>
    //         Nuevo proveedor
    //       </Button>
    //     </div>
    //     <div className="rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
    //       <Truck className="h-4 w-4" />
    //       <div className="text-right leading-tight">
    //         <p className="font-medium">{"Tienda activa"}</p>
    //         <p>Proveedores: {suppliers.length}</p>
    //       </div>
    //     </div>
    //   </div>

    //   <div>
    //     <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
    //       {isFetching && (
    //         <span className="flex items-center gap-1">
    //           <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    //           Actualizando
    //         </span>
    //       )}
    //       {(createMutation.isPending || updateMutation.isPending) && (
    //         <span className="flex items-center gap-1">
    //           <AlertTriangle className="h-3 w-3 text-amber-500" />
    //           Guardando cambios
    //         </span>
    //       )}
    //     </div>
    //   </div>
    //   <SupplierTable
    //     suppliers={filteredSuppliers}
    //     isLoading={isLoading}
    //     isFetching={isFetching}
    //     onEdit={(supplier) => {
    //       setEditingSupplier(supplier);
    //       setIsModalOpen(true);
    //     }}
    //     onDelete={handleDelete}
    //     deletingId={deletingId}
    //   />
    //   {deleteMutation.isError && (
    //     <p className="mt-3 text-xs text-destructive">
    //       No se pudo eliminar el proveedor, intenta nuevamente.
    //     </p>
    //   )}

    //   <Modal
    //     isOpen={isModalOpen}
    //     onClose={handleCancelEdit}
    //     title={editingSupplier ? "Editar proveedor" : "Nuevo proveedor"}
    //     description={`Tienda: `}>
    //     <SupplierForm
    //       onSubmit={handleSubmit}
    //       isSubmitting={createMutation.isPending || updateMutation.isPending}
    //       editingSupplier={editingSupplier}
    //       onCancelEdit={handleCancelEdit}
    //       shops={shops}
    //       isOwner={isOwner}
    //       activeShopId={activeShopId}
    //       categories={categorySuppliers}
    //       loadMoreCategories={fetchNextSupplierCategories}
    //       hasMoreCategories={hasMoreSupplierCategories}
    //       isLoadingCategories={categorySuppliersLoading}
    //     />
    //   </Modal>

    //   <Modal
    //     isOpen={Boolean(deleteTarget)}
    //     onClose={() => setDeleteTarget(null)}
    //     title="Eliminar proveedor"
    //     description="Esta acción es permanente y no podrás recuperar el registro.">
    //     <div className="space-y-4">
    //       <p className="text-sm text-muted-foreground">
    //         ¿Seguro que deseas eliminar a{" "}
    //         <span className="font-semibold">{deleteTarget?.name}</span>? Esta
    //         acción no se puede deshacer.
    //       </p>
    //       <div className="flex justify-end gap-2">
    //         <Button
    //           variant="outline"
    //           onClick={() => setDeleteTarget(null)}
    //           disabled={deleteMutation.isPending}>
    //           Cancelar
    //         </Button>
    //         <Button
    //           variant="destructive"
    //           onClick={confirmDelete}
    //           disabled={deleteMutation.isPending}>
    //           {deleteMutation.isPending
    //             ? "Eliminando..."
    //             : "Eliminar definitivamente"}
    //         </Button>
    //       </div>
    //     </div>
    //   </Modal>
    // </div>
  );
}

