"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchWithoutAuth } from "@/lib/api-fetch";

const REDIRECT_SUCCESS = "/verify?type=pwInquiry";
const REDIRECT_FAIL = "/pwInquiry";
const DEFAULT_ERROR_MESSAGE = "비밀번호 찾기 요청에 실패했습니다.";

interface ErrorResponse {
  message?: string;
  response?: {
    errors?: { field: string; message: string }[];
  };
}

export default function PasswordFindForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({ name: "", username: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleErrorResponse = (response: Response, data: ErrorResponse) => {
    if (response.status === 422 && data.response?.errors) {
      const fieldErrors: Record<string, string> = {};
      data.response.errors.forEach((err) => {
        fieldErrors[err.field] = err.message;
      });
      setErrors(fieldErrors);
    } else {
      setErrorMessage(data.message || DEFAULT_ERROR_MESSAGE);
      setShouldRedirect(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage("");
    setShouldRedirect(false);

    try {
      const response = await fetchWithoutAuth("/find-password", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        handleErrorResponse(response, data);
        return;
      }

      sessionStorage.setItem("pwInquiryName", "true");
      sessionStorage.setItem("findPasswordUsername", formData.username);
      sessionStorage.setItem("personalAuthKey", data.response.personalAuthKey);

      router.push(REDIRECT_SUCCESS);
    } catch (err) {
      console.error(err);
      setErrorMessage("비밀번호 찾기 요청 중 오류가 발생했습니다.");
      setShouldRedirect(true);
    }
  };

  const handleDialogConfirm = () => {
    setErrorMessage("");
    if (shouldRedirect) {
      router.push(REDIRECT_FAIL);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-left">
          <h1 className="text-2xl font-bold mb-1">비밀번호 찾기</h1>
          <p className="text-sm text-gray-500">이름과 아이디를 입력해주세요.</p>
        </div>

        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="py-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">아이디</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={formData.username}
                  onChange={handleChange}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-800 mt-4"
              >
                비밀번호 찾기
              </Button>
            </form>
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
