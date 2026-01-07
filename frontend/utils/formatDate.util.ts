export const getLocale = () => (typeof navigator !== "undefined" ? navigator.language : "es-AR");
export default function formatDate(date: string | Date, locale: string = getLocale()): string {
  const parsed = date instanceof Date ? date : new Date(date);
  if (isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}
