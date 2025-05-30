"use client";

import { useRouter } from "next/navigation";
import PincodeForm from "@/components/ui/pincode-form";
import { fetchWithAuth } from "@/lib/api-fetch";
import { useRef } from "react";

export default function ChangePincodePage() {
  const router = useRouter();
  const pincodeFormRef = useRef<{ resetPassword: () => void }>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <PincodeForm
        ref={pincodeFormRef}
        title="간편 결제 비밀번호 변경"
        description="변경할 간편 결제 비밀번호를 입력해주세요."
        onBack={() => router.back()}
        onComplete={async (newPaymentPinCode) => {
          try {
            const response = await fetchWithAuth("/user/payment-pin-code", {
              method: "PATCH",
              body: JSON.stringify({ newPaymentPinCode }),
            });

            if (!response.ok) {
              alert("비밀번호 변경에 실패했습니다.");
              pincodeFormRef.current?.resetPassword();
              return;
            }

            alert("비밀번호가 성공적으로 변경되었습니다.");
            router.push("/mypage");
          } catch (error) {
            console.error("PIN 코드 변경 실패:", error);
            alert("PIN 코드 변경 중 오류가 발생했습니다.");
            pincodeFormRef.current?.resetPassword();
          }
        }}
      />
    </div>
  );
}
