"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: [
    "relative bg-electric-400 text-ocean-900 font-semibold",
    "hover:bg-electric-300 active:bg-electric-500",
    "shadow-[0_0_20px_rgba(0,174,239,0.4)] hover:shadow-[0_0_30px_rgba(0,174,239,0.6)]",
    "border border-electric-300/30",
    "overflow-hidden",
  ].join(" "),

  secondary: [
    "glass text-ocean-100 font-medium",
    "hover:bg-ocean-600/60 hover:border-electric-400/40",
    "hover:shadow-[0_0_16px_rgba(0,174,239,0.2)]",
    "border border-ocean-400/30",
  ].join(" "),

  ghost: [
    "bg-transparent text-ocean-200 font-medium",
    "hover:bg-ocean-600/40 hover:text-ocean-50",
    "border border-transparent hover:border-ocean-500/30",
  ].join(" "),

  danger: [
    "bg-coral-400 text-white font-semibold",
    "hover:bg-coral-300 active:bg-coral-500",
    "shadow-[0_0_16px_rgba(255,82,82,0.3)] hover:shadow-[0_0_24px_rgba(255,82,82,0.5)]",
    "border border-coral-300/30",
  ].join(" "),

  outline: [
    "bg-transparent text-electric-400 font-medium",
    "border border-electric-400/50 hover:border-electric-400",
    "hover:bg-electric-400/10",
    "hover:shadow-[0_0_16px_rgba(0,174,239,0.2)]",
  ].join(" "),
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8  px-3   text-xs  rounded-lg  gap-1.5",
  md: "h-10 px-4   text-sm  rounded-xl  gap-2",
  lg: "h-12 px-6   text-base rounded-xl gap-2",
  xl: "h-14 px-8   text-lg  rounded-2xl gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      children,
      loading = false,
      icon,
      iconRight,
      className,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;

      /* Ripple effect */
      if (variant === "primary") {
        const btn = e.currentTarget;
        const ripple = document.createElement("span");
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.cssText = `
          position:absolute;
          width:${size}px;height:${size}px;
          left:${e.clientX - rect.left - size / 2}px;
          top:${e.clientY - rect.top - size / 2}px;
          border-radius:50%;
          background:rgba(255,255,255,0.25);
          pointer-events:none;
          animation: ripple 0.6s ease-out forwards;
        `;
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
      }

      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center",
          "transition-all duration-200 cursor-pointer",
          "focus-visible:outline-2 focus-visible:outline-electric-400/60 focus-visible:outline-offset-2",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner />
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
            {iconRight && <span className="shrink-0">{iconRight}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
