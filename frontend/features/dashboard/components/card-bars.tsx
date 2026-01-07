import { CardContent } from "@/components/ui/card";
import { Period } from "@/utils";
import { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
export function formatTooltipTitle(label: string, period: Period) {
  switch (period) {
    case "week":
      // lunes, martes, etc.
      return label;

    case "month":
      // día del mes
      return `Día ${label}`;

    case "year":
      // mes
      return label;

    default:
      return label;
  }
}
interface ChartValues {
  labels: (string | Date)[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    borderSkipped: boolean;
    barThickness: number;
    minBarLength: number;
    maxBarLength: number;
  }[];
}

interface CardBarsProps {
  period: Period;
  hasAnyValue: boolean;
  analyticsLoading: boolean;
  incomesVsExpensesChart: ChartValues;
  salesVsPurchasesChart: ChartValues;
}
export default function CardBars({
  period,
  hasAnyValue,
  analyticsLoading,
  incomesVsExpensesChart,
  salesVsPurchasesChart,
}: CardBarsProps) {
  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "rgba(255, 255, 255)",
          usePointStyle: true,
          pointStyle: "rectRounded",
          boxWidth: 8,
          boxHeight: 8,
          padding: 16,
        },
      },

      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,

        position: "average",
        yAlign: "bottom",
        caretPadding: 12, // 👈 separación del eje
        padding: 10,

        titleSpacing: 4,
        titleMarginBottom: 6,

        titleFont: {
          size: 12,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },

        backgroundColor: "rgba(0, 0, 0, 0.85)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        callbacks: {
          title(context) {
            const label = context[0]?.label ?? "";
            return formatTooltipTitle(label, period);
          },
          label(context) {
            const value = context.parsed.y ?? 0;
            return `${context.dataset.label}: ${value}`;
          },
        },
      },
    },

    scales: {
      x: {
        type: "category",
        grid: {
          display: false,
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255)",
          maxRotation: 0,
          autoSkip: period !== "year",
          minRotation: period === "year" ? 35 : 0,
          font: {
            size: 14,
            weight: "bolder",
          },
        },
      },

      y: {
        beginAtZero: true,
        min: hasAnyValue ? undefined : 0,
        max: hasAnyValue ? undefined : 10,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255)",
          font: {
            size: 14,
            weight: "bolder",
          },
          callback(value) {
            return Number(value).toLocaleString("es-AR");
          },
        },
      },
    },
  };
  return (
    <CardContent className="py-2">
      {analyticsLoading ? (
        <div className="text-muted-foreground flex items-center justify-center text-xs">
          Cargando datos…
        </div>
      ) : (
        <div className="w-full gap-5 md:flex">
          <div className="h-[280px] md:w-1/2">
            <Bar data={incomesVsExpensesChart} options={chartOptions} />
          </div>
          <div className="h-[280px] md:w-1/2">
            <Bar data={salesVsPurchasesChart} options={chartOptions} />
          </div>
        </div>
      )}
    </CardContent>
  );
}
