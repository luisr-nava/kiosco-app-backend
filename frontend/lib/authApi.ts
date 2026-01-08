"use client";

import axios from "axios";
import Cookies from "js-cookie";

const AUTH_API_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3001/api/v1";

export const authApi = axios.create({
  baseURL: AUTH_API_BASE_URL,
});

authApi.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
