export const Loading = () => {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="flex flex-col items-center gap-3">
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-b-2" />
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
};
