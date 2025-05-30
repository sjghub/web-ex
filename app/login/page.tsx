"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter as DialogFooterContent,
} from "@/components/ui/dialog";
import Logo from "@/components/logo";
import { fetchWithoutAuth } from "@/lib/api-fetch";

interface SigninRequest {
  username: string;
  password: string;
}

interface CommonResponse<T> {
  success: boolean;
  status: string;
  message: string;
  response: T;
}

interface TokenResponse {
  accessToken: string;
  redirectUrl: string;
}

const DEFAULT_ERROR_MSG = "로그인 중 오류가 발생했습니다. 다시 시도해주세요.";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleErrorResponse = async (res: Response) => {
    if (res.status === 401) {
      setErrorMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
    } else {
      const data = await res.json().catch(() => null);
      const msg = data?.message || DEFAULT_ERROR_MSG;
      setErrorMessage(msg);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const body: SigninRequest = { username: userId, password };
      const res = await fetchWithoutAuth("/signin", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        await handleErrorResponse(res);
        return;
      }

      const result: CommonResponse<TokenResponse> = await res.json();
      if (!result.success || !result.response) {
        throw new Error(result.message || DEFAULT_ERROR_MSG);
      }

      const { accessToken, redirectUrl } = result.response;
      document.cookie = `accessToken=${accessToken}; path=/`;

      router.push(redirectUrl);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : DEFAULT_ERROR_MSG);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pt-20">
      <Logo
        className="text-6xl flex justify-center mb-10"
        onClick={() => router.push("/")}
      />

      <div className="flex justify-center items-center">
        <div className="w-full max-w-md">
          <Card className="border-gray-100 shadow-sm py-10">
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-10">
                <div className="space-y-2">
                  <Label htmlFor="userId">아이디</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 -translate-y-1/2" />
                    <Input
                      id="userId"
                      type="text"
                      className={`pl-10 ${errorMessage ? "border-red-500" : ""}`}
                      placeholder="아이디를 입력하세요"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2 pb-6">
                  <Label htmlFor="password">비밀번호</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 -translate-y-1/2" />
                    <Input
                      id="password"
                      type="password"
                      className={`pl-10 ${errorMessage ? "border-red-500" : ""}`}
                      placeholder="비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white py-2 rounded"
                  disabled={isLoading}
                >
                  {isLoading ? "로그인 중..." : "로그인"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Separator />
              <div className="flex justify-center space-x-4 text-sm text-gray-500">
                <Link
                  href="/verify?type=idInquiry"
                  className="hover:text-black hover:underline"
                >
                  아이디 찾기
                </Link>
                <span>|</span>
                <Link
                  href="/pwInquiry"
                  className="hover:text-black hover:underline"
                >
                  비밀번호 찾기
                </Link>
                <span>|</span>
                <Link
                  href="/signup/terms"
                  className="hover:text-black hover:underline"
                >
                  회원가입
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={!!errorMessage} onOpenChange={() => setErrorMessage("")}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>알림</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooterContent>
            <Button onClick={() => setErrorMessage("")}>확인</Button>
          </DialogFooterContent>
        </DialogContent>
      </Dialog>
    </div>
  );
}
