"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, icon, iconRight, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-ocean-100"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 text-ocean-300 pointer-events-none z-10">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-xl h-10 px-3 text-sm",
              "bg-ocean-800/60 border border-ocean-500/40",
              "text-ocean-50 placeholder:text-ocean-300",
              "transition-all duration-200",
              "focus:outline-none focus:border-electric-400/60",
              "focus:shadow-[0_0_0_3px_rgba(0,174,239,0.12),0_0_12px_rgba(0,174,239,0.1)]",
              "focus:bg-ocean-800/80",
              "hover:border-ocean-400/60",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              error && "border-coral-400/60 focus:border-coral-400 focus:shadow-[0_0_0_3px_rgba(255,82,82,0.12)]",
              icon && "pl-9",
              iconRight && "pr-9",
              className
            )}
            {...props}
          />

          {iconRight && (
            <span className="absolute right-3 text-ocean-300 pointer-events-none">
              {iconRight}
            </span>
          )}
        </div>

        {(hint || error) && (
          <p
            className={cn(
              "text-xs",
              error ? "text-coral-400" : "text-ocean-300"
            )}
          >
            {error ?? hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

/* Textarea variant */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ocean-100">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl px-3 py-2.5 text-sm min-h-[100px] resize-y",
            "bg-ocean-800/60 border border-ocean-500/40",
            "text-ocean-50 placeholder:text-ocean-300",
            "transition-all duration-200",
            "focus:outline-none focus:border-electric-400/60",
            "focus:shadow-[0_0_0_3px_rgba(0,174,239,0.12)]",
            "hover:border-ocean-400/60",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            error && "border-coral-400/60",
            className
          )}
          {...props}
        />

        {(hint || error) && (
          <p className={cn("text-xs", error ? "text-coral-400" : "text-ocean-300")}>
            {error ?? hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
