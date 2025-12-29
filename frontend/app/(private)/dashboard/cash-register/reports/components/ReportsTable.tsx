"use client";

import type { CashRegisterReport } from "@/lib/types/cash-register-report";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { DownloadReportButton } from "./DownloadReportButton";

interface ReportsTableProps {
  reports: CashRegisterReport[];
  closingAmount?: number;
  openedByName: string;
  isFetching: boolean;
  emptyMessage?: string;
}

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

const formatDateTime = (value: string) => {
  if (!value) {
    return "Sin registro";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Sin registro";
  }
  return parsed.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const getExpectedBalance = (report: CashRegisterReport) => {
  const expected = (report.actualAmount ?? 0) - (report.difference ?? 0);
  if (Number.isFinite(expected)) {
    return expected;
  }
  return report.openingAmount ?? 0;
};

export function ReportsTable({
  reports,
  openedByName,
  isFetching,
  emptyMessage,
}: ReportsTableProps) {
  if (!reports.length) {
    return (
      <div className="rounded-2xl border border-dashed border-muted/40 bg-card/70 p-8 text-center text-sm text-muted-foreground">
        <p className="text-lg font-semibold text-foreground">
          {emptyMessage ?? "No hay arqueos cerrados en este periodo."}
        </p>
        <p>
          Intenta otro periodo o espera a que el próximo cierre esté disponible.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card shadow-sm">
      {isFetching && (
        <p className="px-6 pt-5 text-xs uppercase tracking-wide text-muted-foreground">
          Actualizando reportes...
        </p>
      )}
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tienda</TableHead>
              <TableHead>Apertura</TableHead>
              <TableHead>Cierre</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="text-right">Apertura de caja</TableHead>
              <TableHead className="text-right">Cierre de caja</TableHead>
              <TableHead className="text-right">Diferencia</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => {
              const openingAmount = report.openingAmount ?? 0;
              const expectedAmount = getExpectedBalance(report);
              const closingAmount =
                report.actualAmount ?? report ?? openingAmount;
              const rawDifference =
                closingAmount === openingAmount
                  ? 0
                  : closingAmount - expectedAmount;
              const differenceAmount = Number.isFinite(rawDifference)
                ? rawDifference
                : 0;
              const differenceClass =
                differenceAmount < 0 ? "text-destructive" : "text-foreground";
              const rowKey = report.cashRegisterId;

              return (
                <TableRow key={rowKey}>
                  <TableCell>
                    <span className="font-semibold text-foreground">
                      {report.shopName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(report.openedAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(report.closedAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {openedByName || "Responsable no disponible"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {currencyFormatter.format(openingAmount)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {currencyFormatter.format(report.closingAmount!)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${differenceClass}`}>
                    {currencyFormatter.format(differenceAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <DownloadReportButton
                        cashRegisterId={report.cashRegisterId}
                        shopName={report.shopName}
                        closedAt={report.closedAt}
                        type="pdf"
                      />
                      <DownloadReportButton
                        cashRegisterId={report.cashRegisterId}
                        shopName={report.shopName}
                        closedAt={report.closedAt}
                        type="excel"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

