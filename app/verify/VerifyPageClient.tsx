"use client";

import VerifyIdentity from "@/components/verify";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function VerifyPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  useEffect(() => {
    const validTypes = ["signup", "idInquiry", "pwInquiry"];
    if (!type || !validTypes.includes(type)) {
      router.replace("/");
      return;
    }

    if (type === "signup" && sessionStorage.getItem("agreeTerms") !== "true") {
      router.replace("/signup/terms");
    }

    if (
      type === "pwInquiry" &&
      sessionStorage.getItem("pwInquiryName") !== "true"
    ) {
      router.replace("/pwInquiry");
    }
  }, [type, router]);

  const getSuccessPath = () => {
    switch (type) {
      case "signup":
        return "/signup/info";
      case "idInquiry":
        return "/idInquiry";
      case "pwInquiry":
        return "/pwInquiry/reset";
      default:
        return "/";
    }
  };

  return <VerifyIdentity onSuccess={() => router.push(getSuccessPath())} />;
}
