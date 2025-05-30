import { refreshAccessToken } from "./auth";

const API_URL_SERVICE = "http://localhost:8080/service/api";
const API_URL_AUTH = "http://localhost:8080/auth/api";

interface RequestOptions extends RequestInit {
  retryCount?: number;
}
type HeaderStrategy = "json" | "multipart" | "none";
export const fetchWithAuth = async (
  endpoint: string,
  options: RequestOptions = {},
  headerType: HeaderStrategy = "json", // 기본 json
  baseUrl: string = API_URL_SERVICE,
): Promise<Response> => {
  const { retryCount = 0, ...fetchOptions } = options;
  const accessToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("accessToken="))
    ?.split("=")[1];
  const headers: Record<string, string> = {
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...((options.headers || {}) as Record<string, string>),
  };

  if (headerType === "json") {
    headers["Content-Type"] = "application/json";
  }
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
      credentials: "include", // 쿠키를 포함하여 요청
    });

    if (response.status === 401) {
      const data = await response.json();

      // 토큰 만료 에러인 경우에만 재시도
      if (data.response?.errorCode === "AUT_02" && retryCount < 1) {
        const refreshSuccess = await refreshAccessToken();

        if (refreshSuccess) {
          // 토큰 재발급 성공 시 원래 요청 재시도
          return fetchWithAuth(endpoint, {
            ...options,
            retryCount: retryCount + 1,
          });
        }
      }
    }

    return response;
  } catch (error) {
    console.error("API 요청 실패:", error);
    throw error;
  }
};

// Authorization 헤더가 필요없는 API 호출을 위한 메서드
export const fetchWithoutAuth = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    console.log("API 요청:", `${API_URL_AUTH}${endpoint}`, options);
    const response = await fetch(`${API_URL_AUTH}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // 쿠키를 포함하여 요청
    });

    return response;
  } catch (error) {
    console.error("API 요청 실패:", error);
    throw error;
  }
};
