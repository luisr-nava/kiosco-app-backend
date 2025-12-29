import { AnalyticsPeriod } from "@/lib/types/analytics";

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const formatAnalyticsLabel = (label: string | undefined, period: AnalyticsPeriod) => {
  if (!label) return "—";
  const parsed = new Date(label);
  if (Number.isNaN(parsed.getTime())) {
    return label;
  }

  const locale = "es-AR";
  let formatted = label;

  switch (period) {
    case "week":
      formatted = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(parsed);
      break;
    case "month":
      formatted = new Intl.DateTimeFormat(locale, { day: "numeric" }).format(parsed);
      break;
    case "year":
      formatted = new Intl.DateTimeFormat(locale, { month: "long" }).format(parsed);
      break;
  }

  return capitalize(formatted);
};
