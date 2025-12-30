"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/90 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-[#1A1818] group-[.toaster]:border-[#E8E6E3] group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-[#6B6966]",
          actionButton:
            "group-[.toast]:bg-[#FF4D00] group-[.toast]:text-white group-[.toast]:rounded-lg",
          cancelButton:
            "group-[.toast]:bg-[#F5F4F2] group-[.toast]:text-[#6B6966] group-[.toast]:rounded-lg",
          success:
            "group-[.toaster]:border-emerald-200 group-[.toaster]:bg-emerald-50/90",
          error:
            "group-[.toaster]:border-red-200 group-[.toaster]:bg-red-50/90",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
