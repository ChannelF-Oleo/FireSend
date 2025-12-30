import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-xl border border-[#E8E6E3] bg-white/80 backdrop-blur-sm px-4 py-3 text-sm text-[#1A1818] transition-all duration-200 resize-none",
        "placeholder:text-[#6B6966]/60",
        "focus:outline-none focus:border-[#FF4D00] focus:bg-white focus:ring-2 focus:ring-[#FF4D00]/10",
        "hover:border-[#D4D2CF]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F5F4F2]",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
