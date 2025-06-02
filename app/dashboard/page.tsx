"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCardScroll } from "./page-script";
import { Skeleton } from "@/components/ui/skeleton";

import { fetchWithAuth } from "@/lib/api-fetch";
import { HeaderNavBar } from "@/components/header-nav-bar";
import Footer from "@/components/footer-bar";
import {
  fetchRecentTransactions,
  PaymentHistoryResponse,
} from "@/lib/api/fetchRecentTransactions";

export default function DashboardPage() {
  const [userBenefits, setUserBenefits] = useState<BenefitResponse | null>(
    null,
  );
  const [isCardsLoading, setIsCardsLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const router = useRouter();

  useCardScroll();

  useEffect(() => {
    const getUserBenefits = async () => {
      try {
        const res = await fetchWithAuth("/user/benefits");
        if (!res.ok) throw new Error("Failed to fetch user benefits");

        const json = await res.json();
        setUserBenefits(json.response);
      } catch (err) {
        console.error("Error fetching user benefits:", err);
      }
    };

    getUserBenefits();
  }, []);

  type BenefitResponse = {
    name: string;
    lastMonthSum: number;
    currentMonthSum: number;
  };

  // 혜택별 최고의 카드 (예시)
  const bestCards = [
    {
      id: 1,
      name: "넷플릭스",
      logo: "/netflix-logo.jpg",
      category: "subscription",
    },
    {
      id: 2,
      name: "배달의민족",
      logo: "/baemin-logo.png",
      category: "food_beverage",
    },
    {
      id: 3,
      name: "CGV",
      logo: "/cgv-logo.png",
      category: "cultural",
    },
    {
      id: 4,
      name: "쿠팡",
      logo: "/coupang-logo.png",
      category: "shopping",
    },
    {
      id: 5,
      name: "스타벅스",
      logo: "/starbucks-logo.png",
      category: "food_beverage",
    },
    {
      id: 6,
      name: "코레일",
      logo: "/korail-logo.png",
      category: "transportation",
    },
  ];

  const handlePrevCard = () => {
    setCurrentCardIndex(
      (prev) => (prev - 1 + bestCards.length) % bestCards.length,
    );
  };

  const handleNextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % bestCards.length);
  };

  const handleCardClick = (category: string) => {
    router.push(`/card-recommendation?category=${category}`);
  };

  // 내 카드 목록
  interface CardBenefit {
    content: string;
  }
  interface CardResponse {
    id: number;
    cardName: string;
    cardNumber: string;
    isDefaultCard: boolean;
    cardBenefits: CardBenefit[];
    imageUrl?: string;
  }
  const [myCards, setMyCards] = useState<CardResponse[]>([]);

  useEffect(() => {
    setIsCardsLoading(true);
    fetchWithAuth("/card/my", { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.response)) {
          setMyCards(data.response);
        }
      })
      .finally(() => {
        setIsCardsLoading(false);
      });
  }, []);

  const sortedCards = [...myCards].sort(
    (a, b) => (b.isDefaultCard ? 1 : 0) - (a.isDefaultCard ? 1 : 0),
  );

  const [transactions, setTransactions] = useState<PaymentHistoryResponse[]>(
    [],
  );

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsTransactionsLoading(true);
        const result = await fetchRecentTransactions(1, 100);
        setTransactions(result.content);
      } catch (error) {
        console.error("거래 내역을 불러오는데 실패했습니다:", error);
      } finally {
        setIsTransactionsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  return (
    <div className="min-h-screen">
      {/* 헤더 내비게이션 바 */}
      <HeaderNavBar />

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-16 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 혜택별 최고의 카드 */}
          <Card>
            <CardContent className="px-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold">혜택별 카드 추천</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                  onClick={() => router.push("/card-recommendation")}
                >
                  더보기
                </Button>
              </div>

              <div className="relative">
                <div className="flex justify-center items-center space-x-8 py-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 z-10"
                    onClick={handlePrevCard}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>

                  <div className="flex items-center justify-center gap-8">
                    {/* 이전 카드 */}
                    <div
                      className="w-auto h-auto rounded-full overflow-hidden flex items-center justify-center transition-transform duration-300 opacity-50 scale-75 cursor-pointer hover:opacity-70"
                      onClick={() =>
                        handleCardClick(
                          bestCards[
                            (currentCardIndex - 1 + bestCards.length) %
                              bestCards.length
                          ].category,
                        )
                      }
                    >
                      <Image
                        src={
                          bestCards[
                            (currentCardIndex - 1 + bestCards.length) %
                              bestCards.length
                          ].logo || "/placeholder.svg"
                        }
                        alt={
                          bestCards[
                            (currentCardIndex - 1 + bestCards.length) %
                              bestCards.length
                          ].name
                        }
                        width={120}
                        height={120}
                        className="object-contain"
                      />
                    </div>

                    {/* 현재 카드 */}
                    <div
                      className="w-auto h-auto rounded-full overflow-hidden flex items-center justify-center transition-transform duration-300 cursor-pointer hover:scale-105"
                      onClick={() =>
                        handleCardClick(bestCards[currentCardIndex].category)
                      }
                    >
                      <Image
                        src={
                          bestCards[currentCardIndex].logo || "/placeholder.svg"
                        }
                        alt={bestCards[currentCardIndex].name}
                        width={120}
                        height={120}
                        className="object-contain"
                      />
                    </div>

                    {/* 다음 카드 */}
                    <div
                      className="w-auto h-auto rounded-full overflow-hidden flex items-center justify-center transition-transform duration-300 opacity-50 scale-75 cursor-pointer hover:opacity-70"
                      onClick={() =>
                        handleCardClick(
                          bestCards[(currentCardIndex + 1) % bestCards.length]
                            .category,
                        )
                      }
                    >
                      <Image
                        src={
                          bestCards[(currentCardIndex + 1) % bestCards.length]
                            .logo || "/placeholder.svg"
                        }
                        alt={
                          bestCards[(currentCardIndex + 1) % bestCards.length]
                            .name
                        }
                        width={120}
                        height={120}
                        className="object-contain"
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 z-10"
                    onClick={handleNextCard}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 이번 달 총 할인 금액 */}
          <Card className="border-4 border-black">
            <CardContent className="h-full px-6 flex flex-col justify-between">
              {userBenefits ? (
                <>
                  <h2 className="text-2xl font-bold">
                    <span className="text-3xl">{userBenefits.name}</span>님 이번
                    달 총 할인 금액
                  </h2>
                  <p className="text-8xl font-bold">
                    {userBenefits.currentMonthSum.toLocaleString()}원
                  </p>
                  <p className="text-gray-600">
                    지난달 총 할인 금액{" "}
                    <span className="text-xl font-bold">
                      {userBenefits.lastMonthSum.toLocaleString()}원
                    </span>{" "}
                    입니다!
                  </p>
                </>
              ) : (
                <div className="flex flex-col justify-between h-full">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-[280px] bg-gray-200 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-24 w-[320px] bg-gray-200 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-[240px] bg-gray-200 animate-pulse" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 내 카드 + 최근 결제 내역 (가로 배치) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          {/* 내 카드 */}
          <div className="lg:col-span-3 h-[300px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">내 카드</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-500"
                onClick={() => router.push("/mycard")}
              >
                전체 보기
              </Button>
            </div>
            <div className="relative flex-1 flex flex-col">
              {/* Scroll buttons */}
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 scroll-button-left"
                aria-label="이전 카드 보기"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 scroll-button-right"
                aria-label="다음 카드 보기"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Scrollable container */}
              <div className="cards-scroll-container overflow-x-auto hide-scrollbar h-full flex-1">
                <div className="inline-flex gap-4 px-8">
                  {isCardsLoading ? (
                    // 스켈레톤 UI
                    Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`skeleton-${index}`}
                        className="flex-none w-[150px] md:w-[180px] aspect-[1/1.58]"
                      >
                        <Skeleton className="w-full h-full rounded-lg bg-gray-200 animate-pulse" />
                      </div>
                    ))
                  ) : (
                    <>
                      {sortedCards.map((card) => (
                        <div
                          key={card.id}
                          className="flex-none w-[150px] md:w-[180px] aspect-[1/1.58] perspective"
                        >
                          <div className="relative w-full h-full transition-transform duration-500 transform-style-preserve-3d hover:rotate-y-180">
                            {/* 앞면 */}
                            <div className="absolute inset-0 backface-hidden">
                              <Image
                                src={
                                  card.imageUrl?.startsWith("http")
                                    ? card.imageUrl
                                    : "/placeholder.png"
                                }
                                alt={card.cardName}
                                fill
                                className="rounded-lg shadow-sm object-cover"
                              />
                              {card.isDefaultCard && (
                                <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-full">
                                  대표
                                </div>
                              )}
                            </div>

                            {/* 뒷면 */}
                            <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg overflow-hidden">
                              <Image
                                src={
                                  card.imageUrl?.startsWith("http")
                                    ? card.imageUrl
                                    : "/placeholder.png"
                                }
                                alt={card.cardName}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-white/60 backdrop-blur-md px-4 py-3 flex flex-col justify-between text-left text-gray-800">
                                <div>
                                  <h3 className="text-base font-semibold mb-1">
                                    {card.cardName}
                                  </h3>
                                  <p className="text-sm">
                                    **** **** **** {card.cardNumber.slice(-4)}
                                  </p>
                                </div>
                                <ul className="text-xs space-y-1">
                                  {card.cardBenefits.map((benefit, index) => (
                                    <li key={index}>• {benefit.content}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* 카드 등록 */}
                      <div
                        className="relative flex-none w-[150px] md:w-[180px] aspect-[1/1.58] border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer"
                        onClick={() => router.push("/card/register")}
                      >
                        <div className="flex flex-col items-center text-gray-500">
                          <Plus className="h-6 w-6 mb-1" />
                          <span className="text-sm">카드 등록하기</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 최근 결제 내역 */}
          <div className="lg:col-span-2 h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">최근 결제 내역</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-500"
                onClick={() => router.push("/transactions")}
              >
                전체 보기
              </Button>
            </div>
            <Card className="h-full py-1 flex-1 flex flex-col overflow-hidden">
              <CardContent className="p-0 flex-1 flex flex-col h-full">
                <div className="divide-y flex-1 flex flex-col h-full overflow-y-auto hide-scrollbar">
                  {isTransactionsLoading ? (
                    // 스켈레톤 UI
                    Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={`skeleton-transaction-${index}`}
                        className="p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-32 bg-gray-200 animate-pulse" />
                            <Skeleton className="h-4 w-24 bg-gray-200 animate-pulse" />
                          </div>
                          <div className="space-y-2 text-right">
                            <Skeleton className="h-6 w-24 bg-gray-200 animate-pulse" />
                            <Skeleton className="h-4 w-20 bg-gray-200 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : transactions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                      <div className="text-center space-y-2">
                        <p className="text-lg font-medium">
                          결제 내역이 없습니다
                        </p>
                      </div>
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 flex-shrink-0"
                      >
                        <div>
                          <p className="font-bold text-base">
                            {transaction.shopName}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
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
                          <p className="font-bold text-lg">
                            {transaction.transactionAmount.toLocaleString()}원
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {transaction.cardName}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
