"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AjustesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Ajustes</h1>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aquí podrás configurar los parámetros del sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
