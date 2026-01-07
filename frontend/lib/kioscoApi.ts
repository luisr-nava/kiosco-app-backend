"use client";

import axios from "axios";
import Cookies from "js-cookie";

const kioscoApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_KIOSCO_API_URL || process.env.NEXT_PUBLIC_API_URL,
});

kioscoApi.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

kioscoApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    // Evitar recargar la vista en endpoints de autenticación (ej. login)
    const isAuthEndpoint = requestUrl.includes("/auth/login");

    if (status === 401 && !isAuthEndpoint) {
      Cookies.remove("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export { kioscoApi };
