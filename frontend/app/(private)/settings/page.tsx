"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AjustesPage() {
  return (
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
  );
}
