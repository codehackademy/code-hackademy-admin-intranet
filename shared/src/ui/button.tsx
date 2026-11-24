import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn.ts";

export const buttonVariants = cva(
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-ui border-2 px-5 py-2.5 text-sm font-bold transition-colors disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "border-ink bg-orange text-ink hover:bg-[#e84800]",
        dark: "border-ink bg-ink text-white hover:bg-charcoal",
        outline: "border-ink bg-white text-ink hover:bg-orange-soft",
        ghost: "border-transparent bg-transparent text-ink hover:bg-ink/5",
        danger: "border-danger bg-danger text-white hover:bg-[#8f1c12]",
      },
      size: { sm: "min-h-9 px-3 py-1.5 text-xs", md: "", lg: "min-h-12 px-7 text-base" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, type, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...(asChild ? {} : { type: type ?? "button" })} {...props} />;
});
Button.displayName = "Button";
