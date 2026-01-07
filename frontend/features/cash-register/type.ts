export interface CashRegisterStateResponse {
  hasOpenCashRegister: boolean;
  cashRegisterId?: string;
  openedAt?: string;
  openedBy?: string;
  openingAmount?: number;
  currentAmount?: number;
}

export interface OpenCashRegisterDto {
  shopId?: string;
  openingAmount?: number;
  openedByName?: string;
}
