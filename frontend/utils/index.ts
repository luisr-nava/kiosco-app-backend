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
    `es-${countryCode}`,
    `en-${countryCode}`,
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



// utils/currency.ts
export const getCurrencySymbol = (
  currencyCode: string,
  locale: string = "es",
): string => {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "symbol",
    });

    const parts = formatter.formatToParts(1);
    const currencyPart = parts.find((part) => part.type === "currency");

    return currencyPart?.value ?? currencyCode;
  } catch {
    return currencyCode;
  }
};

// utils/currency.ts
interface CurrencyOption {
  code: string;
}

export const mapCurrencyWithSymbol = (
  currencies: CurrencyOption[],
  locale?: string,
) =>
  currencies.map((currency) => ({
    code: currency.code,
    symbol: getCurrencySymbol(currency.code, locale),
  }));

