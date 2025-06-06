// app/admin/merchants/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchWithAuth } from "@/lib/api-fetch";
import {
  fetchSingleMerchantTransactions,
  Transaction,
} from "@/lib/api/fetchSingleMerchantTransactions";

interface MerchantResponse {
  merchantName: string;
  category: string;
  businessNumber: string;
  managerName: string;
  managerPhone: string;
  businessPhone: string;
}

interface MerchantDetail {
  id: number;
  name: string;
  category: string;
  status: boolean;
  totalTransactions: number;
  totalAmount: string;
  averageAmount: string;
  commissionRate: string;
  recent24hTransactionCount: number;
  percentChange: number;

  merchantName: string;
  businessNumber: string;
  managerName: string;
  managerPhone: string;
  businessPhone: string;
}

interface MerchantStatsResponse {
  transactionCount: number;
  totalTransactionAmount: number;
  averageTransactionAmount: number;
  commissionRate: string;
  recent24hTransactionCount: number;
  percentChange: number;
  status: boolean;
}

export default function MerchantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stats, setStats] = useState<MerchantStatsResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionTotalPages, setTransactionTotalPages] = useState(1);
  const itemsPerPage = 5;

  const fetchMerchantDetail = async (id: string): Promise<MerchantResponse> => {
    const response = await fetchWithAuth(`/admin/merchants/${id}`);
    const data = await response.json();
    return data.response;
  };

  const fetchMerchantStats = async (
    id: string,
  ): Promise<MerchantStatsResponse> => {
    const response = await fetchWithAuth(`/admin/merchants/${id}/stats`);
    const data = await response.json();
    return data.response;
  };

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await fetchSingleMerchantTransactions(
          id,
          transactionPage,
          itemsPerPage,
        );
        setTransactions(data.content);
        setTransactionTotalPages(data.totalPages);
      } catch (error) {
        console.error("거래 내역 로딩 실패:", error);
      }
    };

    loadTransactions();
  }, [id, transactionPage]);

  useEffect(() => {
    const loadMerchant = async () => {
      try {
        const [merchantData, statsData] = await Promise.all([
          fetchMerchantDetail(id),
          fetchMerchantStats(id),
        ]);

        const newMerchant: MerchantDetail = {
          id: parseInt(id),
          name: merchantData.merchantName,
          merchantName: merchantData.merchantName,
          category: merchantData.category,
          businessNumber: merchantData.businessNumber,
          managerName: merchantData.managerName,
          managerPhone: merchantData.managerPhone,
          businessPhone: merchantData.businessPhone,
          status: statsData.status,

          totalTransactions: statsData.transactionCount,
          totalAmount: `${statsData.totalTransactionAmount.toLocaleString()}원`,
          averageAmount: `${statsData.averageTransactionAmount.toLocaleString()}원`,
          commissionRate: statsData.commissionRate,
          recent24hTransactionCount: statsData.recent24hTransactionCount,
          percentChange: statsData.percentChange,
        };

        setMerchant(newMerchant);
        setStats(statsData);
        setIsActive(statsData.status === true);
      } catch (err) {
        console.error(err);
      }
    };

    loadMerchant();
  }, [id]);

  const handleStatusChange = async (checked: boolean) => {
    setIsActive(checked);

    try {
      const response = await fetchWithAuth(`/admin/merchants/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: checked }),
      });

      if (!response.ok) {
        throw new Error("상태 변경 실패");
      }
    } catch (error) {
      console.error("상태 변경 에러:", error);
      setIsActive(!checked); // 실패 시 롤백
    }
  };

  const handleDeleteMerchant = () => {
    setShowDeleteDialog(false);
    router.push("/admin/merchants");
  };

  if (!merchant) return <div>가맹점을 불러오는 중입니다...</div>;

  return (
    <div>
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          className="flex items-center text-gray-600 hover:text-gray-900"
          onClick={() => router.push("/admin/merchants")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          가맹점 목록
        </Button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{merchant.name}</h1>
          <div
            onClick={() => handleStatusChange(!isActive)}
            className={`w-24 h-10 flex items-center rounded-full cursor-pointer transition-colors duration-300 ${
              isActive ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-12 h-10 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center font-bold text-sm ${
                isActive ? "translate-x-12" : "translate-x-0"
              }`}
            >
              {isActive ? "활성" : "비활성"}
            </div>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          className="text-white hover:text-red-800 bg-red-600"
        >
          가맹점 제거
        </Button>
      </div>

      <p className="text-gray-600 mb-6">{merchant.category}</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white">
          <CardContent className="px-6">
            <div className="flex flex-col">
              <span className="text-base text-gray-500 mb-2">총 거래 건수</span>
              <span className="text-3xl font-bold">
                {merchant.totalTransactions.toLocaleString()}건
              </span>
              <span className="text-sm text-gray-500 mt-2">
                최근 24시간: {merchant.recent24hTransactionCount}건
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="px-6">
            <div className="flex flex-col">
              <span className="text-base text-gray-500 mb-2">총 거래 금액</span>
              <span className="text-3xl font-bold">{merchant.totalAmount}</span>
              <span className="text-sm text-gray-500 mt-2">
                전월 대비:{" "}
                {stats
                  ? `${stats.percentChange > 0 ? "+" : ""}${stats.percentChange}%`
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
                {merchant.averageAmount}
              </span>
              <span className="text-sm text-gray-500 mt-2">
                거래당 평균 금액
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="px-6">
            <div className="flex flex-col">
              <span className="text-base text-gray-500 mb-2">수수료율</span>
              <span className="text-3xl font-bold">
                {merchant.commissionRate}
              </span>
              <span className="text-sm text-gray-500 mt-2">기본 수수료율</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="거래 내역" className="w-full">
        <TabsList>
          <TabsTrigger
            value="거래 내역"
            className="data-[state=active]:bg-gray-200 cursor-pointer"
          >
            거래 내역
          </TabsTrigger>
          <TabsTrigger
            value="상세 정보"
            className="data-[state=active]:bg-gray-200 cursor-pointer"
          >
            상세 정보
          </TabsTrigger>
        </TabsList>

        <TabsContent value="거래 내역">
          <Card className="py-2 bg-white">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="px-6 py-3 font-medium">거래 ID</th>
                      <th className="px-6 py-3 font-medium">금액</th>
                      <th className="px-6 py-3 font-medium">결제 수단</th>
                      <th className="px-6 py-3 font-medium">날짜/시간</th>
                      <th className="px-6 py-3 font-medium">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">{transaction.id}</td>
                        <td className="px-6 py-4">{transaction.amount}</td>
                        <td className="px-6 py-4">
                          {transaction.paymentMethod}
                        </td>
                        <td className="px-6 py-4">{transaction.dateTime}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                              transaction.status === "완료"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            {/* 페이지네이션 */}
            <div className="p-4 flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTransactionPage((p) => Math.max(1, p - 1))}
                disabled={transactionPage === 1}
              >
                이전
              </Button>

              {Array.from(
                { length: transactionTotalPages },
                (_, i) => i + 1,
              ).map((page) => (
                <Button
                  key={page}
                  variant="ghost"
                  size="sm"
                  className={
                    page === transactionPage ? "bg-black text-white" : ""
                  }
                  onClick={() => setTransactionPage(page)}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setTransactionPage((p) =>
                    Math.min(transactionTotalPages, p + 1),
                  )
                }
                disabled={transactionPage === transactionTotalPages}
              >
                다음
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="상세 정보">
          <Card className="w-1/2 p-6 bg-white">
            <CardContent className="p-0 min-h-[330px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-15">
                <div>
                  <p className="text-sm text-gray-500">가맹점명</p>
                  <p className="text-lg font-medium">{merchant.merchantName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mt-1">사업자등록번호</p>
                  <p className="text-lg font-medium">
                    {merchant.businessNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mt-1">카테고리</p>
                  <p className="text-lg font-medium">{merchant.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mt-1">담당자</p>
                  <p className="text-lg font-medium">{merchant.managerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mt-1">연락처</p>
                  <p className="text-lg font-medium">{merchant.managerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mt-1">담당자 연락처</p>
                  <p className="text-lg font-medium">
                    {merchant.businessPhone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>가맹점 삭제</DialogTitle>
            <DialogDescription>
              정말로 {merchant.name} 가맹점을 삭제하시겠습니까? 이 작업은 되돌릴
              수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteMerchant}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
