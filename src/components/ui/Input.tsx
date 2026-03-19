import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-3 rounded-xl bg-slate-900/40 border glass backdrop-blur-xl transition-all duration-300 outline-none text-white placeholder-slate-500 font-medium",
          error
            ? "border-rose-500/50 focus:border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
            : "border-slate-700 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
