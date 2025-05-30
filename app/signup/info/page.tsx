"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
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

const VERIFIED_KEY = "verifiedUser";
const DEFAULT_ERROR_MSG = "회원가입 중 오류가 발생했습니다.";

export default function UserInfoPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    birthday: "",
    phone: "",
    personalAuthKey: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(VERIFIED_KEY);
    if (!stored) {
      setErrorMessage("본인인증을 먼저 진행해주세요.");
      router.replace("/verify");
      return;
    }

    try {
      const verified = JSON.parse(stored);
      const formattedBirthdate = verified.birthday.replace(/-/g, ".");
      const formattedPhone = verified.phone.replace(
        /^(\d{3})(\d{3,4})(\d{4})$/,
        "$1-$2-$3",
      );

      setFormData((prev) => ({
        ...prev,
        name: verified.name,
        birthday: formattedBirthdate,
        phone: formattedPhone,
        personalAuthKey: verified.personalAuthKey,
      }));
    } catch (err) {
      console.error("본인인증 세션 파싱 실패:", err);
      setErrorMessage("본인인증 정보가 올바르지 않습니다.");
      router.replace("/verify");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleErrorResponse = async (res: Response) => {
    const data = await res.json();
    if (res.status === 409) {
      setErrorMessage(data.message || "이미 사용 중인 아이디입니다.");
      return;
    }

    if (res.status === 422 && data.response?.errors) {
      const fieldErrors: Record<string, string> = {};
      data.response.errors.forEach(
        (err: { field: string; message: string }) => {
          fieldErrors[err.field] = err.message;
        },
      );
      setErrors(fieldErrors);
      return;
    }

    throw new Error();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "비밀번호가 일치하지 않습니다." });
      return;
    }

    try {
      const response = await fetchWithoutAuth("/auth/signup/verify", {
        method: "POST",
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          birthdate: formData.birthday,
          phone: formData.phone,
          personalAuthKey: formData.personalAuthKey,
        }),
      });

      if (!response.ok) {
        await handleErrorResponse(response);
        return;
      }

      // 회원가입 정보를 세션 스토리지에 저장
      sessionStorage.setItem(
        "signupInfo",
        JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          birthdate: formData.birthday,
          phone: formData.phone,
          personalAuthKey: formData.personalAuthKey,
        }),
      );

      router.push("/pincode");
    } catch (err) {
      console.error(err);
      setErrorMessage(DEFAULT_ERROR_MSG);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-left">
          <h1 className="text-2xl font-bold mb-1">회원가입</h1>
          <p className="text-sm text-gray-500">
            페이득 서비스 이용을 위한 계정을 만들어보세요.
          </p>
        </div>

        <Card className="border-gray-100 shadow-sm">
          <CardContent className="py-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  readOnly
                  className="bg-gray-50 text-gray-400 cursor-not-allowed !ring-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">생년월일</Label>
                <Input
                  id="birthdate"
                  name="birthdate"
                  value={formData.birthday}
                  readOnly
                  className="bg-gray-50 text-gray-400 cursor-not-allowed !ring-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  readOnly
                  className="bg-gray-50 text-gray-400 cursor-not-allowed !ring-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">
                  아이디 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  name="username" // userId → username
                  placeholder="아이디를 입력하세요"
                  value={formData.username}
                  onChange={handleChange}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  이메일 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  비밀번호 <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="영문 대소문자, 숫자, 특수문자를 포함한 8자 이상"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="비밀번호를 다시 입력하세요"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full mt-6 bg-black text-white">
                다음
              </Button>
            </form>
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-white" showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>회원가입 완료</DialogTitle>
              <DialogDescription>회원가입이 완료되었습니다.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Dialog open={!!errorMessage} onOpenChange={() => setErrorMessage("")}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>알림</DialogTitle>
              <DialogDescription>{errorMessage}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setErrorMessage("")}>확인</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
