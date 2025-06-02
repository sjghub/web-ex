// api/fetchMerchants.ts

import { fetchWithAuth } from "@/lib/api-fetch";

export interface MerchantApiResponse {
  id: number;
  merchantName: string;
  category: string;
  transactionCount: number;
  transactionAmount: number;
  status: boolean;
}

export interface Merchant {
  id: number;
  name: string;
  category: string;
  transactions: number;
  amount: number;
  status: "활성" | "비활성";
}
export interface Pageable {
  page: number;
  size: number;
}
export interface PaginatedMerchantData {
  content: Merchant[];
  totalPages: number;
  totalElements: number;
  pageable: Pageable;
}

export const fetchMerchants = async (
  page = 1,
  size = 5,
  statusFilter = "모든 상태",
  sortOrder = "최신순",
  searchQuery = "",
): Promise<PaginatedMerchantData> => {
  const response = await fetchWithAuth(
    `/admin/merchants?page=${page}&size=${size}&status=${statusFilter}&sort=${sortOrder}&search=${searchQuery}`,
  );
  const data = await response.json();
  if (!data.success) {
    // 에러처리해야됌
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      pageable: { page: page, size: size },
    };
  }

  const content: Merchant[] = data.response.content.map(
    (m: MerchantApiResponse) => ({
      id: m.id,
      name: m.merchantName,
      category: m.category,
      transactions: m.transactionCount,
      amount: m.transactionAmount,
      status: m.status ? "활성" : "비활성",
    }),
  );
  return {
    content,
    totalPages: data.response.totalPages,
    totalElements: data.response.totalElements,
    pageable: data.response.pageable,
  };
};
