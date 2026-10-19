import React from "react";
import { Sparkles } from "lucide-react";

/**
 * Modern High-End Branded Loading Spinner
 */
export const LoadingSpinner = ({ size = "md", className = "", text = "" }) => {
  const sizeMap = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3.5 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Glowing Ambient Backdrop */}
        <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-md animate-pulse" />

        {/* Spinning Gradient Track */}
        <div
          className={`${sizeMap[size] || sizeMap.md} rounded-full border-2 border-slate-200/80 border-t-brand-600 border-r-indigo-500 animate-spin`}
        />

        {/* Center Sparkle Accent for large loaders */}
        {(size === "lg" || size === "xl") && (
          <div className="absolute inset-0 flex items-center justify-center text-brand-600">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
        )}
      </div>

      {text && (
        <p className="text-xs font-semibold text-slate-500 tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
