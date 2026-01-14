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

  console.log(paymentMethods);

  const [editingCategory, setEditingCategory] = useState<
    PaymentMethod | undefined
  >();
  const handleCancelEdit = () => {
    setEditingCategory(undefined);
  };
  const { form, onSubmit, isLoading, isEditing } = usePaymentMethodForm(
    editingCategory,
    handleCancelEdit
  );
  return (
    <>
      <Card className="max-h-90 min-h-90">
        <CardContent className="flex h-full min-h-0 flex-col gap-6">
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
            deletingId={""}
            loading={isFetching && !isFetchingNextPaymentMethods}
            onEdit={(category) => setEditingCategory(category)}
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
