const FALLBACK_LOCALE = "en-US";

export function formatCurrency(
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
  },
) {
  const localeCandidates = [
    `es-${countryCode}`, // LATAM / ES
    `en-${countryCode}`, // fallback común
    FALLBACK_LOCALE,
  ];

  let formatter: Intl.NumberFormat | null = null;

  for (const locale of localeCandidates) {
    try {
      formatter = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits,
      });
      break;
    } catch {
      // probar siguiente locale
    }
  }

  return formatter!.format(value);
}

