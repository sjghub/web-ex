import { fetchWithAuth } from "@/lib/api-fetch";

export interface PaymentHistoryResponse {
  id: number; // 서버에서 paymentId가 아닌 id로 변경됨
  shopName: string; // merchantName -> shopName
  cardName: string; // cardType -> cardName
  transactionAmount: number;
  discountAmount: number;
  applicationBenefit: string;
  createdAt: string; // LocalDateTime이지만 FE에선 string 처리됨
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
  content: PaymentHistoryResponse[];
  totalPages: number;
  totalElements: number;
  pageable: Pageable;
}

export const fetchRecentTransactions = async (
  page = 1,
  size = 5,
): Promise<PaginatedTransactionData> => {
  const response = await fetchWithAuth(
    `/card/my/payment?page=${page}&size=${size}`,
  );

  const data = await response.json();

  if (!data.success) {
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      pageable: { page, size },
    };
  }

  return {
    content: data.response.content,
    totalPages: data.response.totalPages,
    totalElements: data.response.totalElements,
    pageable: data.response.pageable,
  };
};
