"use client";

import { useRouter } from "next/navigation";
import PincodeForm from "@/components/ui/pincode-form";
import { fetchWithAuth } from "@/lib/api-fetch";
import { useRef } from "react";

export default function SetPincodePage() {
  const router = useRouter();
  const pincodeFormRef = useRef<{ resetPassword: () => void }>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <PincodeForm
        title="간편 결제 비밀번호 설정"
        description="간편 결제 시 사용할 비밀번호를 입력해주세요."
        onBack={() => router.push("/card/register")}
        onComplete={async (paymentPinCode) => {
          try {
            const response = await fetchWithAuth("/user/payment-pin-code", {
              method: "POST",
              body: JSON.stringify({ paymentPinCode }),
            });

            if (!response.ok) {
              alert("비밀번호 설정에 실패했습니다.");
              pincodeFormRef.current?.resetPassword();
              return;
            }

            // 대표카드가 있는지 확인
            // const cardsResponse = await fetchWithAuth("/cards");
            // const cardsData = await cardsResponse.json();
            // const hasRepresent = cardsData.some(
            //   (card: { isRepresent: boolean }) => card.isRepresent
            // );

            // if (hasRepresent) {
            //   router.push("/card/change-represent-card");
            // } else {
            //   router.push("/card/set-represent-card");
            // }
          } catch (error) {
            console.error("PIN 코드 설정 실패:", error);
            alert("PIN 코드 설정 중 오류가 발생했습니다.");
            pincodeFormRef.current?.resetPassword();
          }
        }}
        validateHasPincode={true}
      />
    </div>
  );
}
