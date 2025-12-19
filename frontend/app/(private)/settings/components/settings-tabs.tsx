"use client";

import { useState, ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  configurationContent: ReactNode;
  preferencesContent: ReactNode;
}

/**
 * Contenedor de tabs para Ajustes con las vistas de Configuración y Preferencias.
 * Maneja el estado internamente (no cambia la URL).
 */
export const SettingsTabs = ({
  configurationContent,
  preferencesContent,
}: Props) => {
  const [tab, setTab] = useState<"configuration" | "preferences">(
    "configuration",
  );

  return (
    <Tabs
      value={tab}
      onValueChange={(value) =>
        setTab(value as "configuration" | "preferences")
      }
      className="space-y-6">
      <TabsList>
        <TabsTrigger value="configuration">Configuración</TabsTrigger>
        <TabsTrigger value="preferences">Preferencias</TabsTrigger>
      </TabsList>

      <TabsContent value="configuration">{configurationContent}</TabsContent>
      <TabsContent value="preferences">{preferencesContent}</TabsContent>
    </Tabs>
  );
};
