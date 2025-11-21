"use client";

import axios from "axios";
import Cookies from "js-cookie";

const kioscoApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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
    if (error.response?.status === 401) {
      Cookies.remove("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export { kioscoApi };

