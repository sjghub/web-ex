"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchMerchants, Merchant } from "@/lib/api/fetchMerchants";
import { fetchMerchantStats } from "@/lib/api/fetchMerchantStats";
import { useDebounce } from "@/lib/debounce";

export default function AdminMerchantsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("모든 상태");
  const [sortOrder, setSortOrder] = useState("최신순");
  const [searchQuery, setSearchQuery] = useState("");
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [merchantCount, setMerchantCount] = useState(0);
  const [activeMerchantCount, setActiveMerchantCount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const itemsPerPage = 5;
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const loadMerchants = async () => {
      try {
        const result = await fetchMerchants(
          currentPage,
          itemsPerPage,
          statusFilter,
          sortOrder,
          debouncedSearchQuery,
        );
        setMerchants(result.content);
        setTotalPages(result.totalPages);
      } catch (e) {
        console.error("가맹점 데이터를 불러오는데 실패했습니다", e);
      }
    };
    loadMerchants();
  }, [currentPage, statusFilter, sortOrder, debouncedSearchQuery]);
  useEffect(() => {
    const loadMerchantsStats = async () => {
      try {
        const result = await fetchMerchantStats();
        setMerchantCount(result.totalMerchantCount);
        setActiveMerchantCount(result.activeMerchantCount);
        setTransactionCount(result.totalTransactionCount);
      } catch (e) {
        console.error("가맹점 데이터를 불러오는데 실패했습니다", e);
      }
    };
    loadMerchantsStats();
  }, []);

  const handleViewMerchantDetail = (merchant: Merchant) => {
    router.push(`/admin/merchants/${merchant.id}`);
  };

  return (
    <div>
      {/* 메인 콘텐츠 */}
      <div>
        {/* 가맹점 관리 콘텐츠 */}
        <main>
          <h1 className="text-3xl font-bold mb-4">가맹점 관리</h1>
          <h2 className="text-gray-600 mb-4">
            등록된 가맹점 목록과 서비스 이용 현황을 확인하세요.
          </h2>
          <div className="mb-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white">
                <CardContent className="px-6">
                  <div className="flex flex-col">
                    <span className="text-base text-gray-500 mb-2">
                      총 가맹점
                    </span>
                    <span className="text-3xl font-bold">
                      {merchantCount.toLocaleString()}개
                    </span>
                    <span className="text-sm text-gray-500 mt-2">
                      전월 대비 +5%
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="px-6">
                  <div className="flex flex-col">
                    <span className="text-base text-gray-500 mb-2">
                      활성 가맹점
                    </span>
                    <span className="text-3xl font-bold">
                      {activeMerchantCount.toLocaleString()}개
                    </span>
                    <span className="text-sm text-gray-500 mt-2">
                      전체의{" "}
                      {Math.round((activeMerchantCount / merchantCount) * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="px-6">
                  <div className="flex flex-col">
                    <span className="text-base text-gray-500 mb-2">
                      평균 거래 건수
                    </span>
                    <span className="text-3xl font-bold">
                      {Math.round(
                        transactionCount / merchantCount,
                      ).toLocaleString()}
                      건
                    </span>
                    <span className="text-sm text-gray-500 mt-2">
                      가맹점당 평균
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 가맹점 목록 */}
            <div className="bg-white rounded-md border shadow-sm">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-medium">가맹점 목록</h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="가맹점 검색..."
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
                        setCurrentPage(1); // 페이지 초기화
                      }}
                    >
                      <SelectTrigger className="w-[140px] cursor-pointer hover:bg-gray-100">
                        <SelectValue placeholder="모든 상태" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem
                          value="모든 상태"
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          모든 상태
                        </SelectItem>
                        <SelectItem
                          value="활성"
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          활성
                        </SelectItem>
                        <SelectItem
                          value="비활성"
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          비활성
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={sortOrder}
                      onValueChange={(v) => {
                        setSortOrder(v);
                        setCurrentPage(1); // 페이지 초기화
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
                          value="이름순"
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          이름순
                        </SelectItem>
                        <SelectItem
                          value="거래건수순"
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          거래건수순
                        </SelectItem>
                        <SelectItem
                          value="금액순"
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          금액순
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => {}} className="bg-black text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    가맹점 추가
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="px-6 py-3 font-medium">가맹점명</th>
                      <th className="px-6 py-3 font-medium">카테고리</th>
                      <th className="px-6 py-3 font-medium">거래 건수</th>
                      <th className="px-6 py-3 font-medium">거래 금액</th>
                      <th className="px-6 py-3 w-[120px] font-medium text-center">
                        상태
                      </th>
                      <th className="px-6 py-3 font-medium text-center">
                        상세
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {merchants.map((merchant) => (
                      <tr
                        key={merchant.id}
                        className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewMerchantDetail(merchant)}
                      >
                        <td className="px-6 py-4">{merchant.name}</td>
                        <td className="px-6 py-4">{merchant.category}</td>
                        <td className="px-6 py-4">
                          {merchant.transactions.toLocaleString()}건
                        </td>
                        <td className="px-6 py-4">
                          {merchant.amount.toLocaleString()}원
                        </td>
                        <td className="px-6 py-4 w-[120px] text-center">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                              merchant.status === "활성"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {merchant.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center flex justify-center items-center">
                          <ChevronRight className="w-8 h-8" />
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
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  다음
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
