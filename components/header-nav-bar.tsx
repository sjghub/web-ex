"use client";

import { useRouter, usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./logo";
import { fetchWithAuth } from "@/lib/api-fetch";
import { removeCookie } from "@/lib/auth";

const NAV_ITEMS = [
  { path: "/dashboard", label: "홈", key: "home" },
  { path: "/mycard", label: "카드 관리", key: "cardManagement" },
  {
    path: "/card-recommendation",
    label: "카드 추천",
    key: "cardRecommendation",
  },
  { path: "/mypage", label: "내 정보", key: "myInfo" },
];

export function HeaderNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const response = await fetchWithAuth(
        "/logout",
        {
          method: "POST",
        },
        "json",
        "http://localhost:8080/auth/api",
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("로그아웃 실패 응답:", response.status, text);
        throw new Error("로그아웃에 실패했습니다.");
      }

      removeCookie("accessToken");
      router.push("/");
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  const getActiveTab = (): string => {
    const match = NAV_ITEMS.find((item) => pathname.startsWith(item.path));
    return match?.key || "home";
  };

  const activeTab = getActiveTab();

  return (
    <header className="sticky top-0 z-10 bg-white border-b">
      <div className="relative container mx-auto px-4 py-3 flex items-center justify-center">
        {/* 왼쪽 메뉴 */}
        <div className="absolute left-0 flex items-center space-x-6">
          {NAV_ITEMS.map(({ path, label, key }) => (
            <Button
              key={key}
              variant="ghost"
              className={`cursor-pointer px-3 py-2 hover:bg-gray-100 ${
                activeTab === key ? "font-bold bg-gray-100 rounded-md" : ""
              }`}
              onClick={() => router.push(path)}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* 가운데 로고 */}
        <Logo
          className="text-center text-3xl"
          onClick={() => router.push("/dashboard")}
        />

        {/* 오른쪽 알림/로그아웃 */}
        <div className="absolute right-0 flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer relative hover:bg-gray-100"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
          </Button>
          <Button
            variant="ghost"
            className="cursor-pointer hover:bg-gray-100"
            onClick={handleLogout}
          >
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  );
}
