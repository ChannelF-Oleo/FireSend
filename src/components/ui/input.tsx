import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[#E8E6E3] bg-white/80 backdrop-blur-sm px-4 py-2 text-sm text-[#1A1818] transition-all duration-200",
          "placeholder:text-[#6B6966]/60",
          "focus:outline-none focus:border-[#FF4D00] focus:bg-white focus:ring-2 focus:ring-[#FF4D00]/10",
          "hover:border-[#D4D2CF]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F5F4F2]",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
