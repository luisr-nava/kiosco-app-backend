"use client";

import { useState, type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { FileText, FileSpreadsheet, Download } from "lucide-react";

type ReportFileType = "pdf" | "excel";

interface Props {
  cashRegisterId: string;
  shopName: string;
  closedAt: string;
  type: ReportFileType;
}

const iconMap: Record<ReportFileType, ComponentType<{ className?: string }>> = {
  pdf: FileText,
  excel: FileSpreadsheet,
};

const labelMap: Record<ReportFileType, string> = {
  pdf: "PDF",
  excel: "Excel",
};

const extensionMap: Record<ReportFileType, string> = {
  pdf: "pdf",
  excel: "xlsx",
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_KIOSCO_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "";

const buildFileName = ({
  shopName,
  closedAt,
  type,
}: {
  shopName: string;
  closedAt: string;
  type: ReportFileType;
}): string => {
  const datePart = (() => {
    try {
      return new Date(closedAt).toISOString().split("T")[0];
    } catch {
      return "cierre";
    }
  })();

  const slugifiedShop = shopName
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `arqueo-${slugifiedShop || "tienda"}-${datePart}.${extensionMap[type]}`;
};

export function DownloadReportButton({
  cashRegisterId,
  shopName,
  closedAt,
  type,
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const Icon = iconMap[type];

  const downloadReport = async (
    fileType: ReportFileType,
    id: string,
  ): Promise<void> => {
    if (!id) {
      console.error(
        "No hay cashRegisterId disponible para descargar el reporte.",
      );
      return;
    }

    const sanitizedBase = apiBaseUrl.replace(/\/$/, "");
    const url = `${sanitizedBase || ""}/cash-register/${id}/report/${fileType}`;
    const token = Cookies.get("token");

    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!response.ok) {
      throw new Error("No se pudo descargar el archivo");
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = buildFileName({ shopName, closedAt, type: fileType });
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  };

  const downloadPdf = (id: string) => downloadReport("pdf", id);
  const downloadExcel = (id: string) => downloadReport("excel", id);

  const handleDownload = async () => {
    if (isDownloading) {
      return;
    }
    setIsDownloading(true);
    try {
      const startDownload =
        type === "pdf" ? downloadPdf : downloadExcel;
      await startDownload(cashRegisterId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error("No pudimos generar el archivo", {
        description: message,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={isDownloading}>
      <Download className="mr-2 h-4 w-4" />
      <Icon className="mr-1 h-4 w-4" />
      {labelMap[type]}
    </Button>
  );
}
