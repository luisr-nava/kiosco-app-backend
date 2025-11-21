"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EgresosPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Egresos</h1>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Registro de Egresos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aquí podrás consultar y gestionar los gastos del negocio.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
