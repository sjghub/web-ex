"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api-fetch";

// 차트 컴포넌트

interface Trend {
  date: string;
  transactionAmount: number;
  transactionCount: number;
}

const TransactionChart = () => {
  const [trendData, setTrendData] = useState<Trend[]>([]);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetchWithAuth("/admin/merchants/trends");
        const data = await response.json();
        console.log(data);
        console.log(data.response);

        setTrendData(data.response);
      } catch (error) {
        console.error("❌ 거래 추이 데이터 로딩 실패:", error);
      }
    };
    fetchTrends();
  }, []);

  const labels = trendData.map((item) =>
    new Date(item.date).toLocaleDateString("ko-KR", {
      month: "numeric",
      day: "numeric",
    }),
  );

  if (trendData.length === 0) {
    return (
      <div className="text-gray-400 text-sm">
        거래 추이 데이터를 불러오는 중입니다...
      </div>
    );
  }

  const amountData = trendData.map((item) => item.transactionAmount);
  const countData = trendData.map((item) => item.transactionCount);

  const chartHeight = 260;
  // 1. 최대값 계산
  const maxAmount = Math.max(...amountData, 100000); // 최소 10만 보장
  const maxCount = Math.max(...countData, 100); // 최소 100 보장

  // 2. 스텝 자동 설정 (반올림해서 보기 좋게)
  const yTicks = 10;
  const amountStep = Math.ceil(maxAmount / yTicks / 1000) * 1000; // 천 단위
  const countStep = Math.ceil(maxCount / yTicks / 10) * 10; // 10 단위

  // 3. 축 최대값 재계산
  const adjustedMaxAmount = amountStep * yTicks;
  const adjustedMaxCount = countStep * yTicks;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex w-full px-4">
        {/* 왼쪽 Y축 (금액) */}
        <div className="flex flex-col justify-between items-end pr-2 text-xs text-blue-500 h-[320px]">
          {Array.from({ length: yTicks + 1 }).map((_, i) => (
            <div key={i} className="h-[32px] leading-none">
              {((yTicks - i) * amountStep).toLocaleString()}
            </div>
          ))}
        </div>

        {/* 차트 영역 */}
        <div className="relative flex-1 flex items-end justify-between h-[320px] border-y border-gray-200">
          {amountData.map((amount, index) => {
            const amountHeight = (amount / adjustedMaxAmount) * chartHeight;
            const countHeight =
              (countData[index] / adjustedMaxCount) * chartHeight;

            return (
              <div
                key={index}
                className="flex flex-col items-center w-full mx-1"
              >
                <div
                  className="flex items-end gap-1"
                  style={{ height: chartHeight }}
                >
                  <div
                    className="w-3 bg-blue-400 rounded-t-sm"
                    style={{ height: `${amountHeight}px` }}
                  />
                  <div
                    className="w-3 bg-green-400 rounded-t-sm opacity-70"
                    style={{ height: `${countHeight}px` }}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500 whitespace-nowrap">
                  {labels[index]}
                </div>
              </div>
            );
          })}
        </div>

        {/* 오른쪽 Y축 (건수) */}
        <div className="flex flex-col justify-between items-start pl-2 text-xs text-green-500 h-[320px]">
          {Array.from({ length: yTicks + 1 }).map((_, i) => (
            <div key={i} className="h-[32px] leading-none">
              {((yTicks - i) * countStep).toLocaleString()}
            </div>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex justify-center gap-6 mt-4 text-xs text-gray-500">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-400 mr-2 rounded-sm" />
          거래금액 (원)
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-400 mr-2 rounded-sm" />
          거래건수 (건)
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMerchantCount: 0,
    totalTransactionCount: 0,
    totalTransactionAmount: 0,
    averageTransactionAmount: 0,
    activeMerchantCount: 0,
    recent24hTransactionIncrease: 0,
    transactionAmountChangePercent: 0,
  });

  const fetchMerchantStats = async () => {
    try {
      const response = await fetchWithAuth("/admin/merchants/stats");
      if (!response.ok) throw new Error("가맹점 통계 조회 실패");

      const data = await response.json();
      setStats(data.response);
    } catch (error) {
      console.error("❌ 가맹점 통계 에러:", error);
    }
  };

  // 1. useState 정의
  const [topMerchants, setTopMerchants] = useState<
    {
      merchantId: number;
      merchantName: string;
      transactionCount: number;
      totalAmount: number;
    }[]
  >([]);

  // 2. API 호출 함수 추가
  const fetchTopMerchants = async () => {
    try {
      const response = await fetchWithAuth("/admin/merchants/top-stats");
      if (!response.ok) throw new Error("상위 가맹점 조회 실패");
      const data = await response.json();
      setTopMerchants(data.response);
    } catch (error) {
      console.error("❌ 상위 가맹점 조회 에러:", error);
    }
  };

  // 3. useEffect에 추가
  useEffect(() => {
    fetchMerchantStats();
    fetchTopMerchants(); // ✅ 추가된 부분
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">관리자 대시보드</h1>
      <h2 className="text-gray-600 mb-4">
        가맹점 서비스 이용 현황을 확인하세요.
      </h2>
      <div className="mb-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardContent className="px-6">
              <div className="flex flex-col">
                <span className="text-base text-gray-500 mb-2">총 가맹점</span>
                <span className="text-3xl font-bold">
                  {stats.totalMerchantCount.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 mt-2">
                  활성 가맹점: {stats.activeMerchantCount.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="px-6">
              <div className="flex flex-col">
                <span className="text-base text-gray-500 mb-2">
                  총 거래 건수
                </span>
                <span className="text-3xl font-bold">
                  {stats.totalTransactionCount.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 mt-2">
                  최근 24시간: +
                  {stats.recent24hTransactionIncrease.toLocaleString()}
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
                  {stats.totalTransactionAmount.toLocaleString()}원
                </span>
                <span className="text-sm text-green-500 mt-2">
                  전월 대비:{" "}
                  {stats.transactionAmountChangePercent >= 0
                    ? `+${stats.transactionAmountChangePercent.toFixed(1)}%`
                    : `${stats.transactionAmountChangePercent.toFixed(1)}%`}
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
                  {stats.averageTransactionAmount.toLocaleString()}원
                </span>
                <span className="text-sm text-gray-500 mt-2">
                  거래당 평균 금액
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 차트 및 테이블 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">거래 추이</h3>
              </div>
              <div className="h-[360px]">
                <TransactionChart />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="px-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">상위 가맹점</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b">
                      <th className="pb-2 text-left font-medium">가맹점명</th>
                      <th className="pb-2 text-center font-medium">
                        거래 건수
                      </th>
                      <th className="pb-2 text-center font-medium">
                        거래 금액
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topMerchants.map((merchant) => (
                      <tr
                        key={merchant.merchantId}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="py-3 text-left">
                          {merchant.merchantName}
                        </td>
                        <td className="py-3 text-right">
                          {merchant.transactionCount.toLocaleString()}
                        </td>
                        <td className="py-3 text-right">
                          {merchant.totalAmount.toLocaleString()}원
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
