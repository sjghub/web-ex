import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["paydeuk-s3-bucket.s3.ap-northeast-2.amazonaws.com"],
  },
  typescript: {
    ignoreBuildErrors: true, // 타입스크립트 오류 무시하고 빌드 진행
  },
};

export default nextConfig;
