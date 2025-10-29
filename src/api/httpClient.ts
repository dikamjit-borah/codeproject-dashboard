import axios from "axios";
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { CODEPROJEKT_DASHBOARD_BACKEND } from "./constants";

const createHttpClient = (
  baseURL = CODEPROJEKT_DASHBOARD_BACKEND.BASE_URL
): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: CODEPROJEKT_DASHBOARD_BACKEND.TIMEOUT,
    headers: CODEPROJEKT_DASHBOARD_BACKEND.DEFAULT_HEADERS,
  });

  // Request interceptor: log outgoing requests
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      try {
  const cfg = (config as unknown) as Record<string, unknown> | undefined;
  const { method, url, headers, params, data } = cfg ?? ({} as Record<string, unknown>);
        // Keep logs concise in production by trimming body / sensitive data
        console.log("[http] Request:", { method, url, params, data, headers });
      } catch (e) {
        console.warn("[http] Request logging failed", e);
      }
      return config;
    },
    (error: unknown) => {
      console.error("[http] Request error:", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor: log responses
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      try {
        const { status, config, data } = response;
        console.log("[http] Response:", { status, url: config.url, data });
      } catch (e) {
        console.warn("[http] Response logging failed", e);
      }
      return response;
    },
    (error: unknown) => {
      try {
        // Attempt to extract common fields safely
        const errObj = error as Record<string, unknown> & {
          message?: string;
          config?: unknown;
          response?: { status?: number; data?: unknown } | unknown;
        };

        const resp = errObj.response as Record<string, unknown> | undefined;
        console.error("[http] Response error:", {
          message: errObj.message,
          config: errObj.config,
          status: typeof resp?.status === "number" ? (resp?.status as number) : undefined,
          data: resp?.data,
        });
      } catch (e) {
        console.warn("[http] Response error logging failed", e);
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Default exported client instance
export const httpClient = createHttpClient();

export default httpClient;
