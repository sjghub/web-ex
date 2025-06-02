import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 인증이 필요한 경로 설정
const AUTH_REQUIRED_PATHS = [
  "/dashboard",
  "/mycard",
  "/card-recommendation",
  "/card",
  "/card/",
  "/card/**",
  "/mypage",
];

// 관리자 권한이 필요한 경로 설정
const ADMIN_REQUIRED_PATHS = ["/admin"];

// 공개 경로 설정 (인증이 필요하지 않은 경로)
const PUBLIC_PATHS = ["/login", "/signup/terms"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // API 요청인 경우 백엔드에서 처리하도록 함
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 루트 페이지 접속 시 로그인 상태 체크
  if (pathname === "/") {
    if (accessToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 공개 경로는 접근 허용
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // 인증이 필요한 경로 체크
  const isAuthRequired = AUTH_REQUIRED_PATHS.some((path) => {
    if (path.endsWith("/**")) {
      // 와일드카드 패턴 처리
      const basePath = path.slice(0, -3);
      return pathname.startsWith(basePath);
    }
    return pathname.startsWith(path);
  });

  // 관리자 권한이 필요한 경로 체크
  const isAdminRequired = ADMIN_REQUIRED_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  // 인증이 필요한데 토큰이 없는 경우
  if (isAuthRequired && !accessToken) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // 관리자 권한이 필요한 경우 추가 검증
  if (isAdminRequired && accessToken) {
    try {
      // JWT 토큰에서 role 정보 추출
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      if (payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      // 토큰 파싱 실패 시 로그인 페이지로 리다이렉트
      console.error("토큰 파싱 중 오류 발생:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// 미들웨어가 적용될 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
