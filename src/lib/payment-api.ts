import { AuthApiError } from "@/lib/auth-api";
import { isPaginationMeta } from "@/lib/api-contract";
import {
  buildAuthenticatedQueryString,
  requestAuthenticated,
  withRefreshOnUnauthorized,
} from "@/lib/authenticated-api";
import type {
  AuthenticatedItemResult,
  AuthenticatedListResult,
  InitiatePaymentPayload,
  PaymentRecord,
} from "@/lib/dashboard-contract";
import type { ResolvedPaymentsQuery } from "@/lib/payments-route";

async function getMyPayments(
  query: ResolvedPaymentsQuery,
  signal?: AbortSignal
): Promise<AuthenticatedListResult<PaymentRecord>> {
  try {
    const result = await withRefreshOnUnauthorized(() =>
      requestAuthenticated<PaymentRecord[]>(
        `/payments/my-payments${buildAuthenticatedQueryString(query)}`,
        { signal }
      )
    );

    return {
      data: result.data,
      meta: isPaginationMeta(result.meta) ? result.meta : null,
      errorMessage: null,
      errorStatus: null,
    };
  } catch (error) {
    return {
      data: [],
      meta: null,
      errorMessage:
        error instanceof Error
          ? error.message
          : "Unable to load your payments right now.",
      errorStatus: error instanceof AuthApiError ? error.status : null,
    };
  }
}

async function getPaymentById(
  paymentId: string,
  signal?: AbortSignal
): Promise<AuthenticatedItemResult<PaymentRecord>> {
  try {
    const result = await withRefreshOnUnauthorized(() =>
      requestAuthenticated<PaymentRecord>(`/payments/${paymentId}`, {
        signal,
      })
    );

    return {
      data: result.data,
      errorMessage: null,
      errorStatus: null,
    };
  } catch (error) {
    return {
      data: null,
      errorMessage:
        error instanceof Error
          ? error.message
          : "Unable to load this payment right now.",
      errorStatus: error instanceof AuthApiError ? error.status : null,
    };
  }
}

async function initiatePayment(payload: InitiatePaymentPayload) {
  return withRefreshOnUnauthorized(() =>
    requestAuthenticated<PaymentRecord>("/payments/initiate", {
      method: "POST",
      payload,
    })
  );
}

export { getMyPayments, getPaymentById, initiatePayment };
