export default function getHslColor(variable: string, alpha = 1) {
  if (typeof window === "undefined") return "transparent";

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();

  return `hsl(${value} / ${alpha})`;
}
