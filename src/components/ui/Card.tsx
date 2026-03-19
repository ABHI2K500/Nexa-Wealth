import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "glass-panel";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "glass-card", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border transition-all duration-300",
          variant === "glass" && "glass",
          variant === "glass-panel" && "glass-panel",
          variant === "glass-card" && "glass-card",
          variant === "default" && "bg-slate-900 border-slate-800",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";
