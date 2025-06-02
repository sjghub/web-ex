// api/fetchTransactions.ts

import { fetchWithAuth } from "@/lib/api-fetch";

export interface TransactionApiResponse {
  paymentId: number;
  merchantName: string;
  cardType: string;
  category: string;
  createdAt: string;
  transactionAmount: number;
  status: boolean;
}

export interface Transaction {
  id: string;
  merchantName: string;
  category: string;
  amount: number;
  paymentMethod: string;
  dateTime: string;
  status: "승인" | "취소";
}

export interface Pageable {
  page: number;
  size: number;
}

export interface PaginatedTransactionData {
  content: Transaction[];
  totalPages: number;
  totalElements: number;
  pageable: Pageable;
}

export const fetchMerchantTransactions = async (
  page = 1,
  size = 5,
  statusFilter = "모든 상태",
  sortOrder = "최신순",
  searchQuery = "",
): Promise<PaginatedTransactionData> => {
  const response = await fetchWithAuth(
    `/admin/merchants/payments?page=${page}&size=${size}&status=${statusFilter}&sort=${sortOrder}&search=${searchQuery}`,
  );

  const data = await response.json();

  if (!data.success) {
    // 에러 처리
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      pageable: { page, size },
    };
  }

  const content: Transaction[] = data.response.content.map(
    (t: TransactionApiResponse) => ({
      id: `TRX-${t.paymentId.toString().padStart(6, "0")}`,
      merchantName: t.merchantName,
      category: t.category,
      amount: t.transactionAmount,
      paymentMethod: t.cardType,
      dateTime: new Date(t.createdAt).toLocaleString("sv-SE").replace("T", " "),
      status: t.status ? "승인" : "취소",
    }),
  );

  return {
    content,
    totalPages: data.response.totalPages,
    totalElements: data.response.totalElements,
    pageable: data.response.pageable,
  };
};
