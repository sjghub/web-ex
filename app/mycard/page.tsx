"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Plus,
  Search,
  Star,
  Trash2,
  Check,
  MoreVertical,
} from "lucide-react";
import { HeaderNavBar } from "@/components/header-nav-bar";
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
  DialogDescription,
  DialogFooter,
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
import { fetchWithAuth } from "@/lib/api-fetch";
import Footer from "@/components/footer-bar";

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

// 스켈레톤 카드 컴포넌트
const CardSkeleton = () => (
  <Card className="overflow-hidden p-0 pb-6 animate-pulse">
    <div className="relative aspect-[1.58/1] bg-gray-200" />
    <CardContent className="px-4">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-3 bg-gray-200 rounded w-32" />
        </div>
        <div className="h-8 w-8 bg-gray-200 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </CardContent>
  </Card>
);

export default function MyCardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<CardResponse | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [sortOption, setSortOption] = useState("default");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 내 카드 목록 (API 연동)
  const [myCards, setMyCards] = useState<CardResponse[]>([]);

  useEffect(() => {
    setIsLoading(true);
    fetchWithAuth("/card/my", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.response)) {
          setMyCards(data.response);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // 카드 검색 필터링
  const filteredCards = myCards.filter((card) =>
    card.cardName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // 카드 정렬
  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortOption === "name") {
      return a.cardName.localeCompare(b.cardName);
    } else if (sortOption === "default") {
      return a.isDefaultCard ? -1 : b.isDefaultCard ? 1 : 0;
    }
    return 0;
  });

  // 대표 카드 설정
  const handleSetDefaultCard = async (card: CardResponse) => {
    const res = await fetchWithAuth("/card/default", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: card.id }),
    });
    const data = await res.json();
    if (data.success) {
      setMyCards(
        myCards.map((c) => ({
          ...c,
          isDefaultCard: c.id === card.id,
        })),
      );
    } else {
      alert(data.response?.message);
    }
  };

  // 카드 삭제
  const handleDeleteCard = async () => {
    if (selectedCard) {
      try {
        const res = await fetchWithAuth(`/card/${selectedCard.id}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (data.success) {
          setMyCards(myCards.filter((card) => card.id !== selectedCard.id));
          setShowDeleteDialog(false);
          setSelectedCard(null);
        } else {
          setShowDeleteDialog(false);
          setErrorMessage(data.message || "카드 삭제에 실패했습니다.");
        }
      } catch {
        setShowDeleteDialog(false);
        setErrorMessage("카드 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  // 카드 상세 정보 보기
  const handleViewCardDetail = (card: CardResponse) => {
    setSelectedCard(card);
    setShowDetailDialog(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 상단 네비게이션 바 */}
      <HeaderNavBar />

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-6 mb-24 flex-grow">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">내 카드</h1>
          <p className="text-gray-500 mb-6">
            등록된 카드를 확인하고 관리할 수 있습니다.
          </p>

          {/* 검색 및 필터 영역 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="카드 검색"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[140px] cursor-pointer hover:bg-gray-100">
                  <SelectValue placeholder="정렬 방식" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem
                    value="default"
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    기본 정렬
                  </SelectItem>
                  <SelectItem
                    value="name"
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    이름순 정렬
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => router.push("/card/register")}
                className="bg-black text-white cursor-pointer"
              >
                카드 추가
                <Plus className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 카드 목록 */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : sortedCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCards.map((card) => (
                <Card key={card.id} className="overflow-hidden p-0 pb-6">
                  <div className="relative aspect-[1.58/1] overflow-hidden">
                    <Image
                      src={card.imageUrl || "/placeholder.png"}
                      alt={card.cardName}
                      fill
                      className="object-fill origin-center transform -rotate-90 scale-y-[1.58] scale-x-[0.63]"
                    />
                    {card.isDefaultCard && (
                      <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-full">
                        대표카드
                      </div>
                    )}
                  </div>
                  <CardContent className="px-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold">{card.cardName}</h3>
                        <p className="text-sm text-gray-500">
                          **** **** **** {card.cardNumber.slice(-4)}
                        </p>
                      </div>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100 cursor-pointer"
                          >
                            <span className="sr-only">메뉴 열기</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem
                            onClick={() => handleViewCardDetail(card)}
                            className="hover:bg-gray-100 cursor-pointer"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            상세 정보
                          </DropdownMenuItem>
                          {!card.isDefaultCard && (
                            <DropdownMenuItem
                              onClick={() => handleSetDefaultCard(card)}
                              className="hover:bg-gray-100 cursor-pointer"
                            >
                              <Star className="mr-2 h-4 w-4" />
                              대표카드 설정
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-500 hover:bg-red-50 cursor-pointer"
                            onClick={() => {
                              setSelectedCard(card);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            카드 삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-1">
                      {card.cardBenefits.slice(0, 3).map((benefit, index) => (
                        <p key={index} className="text-xs text-gray-600">
                          • {benefit.content}
                        </p>
                      ))}
                      {card.cardBenefits.length > 3 && (
                        <button
                          type="button"
                          className="text-xs text-gray-400 underline cursor-pointer p-0 bg-transparent border-0"
                          onClick={() => handleViewCardDetail(card)}
                        >
                          더보기
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                등록된 카드가 없습니다
              </h3>
              <p className="text-gray-500 mb-4">
                카드를 등록하고 혜택을 받아보세요.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* 카드 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>카드 삭제</DialogTitle>
            <DialogDescription>
              정말로 {selectedCard?.cardName} 카드를 삭제하시겠습니까? 이 작업은
              되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              취소
            </Button>
            <Button
              variant="ghost"
              onClick={handleDeleteCard}
              className="text-red-600"
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 카드 상세 정보 다이얼로그 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl">카드 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-4">
              <div className="flex justify-center m-0 p-0">
                <div className="relative w-50 aspect-[1/1.58] -rotate-90 origin-center">
                  <Image
                    src={selectedCard.imageUrl || "/placeholder.png"}
                    alt={selectedCard.cardName}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg">{selectedCard.cardName}</h3>
                <p className="text-sm text-gray-500">
                  카드번호: **** **** **** {selectedCard.cardNumber.slice(-4)}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">카드 혜택</h4>
                <ul className="space-y-2">
                  {selectedCard.cardBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-xs mr-2">
                        <Check />
                      </span>
                      <span className="text-sm mt-0.5">{benefit.content}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => setShowDetailDialog(false)}
                >
                  닫기
                </Button>
                {!selectedCard.isDefaultCard && (
                  <Button
                    variant="outline"
                    className="hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      handleSetDefaultCard(selectedCard);
                      setShowDetailDialog(false);
                    }}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    대표카드 설정
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* 에러 다이얼로그 */}
      <Dialog open={!!errorMessage} onOpenChange={() => setErrorMessage(null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>오류 발생</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorMessage(null)}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
