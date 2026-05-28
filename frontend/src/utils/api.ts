import axios, { type AxiosError } from "axios";
import type { ApiResponse } from "../types";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

const toApiError = (error: unknown): Error => {
  const axiosError = error as AxiosError<{ message?: string }>;
  if (axiosError.response?.data?.message) {
    return new Error(axiosError.response.data.message);
  }
  if (axiosError.code === "ERR_NETWORK" || axiosError.message === "Network Error") {
    return new Error(`Cannot reach backend API at ${API_URL}. Start backend with "cd backend && npm run dev" and make sure MongoDB is running.`);
  }
  return new Error(axiosError.message ?? "Request failed");
};

export const setAuthToken = (token?: string): void => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const apiData = async <T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> => {
  try {
    const response = await request;
    return response.data.data;
  } catch (error) {
    throw toApiError(error);
  }
};

export const uploadFiles = async (files: File[], folder: string): Promise<string[]> => {
  const data = new FormData();
  files.forEach((file) => data.append("files", file));
  data.append("folder", folder);
  try {
    const response = await api.post<ApiResponse<{ urls: string[] }>>("/uploads/multiple", data);
    return response.data.data.urls;
  } catch (error) {
    throw toApiError(error);
  }
};

export const uploadFile = async (file: File, folder: string): Promise<string> => {
  const data = new FormData();
  data.append("file", file);
  data.append("folder", folder);
  try {
    const response = await api.post<ApiResponse<{ url: string }>>("/uploads/single", data);
    return response.data.data.url;
  } catch (error) {
    throw toApiError(error);
  }
};
