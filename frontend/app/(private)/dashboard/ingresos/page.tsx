"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function IngresosPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Ingresos</h1>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Registro de Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aquí podrás consultar y gestionar los ingresos del negocio.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
