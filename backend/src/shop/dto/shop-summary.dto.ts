export class ShopSummaryDto {
  employeesCount!: number;
  productsCount!: number;
  categoriesCount!: number;
  purchasesCount!: number;
  salesCount!: number;
  recentPurchasesLast30Days!: number;
  totalSales!: number;
  totalExpenses!: number;
  totalIncomes!: number;
  balance!: number;
}

export class GetShopSummaryResponseDto {
  message!: string;
  data!: ShopSummaryDto;
}
