"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PincodeForm from "@/components/ui/pincode-form";
import { fetchWithoutAuth } from "@/lib/api-fetch";
import { useRef } from "react";

const SIGNUP_INFO_KEY = "signupInfo";
const VERIFIED_KEY = "verifiedUser";

export default function PincodePage() {
  const router = useRouter();
  const pincodeFormRef = useRef<{ resetPassword: () => void }>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const signupInfo = sessionStorage.getItem(SIGNUP_INFO_KEY);
    const verifiedInfo = sessionStorage.getItem(VERIFIED_KEY);

    if (!signupInfo || !verifiedInfo) {
      setErrorMessage("회원가입 정보가 없습니다.");
      setTimeout(() => router.push("/signup/info"), 2000);
    }
  }, [router]);

  const handleSignup = async (paymentPinCode: string) => {
    try {
      const signupInfo = JSON.parse(
        sessionStorage.getItem(SIGNUP_INFO_KEY) || "{}",
      );

      const response = await fetchWithoutAuth("/signup", {
        method: "POST",
        body: JSON.stringify({
          ...signupInfo,
          paymentPinCode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "회원가입에 실패했습니다.");
      }

      sessionStorage.clear();
      router.push("/login");
    } catch (error) {
      console.error("회원가입 실패:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "회원가입 중 오류가 발생했습니다.",
      );
      pincodeFormRef.current?.resetPassword();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <PincodeForm
        ref={pincodeFormRef}
        title="간편 결제 비밀번호 설정"
        description="간편 결제 시 사용할 비밀번호를 입력해주세요."
        onBack={() => router.push("/signup/info")}
        onComplete={handleSignup}
      />
      {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
    </div>
  );
}
