"use client";

import { useRouter } from "next/navigation";
import PincodeForm from "@/components/ui/pincode-form";
import { fetchWithAuth } from "@/lib/api-fetch";
import { useRef } from "react";

export default function ChangePincodePage() {
  const router = useRouter();
  const pincodeFormRef = useRef<{ resetPassword: () => void }>(null);

  const handleForgotPassword = () => {
    // 본인인증 페이지로 이동하면서 type을 payPincode로 설정
    router.push("/verify?type=payPincode");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <PincodeForm
        ref={pincodeFormRef}
        title="간편 결제 비밀번호 확인"
        description="현재 간편 결제 비밀번호를 입력해주세요."
        onBack={() => router.push("/mypage")}
        onForgotPassword={handleForgotPassword}
        onComplete={async (paymentPinCode) => {
          try {
            const response = await fetchWithAuth(
              "/user/payment-pin-code/verify",
              {
                method: "POST",
                body: JSON.stringify({ paymentPinCode }),
              },
            );

            if (!response.ok) {
              alert("비밀번호가 일치하지 않습니다.");
              pincodeFormRef.current?.resetPassword();
              return;
            }

            router.push("/mypage/change-pay-pincode");
          } catch (error) {
            console.error("PIN 코드 검증 실패:", error);
            alert("PIN 코드 검증 중 오류가 발생했습니다.");
            pincodeFormRef.current?.resetPassword();
          }
        }}
        validateHasPincode={true}
      />
    </div>
  );
}
