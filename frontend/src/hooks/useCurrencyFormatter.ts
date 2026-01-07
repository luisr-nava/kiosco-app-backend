// hooks/useCurrencyFormatter.ts
import { useShopQuery } from "@/features/shop/hooks/useShopQuery";
import { useShopStore } from "@/features/shop/shop.store";

const FALLBACK_LOCALE = "es-AR";

export function useCurrencyFormatter(maximumFractionDigits: number = 0) {
  const { activeShopId } = useShopStore();

  const { shops } = useShopQuery();

  const activeShop = shops.find((s) => s.id === activeShopId);

  const currencyCode = activeShop?.currencyCode ?? "USD";
  const countryCode = activeShop?.countryCode ?? "AR";

  return (value: number) => {
    const localeCandidates = [`es-${countryCode}`, `en-${countryCode}`, FALLBACK_LOCALE];

    for (const locale of localeCandidates) {
      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency: currencyCode,
          maximumFractionDigits,
        }).format(value);
      } catch {
        // probar siguiente locale
      }
    }

    // fallback final (nunca debería pasar)
    return `${value}`;
  };
}
