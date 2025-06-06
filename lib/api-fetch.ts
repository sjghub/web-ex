import { refreshAccessToken } from "@/lib/auth";

const API_PROXY_AUTH = "/api/auth";
const API_PROXY_SERVICE = "/api/service";

interface RequestOptions extends RequestInit {
  retryCount?: number;
}
type HeaderStrategy = "json" | "multipart" | "none";

export const fetchWithAuth = async (
  endpoint: string,
  options: RequestOptions = {},
  headerType: HeaderStrategy = "json",
  baseUrl: string = API_PROXY_SERVICE,
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
    const response = await fetch(`/api${endpoint}`, {
      ...fetchOptions,
      headers,
      credentials: "include",
    });

    if (response.status === 401) {
      const data = await response.json();

      if (data.response?.errorCode === "AUT_02" && retryCount < 1) {
        const refreshSuccess = await refreshAccessToken();

        if (refreshSuccess) {
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

export const fetchWithoutAuth = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });
    return response;
  } catch (error) {
    console.error("API 요청 실패:", error);
    throw error;
  }
};
