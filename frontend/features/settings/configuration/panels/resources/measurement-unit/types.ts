export type MeasurementUnitCategory = "UNIT" | "WEIGHT" | "VOLUME";

export type MeasurementBaseUnit = "UNIT" | "KG" | "L";

export interface MeasurementUnit {
  id: string;
  name: string;
  code: string;
  isDefault: boolean;
  shopIds: string[];
}

export interface CreateMeasurementUnitDto {
  name: string;
  code: string;
  shopIds?: string[];
}

export type UpdateMeasurementUnitDto = {
  name: string;
  code: string;
};
export interface GetMeasurementUnitsResponse {
  message?: string;
  data: MeasurementUnit[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
