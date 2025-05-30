"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchWithoutAuth } from "@/lib/api-fetch";

const STORAGE_KEY = "verifiedUser";
const DEFAULT_ERROR_MESSAGE = "아이디를 불러오는 데 실패했습니다.";
const REDIRECT_ON_FAIL = "/login";

interface ErrorResponse {
  message?: string;
  response?: {
    errorCode?: string;
    errors?: { field: string; message: string }[];
  };
  success?: boolean;
}

export default function IdLookupResultPage() {
  const router = useRouter();

  const [foundId, setFoundId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const handleErrorResponse = useCallback(
    (response: Response, data?: ErrorResponse) => {
      setErrorMessage(data?.message || DEFAULT_ERROR_MESSAGE);
      setShouldRedirect(true);
    },
    [],
  );

  const fetchUserId = useCallback(async () => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setErrorMessage("본인인증 정보가 없습니다.");
        setShouldRedirect(true);
        return;
      }

      const verified = JSON.parse(stored);
      const personalAuthKey = verified.personalAuthKey;

      if (!personalAuthKey) {
        setErrorMessage("본인인증 정보가 올바르지 않습니다.");
        setShouldRedirect(true);
        return;
      }

      const response = await fetchWithoutAuth("/find-id", {
        method: "POST",
        body: JSON.stringify({ personalAuthKey }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        handleErrorResponse(response, data);
        return;
      }

      setFoundId(data.response.username);
      sessionStorage.clear();
    } catch (err) {
      console.error(err);
      setErrorMessage(DEFAULT_ERROR_MESSAGE);
      setShouldRedirect(true);
    }
  }, [handleErrorResponse]);

  useEffect(() => {
    fetchUserId();
  }, [fetchUserId]);

  const handleDialogConfirm = () => {
    setErrorMessage("");
    if (shouldRedirect) {
      router.push(REDIRECT_ON_FAIL);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-left">
          <h1 className="text-2xl font-bold mb-1">아이디 조회 결과</h1>
          <p className="text-sm text-gray-500">
            인증 정보와 일치하는 아이디예요.
          </p>
        </div>

        <Card className="border-gray-100 shadow-sm">
          <CardContent className="space-y-6">
            {foundId ? (
              <div className="bg-gray-100 p-4 rounded-md flex items-center justify-between mb-10">
                <div>
                  <p className="text-sm text-gray-500 mb-1">아이디</p>
                  <p className="text-lg font-medium">{foundId}</p>
                </div>
                <div className="bg-green-500 rounded-full p-1">
                  <Check className="h-5 w-5 text-white" />
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-500">
                아이디를 불러올 수 없습니다.
              </p>
            )}

            <div className="space-y-3">
              <Button
                className="w-full bg-black hover:bg-gray-800 text-white py-2 rounded mt-5"
                onClick={() => router.push("/login")}
              >
                로그인하기
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-100 text-black py-2 rounded"
                onClick={() => router.push("/pwInquiry")}
              >
                비밀번호 재설정
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!errorMessage} onOpenChange={() => setErrorMessage("")}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>알림</DialogTitle>
              <DialogDescription>{errorMessage}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleDialogConfirm}>확인</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
