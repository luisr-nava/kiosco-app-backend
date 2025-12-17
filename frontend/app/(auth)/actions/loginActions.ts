import { kioscoApi } from "@/lib/kioscoApi";
import { LoginResponse } from "../interfaces";
import { AxiosError } from "axios";
import { unwrapResponse } from "@/lib/api/utils";
import type { ApiError } from "@/lib/error-handler";
import { toApiError } from "@/lib/error-handler";

type LoginApiResponse = LoginResponse | { data: LoginResponse };

export const loginActions = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  try {
    const { data } = await kioscoApi.post<LoginApiResponse>(
      "/auth-client/login",
      {
        email,
        password,
      },
    );
    const payload = unwrapResponse<LoginResponse>(data);

    if (!payload?.token || !payload?.user || !payload?.projectId) {
      const invalidResponseError: ApiError = Object.assign(
        new Error("Respuesta de login inválida: faltan datos de sesión."),
        { statusCode: 500 },
      );
      throw invalidResponseError;
    }

    return payload as LoginResponse;
  } catch (error) {
    console.error("Error en loginActions:", error);

    if (error instanceof AxiosError) {
      throw toApiError(error);
    }

    throw error instanceof Error
      ? error
      : new Error("Error desconocido al iniciar sesión");
  }
};
