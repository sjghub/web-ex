
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(
      "https://internal-alb.example.com/service/api/card",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    const contentType = res.headers.get("content-type");

    const data = contentType?.includes("application/json")
      ? await res.json()
      : await res.text(); // HTML 등일 경우 텍스트로 받기
    console.log("🔍 raw response:", data);
    console.log("🔍 NextResponse.json(data) response:",NextResponse.json(data));
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Internal ALB fetch failed:", err);
    return NextResponse.json(
      { message: "서버 내부 오류", error: err.message || String(err) },
      { status: 500 },
    );
  }
}
