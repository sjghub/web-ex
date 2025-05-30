"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";
import { Check, ChevronRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchWithoutAuth } from "@/lib/api-fetch";

const STORAGE_KEY = "verifiedUser";
const DEFAULT_ERROR_MSG = "본인인증 처리 중 오류가 발생했습니다.";
const REDIRECT_PW = "/pwInquiry";
const REDIRECT_DUP = "/";

interface IamportResponse {
  success: boolean;
  imp_uid: string;
  merchant_uid: string;
  error_msg?: string;
}

interface VerificationResponse {
  success: boolean;
  message: string;
  response?: {
    certified: boolean;
    birthday: string;
    name: string;
    phone: string;
    personalAuthKey: string;
    duplicate: boolean;
  };
}

declare global {
  interface Window {
    IMP: {
      init: (impKey: string) => void;
      certification: (
        params: {
          pg: string;
          merchant_uid: string;
          name: string;
          phone: string;
          min_age: number;
        },
        callback: (response: IamportResponse) => void,
      ) => void;
    };
  }
}

export default function VerifyIdentityPage({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  const [verificationStarted, setVerificationStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isIamportReady, setIsIamportReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (window.IMP) {
      const impKey = process.env.NEXT_PUBLIC_IAMPORT_IMP_KEY || "";
      window.IMP.init(impKey);
      setIsIamportReady(true);
    }
  }, []);

  const handleError = (message: string, redirect = false) => {
    setErrorMessage(message || DEFAULT_ERROR_MSG);
    setShouldRedirect(redirect);
  };

  const handleDialogConfirm = () => {
    setErrorMessage("");
    if (!shouldRedirect) return;
    router.push(type === "pwInquiry" ? REDIRECT_PW : REDIRECT_DUP);
  };

  const requestCertification = () => {
    if (!isIamportReady || !window.IMP) {
      handleError(
        "본인인증 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.",
      );
      return;
    }

    setIsLoading(true);
    window.IMP.certification(
      {
        pg: "inicis_unified",
        merchant_uid: "ORD_" + new Date().getTime(),
        name: "본인인증",
        phone: "",
        min_age: 19,
      },
      async (rsp: IamportResponse) => {
        if (!rsp.success) {
          handleError("본인인증에 실패했습니다.");
          setIsLoading(false);
          return;
        }

        try {
          const response = await fetchWithoutAuth(
            `/verification?imp_uid=${rsp.imp_uid}`,
          );
          const data = (await response.json()) as VerificationResponse;

          if (!response.ok || !data.success || !data.response) {
            handleError(data.message);
            return;
          }

          const user = data.response;

          if (type === "pwInquiry") {
            const storedKey = sessionStorage.getItem("personalAuthKey");
            if (!storedKey || storedKey !== user.personalAuthKey) {
              handleError(
                "인증 정보가 일치하지 않습니다. 다시 시도해주세요.",
                true,
              );
              return;
            }
          }

          if (type === "signup" && user.duplicate) {
            handleError("이미 가입된 사용자입니다.", true);
            return;
          }

          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          setVerificationStarted(true);
        } catch (err) {
          console.error("본인인증 처리 오류:", err);
          handleError(DEFAULT_ERROR_MSG);
        } finally {
          setIsLoading(false);
        }
      },
    );
  };

  return (
    <>
      <Script
        src="https://cdn.iamport.kr/js/iamport.payment-1.2.0.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.IMP?.init(process.env.NEXT_PUBLIC_IAMPORT_IMP_KEY || "");
          setIsIamportReady(true);
        }}
      />
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-left">
            <h1 className="text-2xl font-bold mb-1">본인인증</h1>
            <p className="text-sm text-gray-500">
              안전한 서비스 이용을 위해 본인인증을 진행해주세요.
            </p>
          </div>
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="py-4 space-y-4">
              <div
                className={`border-2 rounded-md p-6 text-center ${
                  verificationStarted
                    ? "border-green-500 bg-green-50"
                    : "border-red-500"
                }`}
              >
                <div className="flex justify-center mb-4">
                  <ShieldCheck
                    className={`h-12 w-12 ${
                      verificationStarted ? "text-green-500" : "text-red-500"
                    }`}
                  />
                </div>
                <p className="text-gray-800 font-medium">
                  안전한 금융 서비스 제공을 위해
                  <br />
                  본인인증이 필요합니다.
                </p>
              </div>

              <button
                className={`w-full border rounded-md p-4 flex justify-between items-center hover:bg-gray-50 transition-colors ${
                  verificationStarted ? "bg-gray-50" : ""
                }`}
                onClick={requestCertification}
                disabled={verificationStarted || isLoading || !isIamportReady}
              >
                <span className="font-medium">간편 본인인증</span>
                <span
                  className={`flex items-center ${
                    verificationStarted ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {verificationStarted ? (
                    <>
                      <Check className="mr-1 h-4 w-4" />
                      완료
                    </>
                  ) : (
                    <>
                      필요
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </span>
              </button>

              <Button
                className={`w-full mt-6 ${
                  verificationStarted
                    ? "bg-black text-white"
                    : "bg-gray-400 text-gray-200"
                }`}
                disabled={!verificationStarted}
                onClick={onSuccess}
              >
                다음
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

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
    </>
  );
}
