// Constants for external service API

// Vite exposes env vars on import.meta.env and requires the `VITE_` prefix for client-side code.
export const CODEPROJEKT_DASHBOARD_BACKEND = {
  BASE_URL:
    import.meta.env.VITE_CODEPROJEKT_DASHBOARD_BACKEND_BASE_URL ||
    "https://codeprojekt-dashboard-backend-h690.onrender.com",
  TIMEOUT: 15000, // ms
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export const CODEPROJEKT_DASHBOARD_BACKEND_ENDPOINTS = {
  LOGIN: "/auth/login",
  TRANSACTIONS: "/v1/dashboard/transactions",
  MONTHLY_ANALYTICS: "/v1/dashboard/monthly-analytics",
  USERS: "/v1/dashboard/users",
};
