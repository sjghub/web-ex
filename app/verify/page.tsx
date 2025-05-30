import { Suspense } from "react";
import VerifyPageClient from "./VerifyPageClient";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <VerifyPageClient />
    </Suspense>
  );
}
