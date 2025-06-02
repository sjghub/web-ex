"use client";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  message?: string;
  size?: "small" | "medium" | "large";
}

export default function Loading({
  className,
  message = "처리 중입니다",
  size = "medium",
}: LoadingProps) {
  const sizeClasses = {
    small: "text-xl",
    medium: "text-2xl",
    large: "text-4xl",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full h-full min-h-[200px] p-6",
        className,
      )}
    >
      <div className="flex items-center justify-center mb-4">
        <span className={cn("font-bold", sizeClasses[size])}>페이</span>
        <span
          className={cn(
            "font-bold animate-wiggle inline-block origin-center",
            sizeClasses[size],
          )}
        >
          득
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="relative w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-black animate-progress rounded-full"></div>
        </div>

        {message && <p className="text-sm text-gray-500 mt-2">{message}</p>}
      </div>
    </div>
  );
}
