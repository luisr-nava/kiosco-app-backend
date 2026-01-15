import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import { PaymentMethodForm } from "./payment-method-form";
import { usePaymentMethodForm } from "../hooks/usePaymentMethodForm";
import { PaymentMethod } from "../types";
import { PaymentMethodTable } from "./payment-method-table";
import { usePaymentMethods } from "../hooks";
import { usePaymentMethodModals } from "../hooks/usePaymentMethodModals";
import PaymentMethodDeleteModal from "./payment-method-delete-modal";

export default function PaymentMethodPanel() {
  const modals = usePaymentMethodModals();
  const {
    isFetching,
    paymentMethods,
    fetchNextPaymentMethods,
    hasMorePaymentMethods,
    isFetchingNextPaymentMethods,
  } = usePaymentMethods();

  const [editingCategory, setEditingPayment] = useState<
    PaymentMethod | undefined
  >();
  const handleCancelEdit = () => {
    setEditingPayment(undefined);
  };
  const { form, onSubmit, isLoading, isEditing } = usePaymentMethodForm(
    editingCategory,
    handleCancelEdit
  );
  return (
    <>
      <Card>
        <CardContent className="grid min-w-0 gap-6 overflow-hidden">
          <PaymentMethodForm
            form={form}
            onSubmit={onSubmit}
            isEditing={isEditing}
            pending={isLoading}
            handleCancelEdit={handleCancelEdit}
          />
          <PaymentMethodTable
            onDelete={modals.openDelete}
            paymentMethods={paymentMethods}
            loading={isFetching && !isFetchingNextPaymentMethods}
            onEdit={(payment) => setEditingPayment(payment)}
            hasNextPage={hasMorePaymentMethods}
            fetchNextPage={fetchNextPaymentMethods}
            isFetchingNextPage={isFetchingNextPaymentMethods}
          />
        </CardContent>
      </Card>
      <PaymentMethodDeleteModal modals={modals} />
    </>
  );
}
