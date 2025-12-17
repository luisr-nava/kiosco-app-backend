import { kioscoApi } from "@/lib/kioscoApi";
import {
  CreateProductDto,
  CreateProductResponse,
  Product,
} from "../interfaces";

export const updateProductAction = async (
  id: string,
  payload: Partial<CreateProductDto>,
): Promise<Product> => {
  const { data } = await kioscoApi.patch<CreateProductResponse>(
    `/product/${id}`,
    payload,
  );

  return data.data.product;
};
