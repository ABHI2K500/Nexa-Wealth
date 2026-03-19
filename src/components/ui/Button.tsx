"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<"button">> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps & HTMLMotionProps<"button">>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] border border-blue-400/30",
      secondary: "bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-600/50 backdrop-blur-md",
      danger: "bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30",
      ghost: "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-transparent",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-lg",
      md: "px-5 py-2.5 text-sm font-medium rounded-xl",
      lg: "px-8 py-3 text-base font-semibold rounded-xl",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative transition-colors duration-300 flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
