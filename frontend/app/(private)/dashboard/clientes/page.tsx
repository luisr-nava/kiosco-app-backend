"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Clientes</h1>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aquí podrás gestionar la información de tus clientes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
