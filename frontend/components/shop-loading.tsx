export const ShopLoading = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2" />
      <p className="text-muted-foreground">Cargando datos de la tienda...</p>
    </div>
  </div>
);
