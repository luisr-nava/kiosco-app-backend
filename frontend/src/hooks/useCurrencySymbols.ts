import { ORDERED_CURRENCY_OPTIONS } from "@/lib/constants/shop";
import { useMemo } from "react";
export const getCurrencySymbol = (
  currencyCode: string,
  locale: string = "es"
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
interface CurrencyOption {
  code: string;
}
export const mapCurrencyWithSymbol = (
  currencies: CurrencyOption[],
  locale?: string
) =>
  currencies.map((currency) => ({
    code: currency.code,
    symbol: getCurrencySymbol(currency.code, locale),
  }));

export const useCurrencySymbols = (locale: string = "es") => {
  return useMemo(
    () => mapCurrencyWithSymbol(ORDERED_CURRENCY_OPTIONS, locale),
    [locale]
  );
};
