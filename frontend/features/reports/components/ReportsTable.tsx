"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { CashRegisterReport } from "../type";
import DownloadReportButton from "./download-report-button";
import { useCurrencyFormatter } from "@/src/hooks/useCurrencyFormatter";

interface ReportsTableProps {
  reports: CashRegisterReport[];
  closingAmount?: number;
  openedByName: string;
  isFetching: boolean;
  emptyMessage?: string;
}

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

export default function ReportsTable({
  reports,
  openedByName,
  isFetching,
  emptyMessage,
}: ReportsTableProps) {
  const formatCurrency = useCurrencyFormatter();
  if (!reports.length) {
    return (
      <div className="border-muted/40 bg-card/70 text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
        <p className="text-foreground text-lg font-semibold">
          {emptyMessage ?? "No hay arqueos cerrados en este periodo."}
        </p>
        <p>
          Intenta otro periodo o espera a que el próximo cierre esté disponible.
        </p>
      </div>
    );
  }

  return isFetching ? (
    <p className="text-muted-foreground px-6 pt-5 text-xs tracking-wide uppercase">
      Actualizando reportes...
    </p>
  ) : (
    <Table className="overflow-hidden rounded-md border">
      <TableHeader className="bg-muted">
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
          return (
            <TableRow key={report.id}>
              <TableCell>
                <span className="text-foreground font-semibold">
                  {report.shopName}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground text-sm">
                  {formatDateTime(report.openedAt)}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground text-sm">
                  {formatDateTime(report.closedAt)}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground text-sm">
                  {openedByName || "Responsable no disponible"}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(report.openingAmount)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(report.closingAmount!)}
              </TableCell>
              <TableCell className={`text-right font-semibold`}>
                {formatCurrency(report.difference)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <DownloadReportButton
                    cashRegisterId={report.id}
                    shopName={report.shopName}
                    closedAt={report.closedAt}
                    type="pdf"
                  />
                  <DownloadReportButton
                    cashRegisterId={report.id}
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
  );
}
