"use client";

export function ReportsHeader() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold text-foreground">
        Reportes de Caja
      </h1>
      <p className="max-w-3xl text-sm text-muted-foreground">
        Revisa todos los arqueos cerrados, compara montos y genera descargas
        para conservar un respaldo oficial de cada cierre.
      </p>
    </div>
  );
}
