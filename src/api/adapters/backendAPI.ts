import httpClient from "../httpClient";
import { CODEPROJEKT_DASHBOARD_BACKEND_ENDPOINTS } from "../constants";
import axios from "axios";

// Small shapes for request/response — adjust to the real API
export type AuthCredentials = { email: string; password: string };
export type AuthResponse = { token?: string; expiresAt?: string; [key: string]: unknown };

export type Item = { id: string; name: string; [key: string]: unknown };

// Transactions API types
export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";
export type TransactionSubStatus = "SUCCESS" | "ERROR" | "TIMEOUT" | string;

export type Transaction = {
  id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  subStatus?: TransactionSubStatus;
  createdAt: string; // ISO date
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type GetTransactionsParams = {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  status?: TransactionStatus | string;
  subStatus?: TransactionSubStatus | string;
  transactionId?: string; // Search by transaction ID
  page?: number;
  limit?: number;
  [key: string]: unknown;
};

// Monthly Analytics API types
export type MonthlyFinancials = {
  _id: string;
  totalSellPriceInINR: number;
  totalCostPriceInSmileCoins: number;
  totalSales: number;
  totalCostPriceInBRR: number;
  totalCostPriceInINR: number;
  netProfitOrLossInINR: number;
};

export type MonthlyUserAnalytics = {
  _id: string;
  totalUsers: number;
};

export type MonthlyAnalyticsData = {
  month: number;
  year: number;
  monthlyAnalytics: {
    monthlyFinancials: MonthlyFinancials;
    monthlyUserAnalytics: MonthlyUserAnalytics;
  };
};

export type GetMonthlyAnalyticsParams = {
  month?: number;
  year?: number;
  [key: string]: unknown;
};

export type SmileCoinsResponse = {
  requestId: string;
  timestamp: string;
  status: number;
  message: string;
  data: string;
};

export const getTransactions = async (
  params: GetTransactionsParams
): Promise<PagedResult<Transaction>> => {
  try {
    const resp = await httpClient.get(CODEPROJEKT_DASHBOARD_BACKEND_ENDPOINTS.TRANSACTIONS, {
      params,
    });
    // The API responds with a wrapper: { requestId, timestamp, status, message, data: { page, limit, total, transactions: [] } }
    const wrapper = resp.data as unknown;
    const inner = (
      wrapper &&
      typeof wrapper === "object" &&
      "data" in (wrapper as Record<string, unknown>)
        ? ((wrapper as Record<string, unknown>)["data"] as Record<
            string,
            unknown
          >)
        : {}
    ) as Record<string, unknown>;
    const page = Number(inner.page ?? params.page ?? 1);
    const limit = Number(inner.limit ?? params.limit ?? 10);
    const total = Number(inner.total ?? 0);
    const rawTx = Array.isArray(inner.transactions as unknown)
      ? (inner.transactions as unknown[])
      : [];

    // Map each raw transaction into our Transaction type
    const items: Transaction[] = rawTx.map((raw) => {
      const t = (raw as Record<string, unknown>) || {};
      const spuDetails = t["spuDetails"] as Record<string, unknown> | undefined;
      const paymentPayload = (
        t["paymentResponse"] as Record<string, unknown> | undefined
      )?.["payload"] as Record<string, unknown> | undefined;

      const amountFromSpu =
        spuDetails && typeof spuDetails["price"] === "number"
          ? (spuDetails["price"] as number)
          : undefined;
      const amountFromPayment =
        paymentPayload && typeof paymentPayload["amount"] === "number"
          ? (paymentPayload["amount"] as number)
          : undefined;

      const computedAmount =
        amountFromSpu ?? (amountFromPayment ? amountFromPayment / 100 : 0);

      const gatewayResponse = t["gatewayResponse"] as
        | Record<string, unknown>
        | undefined;
      const gatewayState = gatewayResponse
        ? (gatewayResponse["state"] as string | undefined)
        : undefined;
      const paymentState = paymentPayload
        ? (paymentPayload["state"] as string | undefined)
        : undefined;

      const statusStr =
        (t["status"] as string | undefined) ??
        gatewayState ??
        paymentState ??
        "UNKNOWN";
      const subStatusStr =
        (t["subStatus"] as string | undefined) ??
        (t["subStatus"] as string | undefined) ??
        paymentState ??
        undefined;

      return {
        id:
          (t["_id"] as string) ??
          (t["transactionId"] as string) ??
          String(Math.random()),
        amount: computedAmount as number,
        currency: "INR",
        status: statusStr as TransactionStatus,
        subStatus: subStatusStr as TransactionSubStatus | undefined,
        createdAt: (t["createdAt"] as string) ?? new Date().toISOString(),
        metadata: {
          transactionId: t["transactionId"],
          spuId: t["spuId"],
          spuDetails,
          userDetails: t["userDetails"],
          playerDetails: t["playerDetails"],
          gatewayResponse,
          paymentResponse: t["paymentResponse"],
          vendorResponse: t["vendorResponse"],
          raw: t,
        },
      } as Transaction;
    });

    return {
      items,
      total,
      page,
      limit,
    };
  } catch (err: unknown) {
    throw formatHttpError(err);
  }
};

export const login = async (
  credentials: AuthCredentials
): Promise<AuthResponse> => {
  try {
    const resp = await httpClient.post(
      CODEPROJEKT_DASHBOARD_BACKEND_ENDPOINTS.LOGIN,
      credentials
    );
    const data = resp?.data as Record<string, unknown> | undefined;
    const inner = (data && typeof data === "object" && "data" in data
      ? (data["data"] as Record<string, unknown>)
      : data) as Record<string, unknown> | undefined;
    return (inner ?? {}) as AuthResponse;
  } catch (err: unknown) {
    throw formatHttpError(err);
  }
};

export const getMonthlyAnalytics = async (
  params?: GetMonthlyAnalyticsParams
): Promise<MonthlyAnalyticsData> => {
  try {
    const resp = await httpClient.get(
      CODEPROJEKT_DASHBOARD_BACKEND_ENDPOINTS.MONTHLY_ANALYTICS,
      {
        params,
      }
    );
    // The API responds with a wrapper: { requestId, timestamp, status, message, data: MonthlyAnalyticsData }
    const wrapper = resp.data as unknown;
    const inner = (
      wrapper &&
      typeof wrapper === "object" &&
      "data" in (wrapper as Record<string, unknown>)
        ? ((wrapper as Record<string, unknown>)["data"] as Record<
            string,
            unknown
          >)
        : {}
    ) as Record<string, unknown>;

    const month = Number(inner.month ?? new Date().getMonth() + 1);
    const year = Number(inner.year ?? new Date().getFullYear());
    const monthlyAnalytics = (inner.monthlyAnalytics ??
      {}) as Record<string, unknown>;

    return {
      month,
      year,
      monthlyAnalytics: {
        monthlyFinancials: (monthlyAnalytics.monthlyFinancials ??
          {}) as MonthlyFinancials,
        monthlyUserAnalytics: (monthlyAnalytics.monthlyUserAnalytics ??
          {}) as MonthlyUserAnalytics,
      },
    } as MonthlyAnalyticsData;
  } catch (err: unknown) {
    throw formatHttpError(err);
  }
};

// Helper to normalize errors for consumers
const formatHttpError = (error: unknown) => {
  const errObj = error as Record<string, unknown> & {
    message?: string;
    response?: { status?: number; data?: unknown };
  };

  const normalized = {
    message: errObj?.message ?? "Unknown error",
    status: errObj?.response?.status,
    data: errObj?.response?.data,
  };
  return normalized;
};

export const getSmileCoins = async (): Promise<number> => {
  try {
    const resp = await axios.get<SmileCoinsResponse>(
      "https://api-zg.codeprojekt.shop/v1/product/smileCoins"
    );
    return parseFloat(resp.data.data);
  } catch (err: unknown) {
    throw formatHttpError(err);
  }
};

// Users API types
export type User = {
  id: string;
  name: string;
  email?: string;
  [key: string]: unknown;
};

export type GetUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
};

export const getUsers = async (
  params: GetUsersParams
): Promise<PagedResult<User>> => {
  try {
    const resp = await httpClient.get(CODEPROJEKT_DASHBOARD_BACKEND_ENDPOINTS.USERS, {
      params,
    });
    const wrapper = resp.data as unknown;
    // API responds with wrapper { ..., data: { page, limit, total, data: [] } }
    const inner =
      wrapper && typeof wrapper === "object" && "data" in (wrapper as Record<string, unknown>)
        ? ((wrapper as Record<string, unknown>)["data"] as Record<string, unknown>)
        : (wrapper as Record<string, unknown>) ?? {};

    const page = Number((inner as Record<string, unknown>).page ?? params.page ?? 1);
    const limit = Number((inner as Record<string, unknown>).limit ?? params.limit ?? 20);
    const total = Number((inner as Record<string, unknown>).total ?? 0);

    // Prefer `data` array, fallback to `users`
    const rawUsers = Array.isArray((inner as Record<string, unknown>).data as unknown)
      ? (((inner as Record<string, unknown>).data as unknown[]) ?? [])
      : Array.isArray((inner as Record<string, unknown>).users as unknown)
      ? (((inner as Record<string, unknown>).users as unknown[]) ?? [])
      : [];

    const items: User[] = rawUsers.map((raw) => {
      const u = (raw as Record<string, unknown>) || {};
      return {
        id: (u["id"] as string) ?? (u["_id"] as string) ?? String(Math.random()),
        name:
          (u["name"] as string) ??
          ((u["profile"] as Record<string, unknown> | undefined)?.["name"] as string) ??
          "Unknown",
        email:
          (u["email"] as string) ??
          ((u["profile"] as Record<string, unknown> | undefined)?.["email"] as string) ??
          undefined,
        ...u,
      };
    });

    return {
      items,
      total,
      page,
      limit,
    };
  } catch (err: unknown) {
    throw formatHttpError(err);
  }
};

export default {
  getTransactions,
  login,
  getMonthlyAnalytics,
  getSmileCoins,
  getUsers,
};
