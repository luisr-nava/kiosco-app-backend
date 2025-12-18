export interface CashRegister {
  id: string;
  shopId: string;
  openingAmount: number;
  openingDate: string;
  closingDate?: string | null;
  isOpen: boolean;
}

export interface OpenCashRegisterDto {
  shopId: string;
  openingAmount: number;
}
