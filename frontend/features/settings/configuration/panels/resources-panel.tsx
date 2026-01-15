import React from "react";
import PaymentMethodPanel from "./resources/payment-methods/components/payment-method-panel";
import MeasurementUnitPanel from "./resources/measurement-unit/components/measurement-unit-panel";

export default function ResourcesPanel() {
  return (
    <div className="space-y-4">
      <PaymentMethodPanel />
      <MeasurementUnitPanel />
    </div>
  );
}
