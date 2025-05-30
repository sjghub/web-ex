"use client";

import { useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopNavBarProps {
  onSearch?: (query: string) => void;
}

const COOKIE_NAMES = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
};

const API_URL = "http://localhost:8080/auth/api/logout";

const getCookie = (name: string): string | null => {
  const matches = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)"),
  );
  return matches ? decodeURIComponent(matches[2]) : null;
};

export default function TopNavBar({ onSearch }: TopNavBarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const accessToken = getCookie(COOKIE_NAMES.accessToken);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("로그아웃 실패 응답:", response.status, text);
        throw new Error("로그아웃에 실패했습니다.");
      }

      Object.values(COOKIE_NAMES).forEach((name) => {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });

      router.push("/");
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
  };

  return (
    <header className="bg-white border-b">
      <div className="flex items-center justify-end px-6 py-3">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="가맹점 검색..."
              className="pl-10 w-64"
              onChange={handleSearch}
            />
          </div>

          <Button variant="ghost" size="icon" className="relative">
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
