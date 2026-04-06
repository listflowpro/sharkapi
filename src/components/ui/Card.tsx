import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "elevated" | "bordered" | "shimmer";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantClasses: Record<CardVariant, string> = {
  default: [
    "glass rounded-2xl",
    "shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
  ].join(" "),

  elevated: [
    "glass rounded-2xl",
    "shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(42,90,138,0.2)]",
    "hover:shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_24px_rgba(0,174,239,0.15),0_0_0_1px_rgba(0,174,239,0.2)]",
  ].join(" "),

  bordered: [
    "bg-ocean-800/50 rounded-2xl",
    "border border-electric-400/30",
    "shadow-[0_0_0_1px_rgba(0,174,239,0.1),0_4px_24px_rgba(0,0,0,0.4)]",
    "hover:border-electric-400/50 hover:shadow-[0_0_20px_rgba(0,174,239,0.15)]",
  ].join(" "),

  shimmer: [
    "glass rounded-2xl overflow-hidden relative",
    "shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
    "before:absolute before:inset-0 before:shimmer-card before:pointer-events-none",
  ].join(" "),
};

const paddingClasses = {
  none: "",
  sm:   "p-4",
  md:   "p-6",
  lg:   "p-8",
};

export function Card({
  variant = "default",
  children,
  hover = false,
  padding = "md",
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "transition-all duration-300",
        variantClasses[variant],
        paddingClasses[padding],
        hover && "hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* Sub-components */
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
  return (
    <h3
      className={cn("text-lg font-semibold text-ocean-50", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }) {
  return (
    <p
      className={cn("text-sm text-ocean-200 mt-1", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        "mt-4 pt-4 border-t border-ocean-500/30 flex items-center gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
