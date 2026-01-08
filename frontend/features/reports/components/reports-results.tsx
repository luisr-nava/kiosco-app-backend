import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CashRegisterReport } from "../type";
import { Loading } from "@/components/loading";
import ReportsTable from "./ReportsTable";

interface Props {
  reports: CashRegisterReport[];
  openedByName: string;
  message?: string;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
}

export default function ReportsResults({
  reports,
  openedByName,
  message,
  isLoading,
  isFetching,
  isError,
  error,
}: Props) {
  if (isError) {
    return (
      <section className="border-border bg-card/80 rounded-3xl border p-6 shadow-sm">
        <Alert variant="destructive">
          <AlertTitle>Error al cargar reportes</AlertTitle>
          <AlertDescription>
            No pudimos obtener los reportes de caja.
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  return isLoading ? (
    <Loading />
  ) : (
    <ReportsTable
      reports={reports}
      openedByName={openedByName}
      isFetching={isFetching}
      emptyMessage={message}
    />
  );
}
