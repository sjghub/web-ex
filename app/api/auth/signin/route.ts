// POST /api/auth/signin → 내부 ALB 프록시
import { NextRequest, NextResponse } from "next/server";

const INTERNAL_ALB_AUTH_URL =
  "https://internal-alb.example.com/auth/api/signin";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const res = await fetch(INTERNAL_ALB_AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });

    // accessToken 쿠키가 ALB에서 왔을 경우 전달 (필요 시)
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch (err) {
    return NextResponse.json(
      { message: "인증 서버 호출 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
