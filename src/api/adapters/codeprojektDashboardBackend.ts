import httpClient from "../httpClient";
import { CODEPROJEKT_DASHBOARD_BACKEND_ENDPOINTS } from "../constants";

// Small shapes for request/response — adjust to the real API
export type AuthCredentials = { username: string; password: string };
export type AuthResponse = { token: string; expiresAt?: string };

export type Item = { id: string; name: string; [key: string]: unknown };

// Transactions API types
export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";
export type TransactionSubstatus = "SUCCESS" | "ERROR" | "TIMEOUT" | string;

export type Transaction = {
  id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  substatus?: TransactionSubstatus;
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
  substatus?: TransactionSubstatus | string;
  page?: number;
  limit?: number;
  [key: string]: unknown;
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
      const substatusStr =
        (t["subStatus"] as string | undefined) ??
        (t["substatus"] as string | undefined) ??
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
        substatus: substatusStr as TransactionSubstatus | undefined,
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

export default {
  getTransactions,
};
