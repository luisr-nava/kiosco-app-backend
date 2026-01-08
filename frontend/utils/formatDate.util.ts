export const getLocale = () =>
  typeof navigator !== "undefined" ? navigator.language : "es-AR";
export default function formatDate(date: string): string {
  if (!date) return "-";

  // Espera "YYYY-MM-DD" o ISO
  const [year, month, day] = date.split("T")[0].split("-");

  if (!year || !month || !day) return "-";

  return `${day}/${month}/${year}`;
}
