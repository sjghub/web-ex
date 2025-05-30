import { Suspense } from "react";
import VerifyPageClient from "./VerifyPageClient"; // 실제 이름에 따라 조정

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPageClient />
    </Suspense>
  );
}
