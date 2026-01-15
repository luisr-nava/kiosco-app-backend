"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type {
  MeasurementBaseUnit,
  MeasurementUnitCategory,
} from "../../../../../features/settings/configuration/panels/resources/measurement-unit/types";
import {
  CategoriesPanel,
  ResourcesPanel,
} from "@/features/settings/configuration/panels";

const BASE_UNIT_BY_CATEGORY: Record<
  MeasurementUnitCategory,
  MeasurementBaseUnit
> = {
  UNIT: "UNIT",
  WEIGHT: "KG",
  VOLUME: "L",
};
type ConfigurationTab = "categories" | "resources" | "measurement-units";
export default function ConfigurationPage() {
  const TABS: {
    key: ConfigurationTab;
    label: string;
    Component: React.ComponentType;
  }[] = [
    {
      key: "categories",
      label: "Categorías",
      Component: CategoriesPanel,
    },
    {
      key: "resources",
      label: "Recursos",
      Component: ResourcesPanel,
    },
  ];

  const [activeTab, setActiveTab] = useState<ConfigurationTab>("categories");

  const ActiveComponent = TABS.find((t) => t.key === activeTab)!.Component;

  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <aside className="space-y-2 pt-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={cn(
              "w-full rounded-md px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-white text-black shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </aside>

      <main>
        <ActiveComponent />
      </main>
    </div>
  );

  // const {
  //   measurementUnits,
  //   isLoading: measurementUnitsLoading,
  //   isFetching: measurementUnitsFetching,
  // } = useMeasurementUnits();
  // const {
  //   createMutation: createMeasurementUnit,
  //   updateMutation: updateMeasurementUnit,
  //   deleteMutation: deleteMeasurementUnit,
  // } = useMeasurementUnitMutations();

  // const measurementUnitsView = (
  //   <div className="space-y-4">
  //     <Card>
  //       <CardContent className="space-y-4">
  //         <div>
  //           <CardTitle>Unidades de medida</CardTitle>
  //           <CardDescription>
  //             Administra las unidades disponibles para tus productos.
  //           </CardDescription>
  //         </div>
  //         <MeasurementUnitForm
  //           onSubmit={(values) => {
  //             if (!activeShopId) return;

  //             const payload = {
  //               name: values.name,
  //               code: values.code.toUpperCase(),
  //               category: values.category,
  //               baseUnit: BASE_UNIT_BY_CATEGORY[values.category],
  //               conversionFactor: values.conversionFactor,
  //             };

  //             if (editingMeasurementUnit) {
  //               updateMeasurementUnit.mutate(
  //                 { id: editingMeasurementUnit.id, payload },
  //                 { onSuccess: () => setEditingMeasurementUnit(null) }
  //               );
  //               return;
  //             }

  //             createMeasurementUnit.mutate(
  //               { ...payload, shopIds: [activeShopId] },
  //               {
  //                 onSuccess: () => setEditingMeasurementUnit(null),
  //               }
  //             );
  //           }}
  //           isSubmitting={
  //             editingMeasurementUnit
  //               ? updateMeasurementUnit.isPending
  //               : createMeasurementUnit.isPending
  //           }
  //           editing={editingMeasurementUnit}
  //           onCancelEdit={() => setEditingMeasurementUnit(null)}
  //           disabled={!activeShopId}
  //         />
  //       </CardContent>
  //     </Card>

  //     <MeasurementUnitTable
  //       measurementUnits={measurementUnits}
  //       isLoading={measurementUnitsLoading}
  //       isFetching={measurementUnitsFetching}
  //       deletingId={deletingMeasurementUnitId}
  //       onEdit={(unit) => {
  //         if (unit.isDefault || unit.isBaseUnit) return;
  //         setEditingMeasurementUnit(unit);
  //       }}
  //       onDelete={(unit) => {
  //         if (unit.isDefault || unit.isBaseUnit) return;
  //         setDeletingMeasurementUnitId(unit.id);
  //         deleteMeasurementUnit.mutate(unit.id, {
  //           onSettled: () => setDeletingMeasurementUnitId(null),
  //         });
  //       }}
  //     />
  //   </div>
  // );

  // const configurationView = (
  //   <div className="grid gap-4 md:grid-cols-[220px_1fr]">
  //     <div className="space-y-2 pt-6">
  //       <button
  //         type="button"
  //         className={cn(
  //           "w-full rounded-md px-3 py-2 text-sm font-medium transition-colors",
  //           panel === "categories"
  //             ? "bg-white text-black shadow-sm"
  //             : "bg-muted text-muted-foreground hover:text-foreground"
  //         )}
  //         onClick={() => setPanel("categories")}
  //       >
  //         Categorías
  //       </button>
  //       <button
  //         type="button"
  //         className={cn(
  //           "w-full rounded-md px-3 py-2 text-sm font-medium transition-colors",
  //           panel === "resources"
  //             ? "bg-white text-black shadow-sm"
  //             : "bg-muted text-muted-foreground hover:text-foreground"
  //         )}
  //         onClick={() => setPanel("resources")}
  //       >
  //         Métodos de pago
  //       </button>
  //       <button
  //         type="button"
  //         className={cn(
  //           "w-full rounded-md px-3 py-2 text-sm font-medium transition-colors",
  //           panel === "measurement-units"
  //             ? "bg-white text-black shadow-sm"
  //             : "bg-muted text-muted-foreground hover:text-foreground"
  //         )}
  //         onClick={() => setPanel("measurement-units")}
  //       >
  //         Unidades de medida
  //       </button>
  //     </div>

  //     <div>
  //       {panel === "categories"
  //         ? categoriesView
  //         : panel === "resources"
  //           ? paymentMethodsView
  //           : measurementUnitsView}
  //     </div>
  //   </div>
  // );

  // return configurationView;
}
