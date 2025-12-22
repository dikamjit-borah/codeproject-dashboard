// Constants for external service API

// Vite exposes env vars on import.meta.env and requires the `VITE_` prefix for client-side code.
export const CODEPROJEKT_DASHBOARD_BACKEND = {
  BASE_URL:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((import.meta as any)?.env
      ?.VITE_CODEPROJEKT_DASHBOARD_BACKEND_BASE_URL as string) ||
    "https://codeprojekt-dashboard-backend.onrender.com",
  TIMEOUT: 15000, // ms
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export const CODEPROJEKT_DASHBOARD_BACKEND_ENDPOINTS = {
  LOGIN: "/auth/login",
  TRANSACTIONS: "/v1/dashboard/transactions",
};
