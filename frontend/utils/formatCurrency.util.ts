const FALLBACK_LOCALE = "en-US";

export default function formatCurrency(
  value: number,
  {
    currencyCode,
    countryCode,
    maximumFractionDigits = 0,
  }: {
    value: number;
    currencyCode: string;
    countryCode: string;
    maximumFractionDigits?: number;
  }
) {
  const localeCandidates = [`es-${countryCode}`, `en-${countryCode}`, FALLBACK_LOCALE];

  let formatter: Intl.NumberFormat | null = null;

  for (const locale of localeCandidates) {
    formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits,
    });
    break;
  }

  return formatter!.format(value);
}
