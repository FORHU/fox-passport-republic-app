import api from "@/shared/lib/axios";
import type { Id } from "@/shared/lib/api-types";
import type { InvoiceStatusResponse } from "@/shared/types/payment";

export async function getInvoiceStatus(id: Id): Promise<InvoiceStatusResponse> {
  const resp = await api.get(`/invoices/${id}`);
  return resp.data;
}
