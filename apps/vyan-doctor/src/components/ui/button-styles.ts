/**
 * Button styling, as a plain function.
 *
 * Deliberately *not* in `button.tsx`, and deliberately without `"use client"`.
 *
 * Every export of a `"use client"` module becomes a client reference — a proxy
 * the bundler swaps in so React can serialise it across the boundary. That is
 * exactly right for a component, and fatal for a helper: a server component that
 * imports `buttonClass` from a client module and calls it is invoking a proxy,
 * which throws during render. It is the kind of failure that only shows up at
 * runtime, on whichever pages happen to be server components.
 *
 * Split out here, both sides can use it: `button.tsx` for `<Button>`, and server
 * components directly for a `<Link>` that should look like one.
 */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline";

export type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-600 text-white shadow-xs hover:bg-primary-700 active:bg-primary-800",
  secondary:
    "bg-primary-50 text-primary-800 hover:bg-primary-100 active:bg-primary-200",
  outline:
    "border border-hairline-strong bg-surface text-body shadow-xs hover:border-primary-400 hover:bg-primary-50 hover:text-primary-800",
  ghost: "text-body hover:bg-slate-100 hover:text-ink",
  danger:
    "bg-danger-500 text-white shadow-xs hover:bg-danger-600 active:bg-danger-700",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-lg px-3 text-xs",
  md: "h-11 gap-2 rounded-lg px-4 text-sm",
  lg: "h-12 gap-2 rounded-lg px-5 text-sm",
};

const BASE = [
  "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap",
  "font-semibold transition-colors duration-200",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  "disabled:pointer-events-none disabled:opacity-55",
].join(" ");

export function buttonClass({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return [
    BASE,
    VARIANT[variant],
    SIZE[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
