export type MeasurementUnitCategory = "UNIT" | "WEIGHT" | "VOLUME";

export type MeasurementBaseUnit = "UNIT" | "KG" | "L";

export interface MeasurementUnit {
  id: string;
  name: string;
  code: string;
  category: MeasurementUnitCategory;
  baseUnit: MeasurementBaseUnit;
  conversionFactor: number;
  isBaseUnit: boolean;
  isDefault: boolean;
  createdByUserId: string;
  createdAt: string;
  shopIds: string[];
  assignedToShop?: boolean;
}

export interface CreateMeasurementUnitDto {
  name: string;
  code: string;
  category: MeasurementUnitCategory;
  baseUnit: MeasurementBaseUnit;
  conversionFactor: number;
  isBaseUnit?: boolean;
  isDefault?: boolean;
  shopIds?: string[];
}

export interface UpdateMeasurementUnitDto {
  name?: string;
  code?: string;
  category?: MeasurementUnitCategory;
  baseUnit?: MeasurementBaseUnit;
  conversionFactor?: number;
}

export interface GetMeasurementUnitsResponse {
  message: string;
  data: MeasurementUnit[];
}
