"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCardScroll } from "./page-script";

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
  const router = useRouter();
  /**
   * 네비게이션 바에서 현재 dashboard 페이지일 경우, dashboard 페이지로 다시 렌더링 해줘야 하는 이유?
   * 현재 ESLint 규칙에 의해 activeTab이 사용되지 않아, 코드를 살펴본 뒤 setActiveTab이 사용되는 부분을 주석처리 해두었습니다.
   * 추후 논의 필요
   */
  // const [activeTab, setActiveTab] = useState("home")

  // Initialize card scroll functionality
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
      logo: "/netflix_icon.png",
    },
    {
      id: 2,
      name: "스타벅스",
      logo: "/starbucks_icon.png",
    },
    {
      id: 3,
      name: "CGV",
      logo: "/cgv_icon.png",
    },
  ];

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
    fetchWithAuth("/card/my", { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.response)) {
          setMyCards(data.response);
        }
      });
  }, []);

  const sortedCards = [...myCards].sort(
    (a, b) => (b.isDefaultCard ? 1 : 0) - (a.isDefaultCard ? 1 : 0),
  );

  const [transactions, setTransactions] = useState<PaymentHistoryResponse[]>(
    [],
  );
  const itemsPerPage = 4;

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const result = await fetchRecentTransactions(1, itemsPerPage);
        setTransactions(result.content);
      } catch (error) {
        console.error("거래 내역을 불러오는데 실패했습니다:", error);
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
                <h2 className="text-3xl font-bold">혜택별 최고의 카드</h2>
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
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>

                  {bestCards.map((card) => (
                    <div key={card.id} className="flex flex-col items-center">
                      <div className="w-auto h-auto rounded-full overflow-hidden flex items-center justify-center">
                        <Image
                          src={card.logo || "/placeholder.svg"}
                          alt={card.name}
                          width={120}
                          height={120}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 z-10"
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
                <p className="text-xl text-gray-500">
                  혜택 정보를 불러오는 중...
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 내 카드 + 최근 결제 내역 (가로 배치) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          {/* 내 카드 */}
          <div className="lg:col-span-3 h-full flex flex-col">
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
            <div className="relative h-full flex-1 flex flex-col">
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
              <div className="cards-scroll-container overflow-x-auto pb-4 hide-scrollbar h-full flex-1">
                <div className="inline-flex gap-4 px-8">
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
                </div>
              </div>
            </div>
          </div>

          {/* 최근 결제 내역 */}
          <div className="lg:col-span-2 flex flex-col">
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
            <Card className="h-full flex-1 flex flex-col overflow-hidden">
              <CardContent className="p-0 flex-1 flex flex-col h-full">
                <div className="divide-y flex-1 flex flex-col h-full overflow-y-auto">
                  {transactions.map((transaction) => (
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
                  ))}
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
