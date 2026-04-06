import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant =
  | "active"
  | "inactive"
  | "revoked"
  | "pending"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "default";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
  size?: "sm" | "md";
}

const variantClasses: Record<BadgeVariant, string> = {
  active:   "bg-aqua-400/15  text-aqua-400  border-aqua-400/30",
  success:  "bg-aqua-400/15  text-aqua-400  border-aqua-400/30",
  inactive: "bg-ocean-400/15 text-ocean-200  border-ocean-400/30",
  default:  "bg-ocean-400/15 text-ocean-200  border-ocean-400/30",
  revoked:  "bg-coral-400/15 text-coral-400  border-coral-400/30",
  danger:   "bg-coral-400/15 text-coral-400  border-coral-400/30",
  pending:  "bg-amber-400/15 text-amber-400  border-amber-400/30",
  warning:  "bg-amber-400/15 text-amber-400  border-amber-400/30",
  info:     "bg-electric-400/15 text-electric-400 border-electric-400/30",
};

const dotColors: Record<BadgeVariant, string> = {
  active:   "bg-aqua-400",
  success:  "bg-aqua-400",
  inactive: "bg-ocean-300",
  default:  "bg-ocean-300",
  revoked:  "bg-coral-400",
  danger:   "bg-coral-400",
  pending:  "bg-amber-400",
  warning:  "bg-amber-400",
  info:     "bg-electric-400",
};

const sizeClasses = {
  sm: "text-[10px] px-2   py-0.5 gap-1",
  md: "text-xs    px-2.5 py-1   gap-1.5",
};

export function Badge({
  variant = "default",
  children,
  dot = false,
  size = "md",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        "transition-colors duration-200",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "rounded-full shrink-0",
            size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
            dotColors[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}
