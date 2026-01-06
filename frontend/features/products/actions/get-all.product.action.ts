import { kioscoApi } from "@/lib/kioscoApi";
import { GetAllProductResponse, Product, ProductQueryParams } from "../types";

export const GetAllProductAction = async (
  params: ProductQueryParams,
): Promise<{
  products: Product[];
  pagination: GetAllProductResponse["pagination"];
}> => {
  const { data } = await kioscoApi.get<GetAllProductResponse>("/product", {
    params: {
      ...params,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    },
  });

  return {
    products: data.data,
    pagination: data.pagination,
  };
};



