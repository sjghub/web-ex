"use client";

import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
import { CreditCard, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { HeaderNavBar } from "@/components/header-nav-bar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  fetchRecentTransactions,
  PaymentHistoryResponse,
} from "@/lib/api/fetchRecentTransactions";

export default function TransactionsPage() {
  // const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<PaymentHistoryResponse | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  type DateRangeType = "all" | "1week" | "1month" | "3months" | "custom";
  const [dateRange, setDateRange] = useState<DateRangeType>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [cardFilter, setCardFilter] = useState<string>("all");
  type SortOptionType = "recent" | "oldest" | "amount-high" | "amount-low";
  const [sortOption, setSortOption] = useState<SortOptionType>("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [transactions, setTransactions] = useState<PaymentHistoryResponse[]>(
    [],
  );

  const itemsPerPage = 5;

  // 카드 목록 (필터용)
  const cards = [
    { id: "all", name: "전체 카드" },
    { id: "hyundaiblack", name: "현대카드 M Black" },
    { id: "everydiscount", name: "카드의정석 EVERY DISCOUNT" },
    { id: "taptap0", name: "삼성카드 taptap 0" },
    { id: "ohacheck", name: "카드의정석 오하CHECK" },
    { id: "mywish", name: "KB국민 My WE:SH 카드" },
  ];

  // const filteredTransactions = transactions.filter((transaction) => {
  //   const matchesSearch =
  //     transaction.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     transaction.cardName.toLowerCase().includes(searchQuery.toLowerCase());

  //   const matchesCard =
  //     cardFilter === "all" || transaction.cardName.includes(cardFilter);

  //   let matchesDate = true;
  //   const transactionDate = new Date(transaction.createdAt);
  //   const now = new Date();

  //   if (dateRange === "1week") {
  //     const oneWeekAgo = new Date();
  //     oneWeekAgo.setDate(now.getDate() - 7);
  //     matchesDate = transactionDate >= oneWeekAgo;
  //   } else if (dateRange === "1month") {
  //     const oneMonthAgo = new Date();
  //     oneMonthAgo.setMonth(now.getMonth() - 1);
  //     matchesDate = transactionDate >= oneMonthAgo;
  //   } else if (dateRange === "3months") {
  //     const threeMonthsAgo = new Date();
  //     threeMonthsAgo.setMonth(now.getMonth() - 3);
  //     matchesDate = transactionDate >= threeMonthsAgo;
  //   }

  //   return matchesSearch && matchesCard && matchesDate;
  // });

  // const sortedTransactions = [...filteredTransactions].sort((a, b) => {
  //   if (sortOption === "recent") {
  //     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  //   } else if (sortOption === "oldest") {
  //     return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  //   } else if (sortOption === "amount-high") {
  //     return (
  //       Number.parseInt(b.transactionAmount.toString.replace(/,/g, "")) -
  //       Number.parseInt(a.transactionAmount.toString.replace(/,/g, ""))
  //     );
  //   } else if (sortOption === "amount-low") {
  //     return (
  //       Number.parseInt(a.transactionAmount.toString.replace(/,/g, "")) -
  //       Number.parseInt(b.transactionAmount.toString.replace(/,/g, ""))
  //     );
  //   }
  //   return 0;
  // });

  const handleViewTransactionDetail = (transaction: PaymentHistoryResponse) => {
    setSelectedTransaction(transaction);
    setShowDetailDialog(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const result = await fetchRecentTransactions(currentPage, itemsPerPage);
        setTransactions(result.content);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error("결제 내역 로드 실패:", error);
      }
    };

    loadTransactions();
  }, [currentPage]);

  return (
    <div className="min-h-screen">
      <HeaderNavBar />
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">결제 내역</h1>
          <p className="text-gray-500 mb-6">
            모든 결제 내역을 확인하고 관리할 수 있습니다.
          </p>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="결제처 또는 카드 검색"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex items-center gap-3">
              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Filter className="h-4 w-4" />
                    필터
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-white" align="end">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">기간</h3>
                      <Select
                        value={dateRange}
                        onValueChange={(value: DateRangeType) => {
                          setDateRange(value);
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="기간 선택" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem
                            value="all"
                            className="hover:bg-gray-100 cursor-pointer"
                          >
                            전체 기간
                          </SelectItem>
                          <SelectItem
                            value="1week"
                            className="hover:bg-gray-100 cursor-pointer"
                          >
                            최근 1주일
                          </SelectItem>
                          <SelectItem
                            value="1month"
                            className="hover:bg-gray-100 cursor-pointer"
                          >
                            최근 1개월
                          </SelectItem>
                          <SelectItem
                            value="3months"
                            className="hover:bg-gray-100 cursor-pointer"
                          >
                            최근 3개월
                          </SelectItem>
                          <SelectItem
                            value="custom"
                            className="hover:bg-gray-100 cursor-pointer"
                          >
                            직접 설정
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {dateRange === "custom" && (
                      <div className="flex flex-col gap-2">
                        <Label className="text-sm text-gray-700">시작일</Label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                        <Label className="text-sm text-gray-700">종료일</Label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-medium mb-2">카드</h3>
                      <Select
                        value={cardFilter}
                        onValueChange={(value: string) => {
                          setCardFilter(value);
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="카드 선택" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {cards.map((card) => (
                            <SelectItem
                              key={card.id}
                              value={card.id}
                              className="hover:bg-gray-100 cursor-pointer"
                            >
                              {card.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDateRange("all");
                          setCardFilter("all");
                          setStartDate("");
                          setEndDate("");
                          setCurrentPage(1);
                        }}
                      >
                        초기화
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilterOpen(false)}
                      >
                        적용
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Select
                value={sortOption}
                onValueChange={(value: SortOptionType) => {
                  setSortOption(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[140px] cursor-pointer hover:bg-gray-100">
                  <SelectValue placeholder="정렬 방식" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem
                    value="recent"
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    최신순
                  </SelectItem>
                  <SelectItem
                    value="oldest"
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    오래된순
                  </SelectItem>
                  <SelectItem
                    value="amount-high"
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    금액 높은순
                  </SelectItem>
                  <SelectItem
                    value="amount-low"
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    금액 낮은순
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {totalPages > 0 ? (
            <Card className="py-0">
              <CardContent className="p-0">
                <div className="divide-y">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewTransactionDetail(transaction)}
                    >
                      <div>
                        <p className="font-medium">{transaction.shopName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleString(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            },
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {transaction.transactionAmount}원
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.cardName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                결제 내역이 없습니다
              </h3>
              <p className="text-gray-500">
                검색 조건을 변경하거나 다른 기간을 선택해보세요.
              </p>
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="cursor-pointer"
                >
                  이전
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`cursor-pointer ${
                        currentPage === page ? "bg-black text-white" : ""
                      }`}
                    >
                      {page}
                    </Button>
                  ),
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="cursor-pointer"
                >
                  다음
                </Button>
              </div>
            </div>
          )}

          {/* 상세 다이얼로그 그대로 유지 */}
          <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
            <DialogContent className="sm:max-w-md bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl">결제 상세 정보</DialogTitle>
              </DialogHeader>
              {selectedTransaction && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">
                        {selectedTransaction.shopName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(selectedTransaction.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {selectedTransaction.transactionAmount}원
                      </p>
                      <p className="text-xs text-green-600">
                        {selectedTransaction.applicationBenefit}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500">결제 카드</p>
                    <p className="font-medium">
                      {selectedTransaction.cardName}
                    </p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    {/* 카테고리 - 추후에 API에 카테고리 추가 후 연결하기 */}
                    {/* <div>
                      <p className="text-sm text-gray-500">카테고리</p>
                      <p className="font-medium">
                        {selectedTransaction.category}
                      </p>
                    </div> */}
                    <div>
                      <p className="text-sm text-gray-500">결제 방식</p>
                      <p className="font-medium">일시불</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">승인 번호</p>
                      <p className="font-medium">{selectedTransaction.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">상태</p>
                      <p className="font-medium text-green-600">승인 완료</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetailDialog(false)}
                    >
                      닫기
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
