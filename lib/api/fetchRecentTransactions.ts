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

export type SortOptionType = "recent" | "oldest" | "amount-high" | "amount-low";
export type DateRangeType = "all" | "1week" | "1month" | "3months" | "custom";

export const fetchRecentTransactions = async (
  page = 1,
  size = 10,
  sortOption: SortOptionType = "recent",
  dateRange: DateRangeType = "all",
  startDate?: string,
  endDate?: string,
): Promise<PaginatedTransactionData> => {
  const sortParam =
    sortOption === "recent"
      ? "createdAt,desc"
      : sortOption === "oldest"
        ? "createdAt,asc"
        : sortOption === "amount-high"
          ? "amount,desc"
          : "amount,asc";

  let dateParam = "";
  if (dateRange === "1week") {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    dateParam = `&startDate=${oneWeekAgo.toISOString()}`;
  } else if (dateRange === "1month") {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    dateParam = `&startDate=${oneMonthAgo.toISOString()}`;
  } else if (dateRange === "3months") {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    dateParam = `&startDate=${threeMonthsAgo.toISOString()}`;
  } else if (dateRange === "custom" && startDate && endDate) {
    const formattedStart = new Date(startDate).toISOString();
    const formattedEnd = new Date(`${endDate}T23:59:59.999`).toISOString();
    dateParam = `&startDate=${formattedStart}&endDate=${formattedEnd}`;
  }

  const response = await fetchWithAuth(
    `/card/my/payment?page=${page}&size=${size}&sort=${sortParam}${dateParam}`,
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
