import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#FF4D00] text-white shadow-md hover:bg-[#E64500] hover:shadow-lg hover:-translate-y-0.5",
        destructive:
          "bg-red-500 text-white shadow-md hover:bg-red-600 hover:shadow-lg",
        outline:
          "border-2 border-[#E8E6E3] bg-white/80 backdrop-blur-sm hover:bg-[#F9F8F6] hover:border-[#FF4D00] hover:text-[#FF4D00]",
        secondary: "bg-[#F5F4F2] text-[#1A1818] hover:bg-[#E8E6E3]",
        ghost: "hover:bg-[#F5F4F2] hover:text-[#1A1818]",
        link: "text-[#FF4D00] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2 rounded-xl",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-13 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
