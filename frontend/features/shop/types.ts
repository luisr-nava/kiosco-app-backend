export interface ShopResponse {
  data: Shop[];
  message: string;
  role: string;
}
export interface Shop {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  countryCode: string;
  currencyCode: string;
  timezone: string;
}

import type { ShopAnalytics } from "@/lib/types/analytics";

export interface ShopCashRegister {
  id: string;
  shopId: string;
  status?: string;
  isOpen?: boolean;
  openingAmount?: number;
  openedAt?: string;
  openedBy?: string | null;
  closingAmount?: number | null;
  actualAmount?: number | null;
  difference?: number | null;
  closedAt?: string | null;
  closedBy?: string | null;
  closingNotes?: string | null;
}

export interface ShopFormValues {
  name: string;
  address?: string;
  phone?: string;
  countryCode: string;
  currencyCode: string;
  isActive?: boolean;
}

export interface UpdateShopDto {
  name?: string;
  address?: string;
  phone?: string;
  countryCode?: string;
  currencyCode?: string;
  isActive?: boolean;
}

export interface ShopState {
  activeShopId: string | null;
  shouldForceStoreSelection: boolean;
  setActiveShopId: (shopId: string | null) => void;
  setShouldForceStoreSelection: (force: boolean) => void;
}
