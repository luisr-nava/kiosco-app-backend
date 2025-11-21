"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProveedoresPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Proveedores</h1>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aquí podrás gestionar la información de tus proveedores.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
