"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeaderNavBar } from "@/components/header-nav-bar";
import { fetchWithAuth } from "@/lib/api-fetch";
import Footer from "@/components/footer-bar";

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

interface CardDetail {
  cardName: string;
  imageUrl: string;
  cardCompany: string;
  annualFee: number;
  minSpending: string;
  benefits: Benefit[];
}

export default function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [card, setCard] = useState<CardDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCardDetail = async () => {
      try {
        const response = await fetchWithAuth(`/card/${id}`);
        const data = await response.json();
        if (data.success) {
          setCard(data.response);
        }
      } catch (error) {
        console.error("카드 정보를 불러오는데 실패했습니다:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCardDetail();
  }, [id]);

  const getCompanyBadgeClass = (company: string) => {
    switch (company.toUpperCase()) {
      case "HYUNDAI":
        return "bg-white text-black border-2 border-black";
      case "SAMSUNG":
        return "bg-indigo-600 text-white";
      case "WOORI":
        return "bg-sky-500 text-white";
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

  const getKoreanCompanyName = (company: string) => {
    switch (company.toUpperCase()) {
      case "HYUNDAI":
        return "현대카드";
      case "SAMSUNG":
        return "삼성카드";
      case "WOORI":
        return "우리카드";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        카드 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 바 */}
      <HeaderNavBar />

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-6 mb-24">
        <h1 className="text-2xl font-bold mb-6">카드 상세 정보</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* 카드 이미지 및 신청 버튼 */}
            <div className="md:w-2/5 flex flex-col items-center py-10">
              <div className="w-64 h-64 relative bg-gray-200 rounded-full p-4 flex items-center justify-center mb-10">
                <div className="w-70 h-70 relative">
                  <Image
                    src={card.imageUrl}
                    alt={card.cardName}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* 연회비 + 전월실적 텍스트 */}
              <p className="text-sm text-gray-600 font-medium mb-10">
                연회비{" "}
                <span className="font-bold">
                  {card.annualFee === 0
                    ? "없음"
                    : `${card.annualFee.toLocaleString()}원`}
                </span>{" "}
                / 전월실적 <span className="font-bold">{card.minSpending}</span>
              </p>

              {/* 카드 신청 버튼 */}
              <Button className="w-full bg-black hover:bg-gray-800 py-4 text-lg text-white">
                카드 신청
              </Button>
            </div>

            {/* 카드 정보 */}
            <div className="md:w-2/3">
              <div className="flex items-center mb-6">
                <h2 className="text-3xl font-bold">{card.cardName}</h2>
                <span
                  className={`ml-2 text-xs font-bold px-2 py-1 rounded-full ${getCompanyBadgeClass(
                    card.cardCompany,
                  )}`}
                >
                  {getKoreanCompanyName(card.cardCompany)}
                </span>
              </div>

              {/* 혜택 목록 */}
              {card.benefits.map((benefit) => (
                <div
                  key={benefit.id}
                  className="bg-blue-50 rounded-lg p-4 mb-6"
                >
                  <h3 className="text-lg font-medium flex items-center mb-2">
                    <Check className="mr-2 text-green-500" /> {benefit.title}
                  </h3>
                  <p className="ml-6 mb-2">{benefit.description}</p>
                  {benefit.hasAdditionalCondition &&
                    benefit.benefitConditions.length > 0 && (
                      <div className="ml-6 mt-2">
                        <p className="text-sm text-gray-600">
                          {benefit.benefitConditions[0].category ===
                          "PER_TRANSACTION_LIMIT"
                            ? `1회 최대 ${benefit.benefitConditions[0].value.toLocaleString()}원 할인 적용`
                            : benefit.benefitConditions[0].category ===
                                "DAILY_LIMIT_COUNT"
                              ? `일 ${benefit.benefitConditions[0].value}회 할인 적용`
                              : benefit.benefitConditions[0].category ===
                                  "MONTHLY_LIMIT_COUNT"
                                ? `월 ${benefit.benefitConditions[0].value}회 할인 적용`
                                : benefit.benefitConditions[0].category ===
                                    "DAILY_DISCOUNT_LIMIT"
                                  ? `일 최대 ${benefit.benefitConditions[0].value.toLocaleString()}원 할인 적용`
                                  : `월 최대 ${benefit.benefitConditions[0].value.toLocaleString()}원 할인 적용`}
                        </p>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
