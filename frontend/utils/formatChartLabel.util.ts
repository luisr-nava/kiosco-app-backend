export type Period = "week" | "month" | "year";
export default function formatChartLabel(label: string | Date, period: Period) {
  const date = new Date(label + "T00:00:00");

  if (period === "week") {
    return date.toLocaleDateString("es-AR", { weekday: "long" });
  }

  if (period === "month") {
    return date.getDate().toString();
  }

  if (period === "year") {
    return date.toLocaleDateString("es-AR", { month: "long" });
  }

  return label;
}
