import { kioscoApi } from "@/lib/kioscoApi";
import { CreateProductDto, CreateProductResponse, Product } from "../types";

export const createProductAction = async (payload: Partial<CreateProductDto>): Promise<Product> => {
  const { data } = await kioscoApi.post<CreateProductResponse>("/product", payload);

  return data.data.product;
};
