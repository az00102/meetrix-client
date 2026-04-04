import { PaymentReturnPage } from "@/components/dashboard/payment-return-page";
import { getServerPaymentById } from "@/lib/server-dashboard-api";

type PaymentReturnSearchParams = Promise<{
  paymentId?: string | string[];
  status?: string | string[];
}>;

export default async function DashboardPaymentReturnRoute({
  searchParams,
}: {
  searchParams: PaymentReturnSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const paymentId = getFirstValue(resolvedSearchParams.paymentId);
  const initialGatewayStatus = getFirstValue(resolvedSearchParams.status);
  const initialPaymentResult = paymentId
    ? await getServerPaymentById(paymentId)
    : {
        data: null,
        errorMessage: "Invalid payment return.",
        errorStatus: 400,
      };

  return (
    <PaymentReturnPage
      paymentId={paymentId}
      initialGatewayStatus={initialGatewayStatus}
      initialPaymentResult={initialPaymentResult}
    />
  );
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
