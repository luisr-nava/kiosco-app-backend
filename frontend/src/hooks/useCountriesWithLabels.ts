import { COUNTRY_CODES } from "@/lib/constants/shop";
import { useMemo } from "react";

interface CountryOption {
  code: string;
  label: string;
}

export const useCountriesWithLabels = (
  locales: string[] = ["es", "en"]
): CountryOption[] => {
  const regionDisplay = useMemo(() => {
    try {
      return new Intl.DisplayNames(locales, { type: "region" });
    } catch {
      return null;
    }
  }, [locales]);

  return useMemo(() => {
    return COUNTRY_CODES.map((code) => {
      const label = regionDisplay?.of(code) ?? code;

      return {
        code,
        label,
      };
    });
  }, [regionDisplay]);
};
