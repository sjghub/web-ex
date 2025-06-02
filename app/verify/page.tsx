import { Suspense } from "react";
import VerifyPageClient from "./VerifyPageClient"; // 실제 이름에 따라 조정
import Loading from "@/components/loading";

export default function VerifyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyPageClient />
    </Suspense>
  );
}
