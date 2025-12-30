import { ORDERED_CURRENCY_OPTIONS } from "@/lib/constants/shop";
import { mapCurrencyWithSymbol } from "@/utils";
import { useMemo } from "react";

export const useCurrencySymbols = (locale: string = "es") => {
  return useMemo(
    () => mapCurrencyWithSymbol(ORDERED_CURRENCY_OPTIONS, locale),
    [locale],
  );
};

