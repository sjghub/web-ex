"use client";

import { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeaderNavBar } from "@/components/header-nav-bar";
import { Utensils, CreditCard, ShoppingBag, Film, Bus } from "lucide-react";
import Footer from "@/components/footer-bar";
import { fetchWithAuth } from "@/lib/api-fetch";
import Loading from "@/components/loading";

// API 응답 타입 정의
interface BenefitCondition {
  id: number;
  value: number;
  category: string;
}

interface Benefit {
  id: number;
  title: string;
  description: string;
  benefitType: string;
  hasAdditionalCondition: boolean;
  benefitConditions: BenefitCondition[];
}

interface CardRecommendation {
  cardId: number;
  cardName: string;
  imageUrl: string;
  benefits: Benefit[];
  cardCompany: string;
}

interface CardRecommendationResponse {
  success: boolean;
  status: string;
  message: string;
  response: CardRecommendation[];
}

// 카드 타입 정의
interface CardBenefit {
  id: number;
  name: string;
  image: string;
  category: string;
  benefits: string[];
  company: string;
}

function CardBenefitsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cardBenefits, setCardBenefits] = useState<CardBenefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 카테고리 매핑
  const categoryMapping = useMemo<
    Record<string, { display: string; api: string }>
  >(
    () => ({
      food_beverage: { display: "식/음료", api: "FOOD_BEVERAGE" },
      subscription: { display: "정기결제", api: "SUBSCRIBE" },
      cultural: { display: "문화", api: "CULTURE" },
      shopping: { display: "쇼핑", api: "SHOPPING" },
      transportation: { display: "교통", api: "TRANSPORTATION" },
    }),
    [],
  );

  // 초기 카테고리 설정
  const getInitialCategory = useCallback(() => {
    const category = searchParams.get("category");
    if (category && categoryMapping[category]) {
      return categoryMapping[category].display;
    }
    return "식/음료";
  }, [searchParams, categoryMapping]);

  const [activeCategory, setActiveCategory] = useState(getInitialCategory());

  // API에서 카드 데이터 가져오기
  const fetchCardBenefits = useCallback(
    async (category: string) => {
      try {
        setIsLoading(true);
        // 카테고리 표시 이름으로 API 카테고리 찾기
        const apiCategory = Object.values(categoryMapping).find(
          (mapping) => mapping.display === category,
        )?.api;

        if (!apiCategory) {
          console.error("유효하지 않은 카테고리입니다:", category);
          return;
        }

        const response = await fetchWithAuth(
          `/card/recommendation/${apiCategory}`,
        );
        const data: CardRecommendationResponse = await response.json();

        if (data.success) {
          const transformedCards: CardBenefit[] = data.response.map((card) => ({
            id: card.cardId,
            name: card.cardName,
            image: card.imageUrl,
            category: category,
            benefits: card.benefits.map((benefit) => benefit.description),
            company: card.cardCompany,
          }));
          setCardBenefits(transformedCards);
        }
      } catch (error) {
        console.error("카드 데이터를 가져오는데 실패했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [categoryMapping],
  );

  // URL 파라미터 처리
  useEffect(() => {
    const category = searchParams.get("category");
    if (category && categoryMapping[category]) {
      const mappedCategory = categoryMapping[category].display;
      setActiveCategory(mappedCategory);
      fetchCardBenefits(mappedCategory);
    } else {
      fetchCardBenefits(getInitialCategory());
    }
  }, [searchParams, categoryMapping, fetchCardBenefits, getInitialCategory]);

  // 카테고리 변경 시 URL 업데이트
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    fetchCardBenefits(category);

    // 카테고리 표시 이름을 URL 파라미터로 변환
    const categoryToParam = Object.entries(categoryMapping).find(
      ([, mapping]) => mapping.display === category,
    )?.[0];

    if (categoryToParam) {
      router.push(`/card-recommendation?category=${categoryToParam}`, {
        scroll: false,
      });
    }
  };

  // 카테고리별 카드 필터링
  const filteredCards = useMemo(() => {
    const cards = cardBenefits.filter(
      (card) => card.category === activeCategory,
    );

    if (cards.length <= 3) {
      return cards;
    }

    // 배열을 복사하고 섞기
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    // 처음 3개만 선택
    return shuffled.slice(0, 3);
  }, [cardBenefits, activeCategory]);

  // 카테고리 목록
  const categories = Object.values(categoryMapping).map(
    (mapping) => mapping.display,
  );

  // 카테고리에 맞는 아이콘 반환
  const getCategoryIcon = (category: string, size: number = 20) => {
    switch (category) {
      case "식/음료":
        return <Utensils size={size} />;
      case "정기결제":
        return <CreditCard size={size} />;
      case "쇼핑":
        return <ShoppingBag size={size} />;
      case "문화":
        return <Film size={size} />;
      case "교통":
        return <Bus size={size} />;
      default:
        return <Utensils size={size} />;
    }
  };

  // 카드사 배지 스타일 반환
  const getCompanyBadgeClass = (company: string) => {
    switch (company) {
      case "WOORI":
        return "bg-sky-500 text-white";
      case "SAMSUNG":
        return "bg-indigo-600 text-white";
      case "HYUNDAI":
        return "bg-white text-black border-2 border-black";
      case "KOOKMIN":
        return "bg-yellow-400 text-white";
      case "SHINHAN":
        return "bg-blue-600 text-white";
      case "LOTTE":
        return "bg-red-400 text-white";
      default:
        return "bg-neutral-200 text-white";
    }
  };

  // 카드사 코드를 한글 이름으로 변환
  const getCompanyName = (company: string) => {
    switch (company) {
      case "WOORI":
        return "우리카드";
      case "SAMSUNG":
        return "삼성카드";
      case "HYUNDAI":
        return "현대카드";
      case "KOOKMIN":
        return "국민카드";
      case "SHINHAN":
        return "신한카드";
      case "LOTTE":
        return "롯데카드";
      default:
        return company;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 상단 네비게이션 바 */}
      <HeaderNavBar />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6 mb-24">
        <div>
          <h1 className="text-2xl font-bold mb-2">혜택별 카드 추천</h1>
          <p className="text-gray-600 mb-6">
            원하는 혜택 카테고리를 선택하여 최적을 카드를 찾아보세요
          </p>

          {/* 카테고리 탭 */}
          <Tabs
            value={activeCategory}
            onValueChange={handleCategoryChange}
            className="w-full mb-4 bg-white"
          >
            <TabsList className="grid grid-cols-5 w-full h-full p-0">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="flex flex-col items-center justify-center h-full data-[state=active]:bg-blue-50"
                >
                  {getCategoryIcon(category)}
                  <span>{category}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* 카드 목록 제목 */}
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full mr-2">
              {getCategoryIcon(activeCategory, 16)}
            </span>
            {activeCategory} 혜택 추천 카드
          </h2>

          {/* 로딩 상태 */}
          {isLoading ? (
            <Loading message="카드 정보를 불러오는 중입니다" size="large" />
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                혜택에 맞는 카드가 없습니다
              </h3>
            </div>
          ) : (
            /* 카드 목록 */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredCards.map((card) => (
                <Card
                  key={card.id}
                  className="overflow-hidden bg-white relative flex flex-col"
                >
                  <span
                    className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-full z-10 ${getCompanyBadgeClass(card.company)}`}
                  >
                    {getCompanyName(card.company)}
                  </span>

                  <div className="relative flex justify-center items-center h-[200px]">
                    <div className="absolute w-40 h-40 rounded-full bg-gray-200 opacity-50" />
                    <div className="w-72 h-44 relative">
                      <Image
                        src={card.image || "/placeholder.svg"}
                        alt={card.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <CardContent className="px-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-4">{card.name}</h3>

                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">
                        주요 혜택
                      </h4>
                      <ul className="space-y-3">
                        {card.benefits.slice(0, 3).map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-semibold mr-2">
                              {index + 1}
                            </span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                        {card.benefits.length > 3 && (
                          <li className="text-sm text-gray-500 mt-2">
                            외 {card.benefits.length - 3}개 혜택
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          router.push(`/card-recommendation/${card.id}`)
                        }
                      >
                        상세 정보
                      </Button>
                      <Button className="flex-1 bg-black hover:bg-gray-800 text-white">
                        카드 신청
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function CardBenefitsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CardBenefitsContent />
    </Suspense>
  );
}
