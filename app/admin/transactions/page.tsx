"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchMerchantTransactions,
  Transaction,
} from "@/lib/api/fetchMerchantTransactions";
import {
  fetchMerchantPaymentStats,
  MerchantPaymentStats,
} from "@/lib/api/fetchMerchantPaymentStats";
import { useDebounce } from "@/lib/debounce";

export default function AdminTransactionsPage() {
  const [statusFilter, setStatusFilter] = useState("모든 상태");
  const [sortOrder, setSortOrder] = useState("최신순");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showTransactionDetailDialog, setShowTransactionDetailDialog] =
    useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [merchantStats, setMerchantStats] =
    useState<MerchantPaymentStats | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await fetchMerchantPaymentStats();
        setMerchantStats(stats);
      } catch (error) {
        console.error("통계 정보 불러오기 실패:", error);
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const result = await fetchMerchantTransactions(
          currentPage,
          itemsPerPage,
          statusFilter,
          sortOrder,
          debouncedSearchQuery,
        );
        setTransactions(result.content);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error("거래 내역 불러오기 실패:", error);
      }
    };

    loadTransactions();
  }, [currentPage, statusFilter, sortOrder, debouncedSearchQuery]);

  // 거래 상세 정보 보기
  const handleViewTransactionDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetailDialog(true);
  };

  // 금액 포맷팅 함수
  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + "원";
  };

  return (
    <div>
      {/* 메인 콘텐츠 */}
      <div>
        {/* 거래 내역 콘텐츠 */}
        <main>
          <h1 className="text-3xl font-bold mb-4">거래 내역</h1>
          <h2 className="text-gray-600 mb-4">
            모든 가맹점의 거래 내역을 확인하세요.
          </h2>
          <div className="mb-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white">
                <CardContent className="px-6">
                  <div className="flex flex-col">
                    <span className="text-base text-gray-500 mb-2">
                      총 거래 건수
                    </span>
                    <span className="text-3xl font-bold">
                      {merchantStats?.totalTransactionCount.toLocaleString() ??
                        "-"}
                      건
                    </span>
                    <span className="text-sm text-gray-500 mt-2">
                      전일 대비{" "}
                      {merchantStats
                        ? `${merchantStats.transactionCountChangeRate}%`
                        : "-"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="px-6">
                  <div className="flex flex-col">
                    <span className="text-base text-gray-500 mb-2">
                      총 거래 금액
                    </span>
                    <span className="text-3xl font-bold">
                      {merchantStats
                        ? formatAmount(merchantStats.totalTransactionAmount)
                        : "-"}
                    </span>
                    <span className="text-sm text-gray-500 mt-2">
                      전일 대비{" "}
                      {merchantStats
                        ? `${merchantStats.transactionAmountChangeRate}%`
                        : "-"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="px-6">
                  <div className="flex flex-col">
                    <span className="text-base text-gray-500 mb-2">
                      평균 거래 금액
                    </span>
                    <span className="text-3xl font-bold">
                      {merchantStats
                        ? formatAmount(merchantStats.averageTransactionAmount)
                        : "-"}
                    </span>
                    <span className="text-sm text-gray-500 mt-2">
                      전일 대비{" "}
                      {merchantStats
                        ? `${merchantStats.averageAmountChangeRate}%`
                        : "-"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="px-6">
                  <div className="flex flex-col">
                    <span className="text-base text-gray-500 mb-2">
                      활성 거래 비율
                    </span>
                    <span className="text-3xl font-bold">
                      {merchantStats
                        ? `${merchantStats.activeTransactionRate}%`
                        : "-"}
                    </span>
                    <span className="text-sm text-gray-500 mt-2">
                      {/* 전일 대비 동일 */}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 거래 내역 목록 */}
            <div className="bg-white rounded-md border shadow-sm">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-medium">거래 내역 목록</h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="거래 검색..."
                      className="pl-10 w-64"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={(v) => {
                        setStatusFilter(v);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[140px] cursor-pointer hover:bg-gray-100">
                        <SelectValue placeholder="상태 필터" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem
                          value="모든 상태"
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          모든 상태
                        </SelectItem>
                        <SelectItem
                          value="승인"
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          승인
                        </SelectItem>
                        <SelectItem
                          value="취소"
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          취소
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={sortOrder}
                      onValueChange={(v) => {
                        setSortOrder(v);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[140px] cursor-pointer hover:bg-gray-100">
                        <SelectValue placeholder="정렬 방식" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem
                          value="최신순"
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          최신순
                        </SelectItem>
                        <SelectItem
                          value="오래된순"
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          오래된순
                        </SelectItem>
                        <SelectItem
                          value="금액높은순"
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          금액높은순
                        </SelectItem>
                        <SelectItem
                          value="금액낮은순"
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          금액낮은순
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="px-6 py-3 font-medium w-[15%]">거래 ID</th>
                      <th className="px-6 py-3 font-medium w-[12%]">
                        가맹점명
                      </th>
                      <th className="px-6 py-3 font-medium w-[15%]">
                        카테고리
                      </th>
                      <th className="px-6 py-3 font-medium w-[12%]">금액</th>
                      <th className="px-6 py-3 font-medium w-[12%]">
                        결제수단
                      </th>
                      <th className="px-6 py-3 font-medium w-[18%]">
                        날짜/시간
                      </th>
                      <th className="px-6 py-3 font-medium text-center w-[10%]">
                        상태
                      </th>
                      <th className="px-6 py-3 font-medium text-center w-[8%]">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">{transaction.id}</td>
                        <td className="px-6 py-4">
                          {transaction.merchantName}
                        </td>
                        <td className="px-6 py-4">{transaction.category}</td>
                        <td className="px-6 py-4">
                          {formatAmount(transaction.amount)}
                        </td>
                        <td className="px-6 py-4">
                          {transaction.paymentMethod}
                        </td>
                        <td className="px-6 py-4">{transaction.dateTime}</td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                              transaction.status === "승인"
                                ? "bg-green-100 text-green-800"
                                : transaction.status === "취소"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100 cursor-pointer"
                              >
                                <span className="sr-only">메뉴 열기</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-white"
                            >
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewTransactionDetail(transaction)
                                }
                                className="hover:bg-gray-100 cursor-pointer"
                              >
                                상세 정보
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">
                                영수증 보기
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              <div className="p-4 flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  이전
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant="ghost"
                      size="sm"
                      className={
                        page === currentPage ? "bg-black text-white" : ""
                      }
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ),
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  다음
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 거래 상세 정보 다이얼로그 */}
      <Dialog
        open={showTransactionDetailDialog}
        onOpenChange={setShowTransactionDetailDialog}
      >
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>거래 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">거래 ID</p>
                  <p className="font-medium">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">가맹점명</p>
                  <p className="font-medium">
                    {selectedTransaction.merchantName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">카테고리</p>
                  <p className="font-medium">{selectedTransaction.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">금액</p>
                  <p className="font-medium">
                    {formatAmount(selectedTransaction.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">결제수단</p>
                  <p className="font-medium">
                    {selectedTransaction.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">날짜/시간</p>
                  <p className="font-medium">{selectedTransaction.dateTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">상태</p>
                  <p className="font-medium">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        selectedTransaction.status === "승인"
                          ? "bg-green-100 text-green-800"
                          : selectedTransaction.status === "취소"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {selectedTransaction.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">승인번호</p>
                  <p className="font-medium">
                    {Math.floor(Math.random() * 1000000)
                      .toString()
                      .padStart(6, "0")}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowTransactionDetailDialog(false)}
                  className="text-red-500"
                >
                  닫기
                </Button>
                <Button variant="ghost">영수증 보기</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
