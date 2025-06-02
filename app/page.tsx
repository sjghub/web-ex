"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  CheckCircle,
  CreditCard,
  Gift,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Footer from "@/components/footer-bar";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  // 스크롤 애니메이션을 위한 효과
  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      const elements = document.querySelectorAll(".animate-on-scroll");
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isInViewport = rect.top <= window.innerHeight * 0.8;
        if (isInViewport) {
          el.classList.add("animate-fade-in");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // 초기 로드 시 한 번 실행

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <main className="flex flex-col">
      <section className="relative flex min-h-screen flex-col items-center justify-center bg-[#E5E5E5] overflow-hidden">
        {/* 배경 영상 */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          src="/background2.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* 네비게이션 */}
        <nav className="absolute top-0 left-0 w-full p-6 z-10 flex justify-end items-center">
          <div className="flex gap-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
              asChild
            >
              <Link href="/login">로그인</Link>
            </Button>
            <Button
              variant="ghost"
              className="text-white bg-transparent border-white hover:bg-white/20"
              asChild
            >
              <Link href="/signup/terms">회원가입</Link>
            </Button>
          </div>
        </nav>

        {/* 메인 텍스트 */}
        <div
          className={`z-10 text-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-medium text-center text-white mb-6">
            <span className="text-gray-300">쓸수록 이득, </span>
            페이
            <span className="inline-block ml-2 -rotate-20">득</span>
          </h1>
          <p className="text-white text-xl md:text-2xl mb-8">
            카드 혜택을 놓치지 말고 자동으로 챙겨보세요
          </p>
          <Button
            size="lg"
            className="bg-white text-black hover:bg-white/90 font-bold text-lg px-8 py-6"
            asChild
          >
            <Link href="/login">지금 시작하기</Link>
          </Button>
        </div>

        <div className="absolute bottom-10 z-10 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white" />
        </div>
      </section>

      {/* First Section - Wallet/Cards */}
      <section className="w-full px-24 py-16 flex flex-col md:flex-row items-center justify-between bg-white animate-on-scroll">
        <div className="w-1/2 flex justify-center">
          <Image
            src="/wallet-illustration.png"
            alt="Wallet with cards"
            width={400}
            height={400}
            priority
          />
        </div>
        <div className="w-1/2 ml-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl mb-4"
            style={{ fontFamily: "SBAggroB" }}
          >
            사용하는 카드를 <br />
            한번에 간편하게
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            페이들에 카드를 등록해두고 결제 시 간편하게 사용하세요!
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <p className="text-gray-700">
                여러 카드를 한 번에 관리하고 최적의 카드를 추천받으세요
              </p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <p className="text-gray-700">
                결제 시 자동으로 최고의 혜택을 주는 카드를 선택해드립니다
              </p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <p className="text-gray-700">
                카드 등록부터 관리까지 모든 과정이 간편합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Second Section - Gift Box */}
      <section className="w-full px-24 py-16 flex flex-col md:flex-row items-center justify-between bg-white animate-on-scroll">
        <div className="w-1/2 ml-16 order-2 md:order-1">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl mb-4"
            style={{ fontFamily: "SBAggroB" }}
          >
            결제 버튼 클릭 한 번에 <br />
            자동으로 쌓아지는 혜택
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            페이들이 놓치고 있는 혜택들을 자동으로 챙겨드려요!
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <p className="text-gray-700">
                매월 평균 15,000원 이상의 카드 혜택을 더 받을 수 있어요
              </p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <p className="text-gray-700">
                복잡한 카드 혜택을 자동으로 계산하고 적용해드립니다
              </p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <p className="text-gray-700">
                혜택 적용 내역을 한눈에 확인할 수 있어요
              </p>
            </div>
          </div>
        </div>
        <div className="w-1/2 flex justify-center order-1 md:order-2">
          <Image
            src="/gift-box-illustration.png"
            alt="Gift box with benefits"
            width={400}
            height={400}
          />
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section className="bg-gray-50 py-16 md:py-24 animate-on-scroll">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "SBAggroB" }}
            >
              페이득의 주요 기능
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              카드 혜택을 최대한 활용할 수 있는 다양한 기능을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-center mb-3">
                스마트 카드 관리
              </h3>
              <p className="text-gray-600 text-center">
                여러 카드를 한 곳에서 관리하고 각 카드의 혜택을 한눈에 확인할 수
                있습니다.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Gift className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-center mb-3">
                혜택 자동 계산
              </h3>
              <p className="text-gray-600 text-center">
                결제 시 자동으로 최고의 혜택을 주는 카드를 추천하고 적용된
                혜택을 계산해 드립니다.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-center mb-3">
                안전한 결제 시스템
              </h3>
              <p className="text-gray-600 text-center">
                최신 보안 기술로 카드 정보를 안전하게 보호하며 간편한 결제
                경험을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 카드 혜택 탭 섹션 */}
      <section className="container mx-auto px-4 py-16 md:py-24 animate-on-scroll">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "SBAggroB" }}
          >
            다양한 카드 혜택을 한눈에
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            페이득은 다양한 카테고리별로 최적의 카드를 추천해드립니다
          </p>
        </div>

        <Tabs defaultValue="cafe" className="w-full max-w-4xl mx-auto">
          <TabsList className="flex justify-between items-center gap-4 mb-8 bg-gray-100 p-1 rounded-lg w-full h-10">
            <TabsTrigger
              value="cafe"
              className="h-full flex items-center justify-center flex-1 rounded-md text-sm font-medium transition-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-gray-500 cursor-pointer"
            >
              카페
            </TabsTrigger>
            <TabsTrigger
              value="shopping"
              className="h-full flex items-center justify-center flex-1 rounded-md text-sm font-medium transition-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-gray-500 cursor-pointer"
            >
              쇼핑
            </TabsTrigger>
            <TabsTrigger
              value="dining"
              className="h-full flex items-center justify-center flex-1 rounded-md text-sm font-medium transition-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-gray-500 cursor-pointer"
            >
              식당
            </TabsTrigger>
            <TabsTrigger
              value="transport"
              className="h-full flex items-center justify-center flex-1 rounded-md text-sm font-medium transition-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-gray-500 cursor-pointer"
            >
              교통
            </TabsTrigger>
          </TabsList>
          <TabsContent value="cafe" className="bg-gray-50 p-6 rounded-lg">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="md:w-1/3">
                <Image
                  src="/starbucks-logo.png"
                  alt="스타벅스 로고"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-bold mb-3">카페/베이커리 할인</h3>
                <p className="text-gray-600 mb-4">
                  삼성카드 taptap O, NEW우리V카드 등 다양한 카드로 스타벅스에서
                  할인 혜택을 받을 수 있습니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    삼성카드 taptap O
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    현대카드 M Black
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    NEW우리V카드
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="shopping" className="bg-gray-50 p-6 rounded-lg">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="md:w-1/3">
                <Image
                  src="/coupang-logo.png"
                  alt="쿠팡 로고"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-bold mb-3">온라인 쇼핑 캐시백</h3>
                <p className="text-gray-600 mb-4">
                  카드의정석 SHOPPING+, 현대카드 M 등으로 쿠팡에서 결제하면
                  캐시백 혜택을 받을 수 있습니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    신한카드 Mr.Life
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    현대카드 M
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    카드의정석 SHOPPING+
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="dining" className="bg-gray-50 p-6 rounded-lg">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="md:w-1/3">
                <Image
                  src="/baemin-logo.png"
                  alt="배달의민족 로고"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-bold mb-3">배달앱 할인</h3>
                <p className="text-gray-600 mb-4">
                  배민 한그릇카드, 카드의정석 오하CHECK 등으로 배달앱에서
                  결제하면 할인 혜택을 받을 수 있습니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    배민 한그릇카드
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    카드의정석 오하CHECK
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    KB국민 My WE:SH 카드
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="transport" className="bg-gray-50 p-6 rounded-lg">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="md:w-1/3">
                <Image
                  src="/korail-logo.png"
                  alt="대중교통 로고"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-bold mb-3">대중교통 할인</h3>
                <p className="text-gray-600 mb-4">
                  카카오 T 하나카드, 신한카드 B.Big(삑) 등으로 대중교통 이용 시
                  할인 혜택을 받을 수 있습니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    카카오 T 하나카드
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    신한카드 B.Big(삑)
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* FAQ 섹션 */}
      <section className="bg-gray-50 py-16 md:py-24 animate-on-scroll">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "SBAggroB" }}
            >
              자주 묻는 질문
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              페이득 서비스에 대해 궁금한 점이 있으신가요?
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left cursor-pointer">
                  페이득은 어떤 서비스인가요?
                </AccordionTrigger>
                <AccordionContent>
                  페이득은 사용자의 카드를 등록하고 관리하여 결제 시 최적의
                  카드를 추천해주는 서비스입니다. 복잡한 카드 혜택을 자동으로
                  계산하여 사용자가 최대한의 혜택을 받을 수 있도록 도와드립니다.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left cursor-pointer">
                  카드 정보는 안전한가요?
                </AccordionTrigger>
                <AccordionContent>
                  네, 페이득은 최신 보안 기술을 사용하여 사용자의 카드 정보를
                  안전하게 보호합니다. 모든 데이터는 암호화되어 저장되며, 금융
                  보안 규정을 준수하고 있습니다.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left cursor-pointer">
                  서비스 이용 요금은 얼마인가요?
                </AccordionTrigger>
                <AccordionContent>
                  페이득 서비스는 무료로 이용하실 수 있습니다.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left cursor-pointer">
                  어떤 카드를 지원하나요?
                </AccordionTrigger>
                <AccordionContent>
                  국내 주요 카드사의 신용카드와 체크카드를 모두 지원합니다.
                  신한, 삼성, 현대, KB국민, 우리, NH농협, 하나, 롯데 등 대부분의
                  카드사 카드를 등록하실 수 있습니다.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left cursor-pointer">
                  카드를 등록하는 방법은 무엇인가요?
                </AccordionTrigger>
                <AccordionContent>
                  회원가입 후 로그인하시면 카드 등록 메뉴에서 간편하게 카드를
                  등록할 수 있습니다. 카드 번호, 유효기간, CVC 번호 등의 정보를
                  입력하시면 됩니다.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-black text-white py-16 md:py-24 animate-on-scroll">
        <div className="container mx-auto px-4 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "SBAggroB" }}
          >
            지금 바로 페이득을 시작하세요
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            카드 혜택을 놓치지 말고 매월 평균 15,000원 이상의 추가 혜택을
            받아보세요
          </p>
          <Button
            size="lg"
            className="bg-white text-black hover:bg-white/90 font-bold text-lg px-8 py-6"
            asChild
          >
            <Link href="/login">
              무료로 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
      {/* 푸터 */}
      <Footer />
    </main>
  );
}
