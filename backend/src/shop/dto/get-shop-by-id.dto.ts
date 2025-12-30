export type ShopRole = 'OWNER' | 'EMPLOYEE';

export class ShopMinimalDto {
  id!: string;
  name!: string;
  address!: string | null;
  phone!: string | null;
  isActive!: boolean;
  countryCode!: string;
  currencyCode!: string;
  timezone!: string;
}

export class GetShopByIdResponseDto {
  message!: string;
  role!: ShopRole;
  data!: ShopMinimalDto;
}

export class GetShopsResponseDto {
  message!: string;
  role!: ShopRole;
  data!: ShopMinimalDto[];
}
