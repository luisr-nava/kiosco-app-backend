import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { PaymentMethodForm } from "./payment-method-form";
import { usePaymentMethodForm } from "../hooks/usePaymentMethodForm";
import { PaymentMethod } from "../types";
import { PaymentMethodTable } from "./payment-method-table";
import { usePaymentMethods } from "../hooks";
import { usePaymentMethodModals } from "../hooks/usePaymentMethodModals";
import PaymentMethodDeleteModal from "./payment-method-delete-modal";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentMethodPanel() {
  const modals = usePaymentMethodModals();
  const {
    isFetching,
    paymentMethods,
    isLoadingPayment,
    fetchNextPaymentMethods,
    hasMorePaymentMethods,
    isFetchingNextPaymentMethods,
  } = usePaymentMethods();

  const [editingPayment, setEditingPayment] = useState<
    PaymentMethod | undefined
  >();
  const handleCancelEdit = () => {
    setEditingPayment(undefined);
  };
  const { form, onSubmit, isLoading, isEditing } = usePaymentMethodForm(
    editingPayment,
    handleCancelEdit
  );
  return (
    <>
      <Card>
        {isLoadingPayment ? (
          <div className="mx-10 grid gap-5">
            <Skeleton className="h-5 w-full rounded-full" />
            <Skeleton className="h-5 w-full rounded-full" />
            <Skeleton className="h-5 w-full rounded-full" />
            <Skeleton className="h-5 w-full rounded-full" />
          </div>
        ) : (
          <CardContent className="grid min-w-0 gap-6 overflow-hidden">
            <CardTitle>Metodos de Pago</CardTitle>
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
        )}
      </Card>
      <PaymentMethodDeleteModal modals={modals} />
    </>
  );
}
