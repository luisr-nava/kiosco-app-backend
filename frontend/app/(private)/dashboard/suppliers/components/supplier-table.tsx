import { Button } from "@/components/ui/button";
import { Supplier } from "@/lib/types/supplier";

interface SupplierTableProps {
  suppliers: Supplier[];
  isLoading: boolean;
  isFetching: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  deletingId?: string | null;
}

export const SupplierTable = ({
  suppliers,
  isLoading,
  isFetching,
  onEdit,
  onDelete,
  deletingId,
}: SupplierTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Cargando proveedores...
      </div>
    );
  }

  if (!suppliers.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay proveedores registrados en esta tienda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Nombre</th>
            <th className="px-4 py-3 text-left font-medium">Contacto</th>
            <th className="px-4 py-3 text-left font-medium">Teléfono</th>
            <th className="px-4 py-3 text-left font-medium">Email</th>
            <th className="px-4 py-3 text-left font-medium">Categoría</th>
            <th className="px-4 py-3 text-left font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id} className="border-t">
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="font-medium">{supplier.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                {supplier.contactName || "Sin contacto"}
              </td>
              <td className="px-4 py-3">{supplier.phone || "Sin teléfono"}</td>
              <td className="px-4 py-3">{supplier.email || "Sin email"}</td>
              <td className="px-4 py-3">
                {supplier.categoryName || supplier.categoryId || "Sin categoría"}
              </td>
              <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(supplier)}>
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletingId === supplier.id}
                  onClick={() => onDelete(supplier)}>
                  {deletingId === supplier.id ? "Eliminando..." : "Eliminar"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isFetching && (
        <div className="flex items-center gap-2 border-t px-4 py-3 text-xs text-muted-foreground">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Actualizando lista...
        </div>
      )}
    </div>
  );
};
