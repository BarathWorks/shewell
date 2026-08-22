"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import {
  buttonClass,
  type ButtonSize,
  type ButtonVariant,
} from "./button-styles";

/**
 * The application button.
 *
 * `@repo/ui`'s button carries thirteen bespoke variants — `OTP`, `nonOTP`,
 * `blog`, `offlineAppointment`, `onlineAppointment`, `profile`, `search` — most
 * of which are one screen's styling frozen into a shared package, and several of
 * which are hard-coded to `bg-black` or `bg-[#00898F]` rather than a token. Using
 * it here means every screen picks a different variant and the app ends up with
 * four button heights and three greens.
 *
 * This is the same five variants every design system has, sized on one scale,
 * coloured from the Tailwind theme, with a loading state that keeps its width so
 * a form does not jump when it submits.
 *
 * The class function itself lives in `button-styles.ts` — see the note there for
 * why it must not be exported from this file.
 */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  /** Shown instead of `children` while `isLoading`. */
  loadingText?: string;
  leadingIcon?: React.ComponentType<{ className?: string }>;
  trailingIcon?: React.ComponentType<{ className?: string }>;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size,
      fullWidth,
      isLoading = false,
      loadingText,
      leadingIcon: Leading,
      trailingIcon: Trailing,
      className,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={buttonClass({ variant, size, fullWidth, className })}
      {...props}
    >
      {isLoading ? (
        <Loader2 aria-hidden="true" className="size-4 shrink-0 animate-spin" />
      ) : Leading ? (
        <Leading className="size-4 shrink-0" />
      ) : null}

      {isLoading ? (loadingText ?? children) : children}

      {!isLoading && Trailing ? <Trailing className="size-4 shrink-0" /> : null}
    </button>
  ),
);
Button.displayName = "Button";

/** The same surface as a `<Button>`, for navigation rather than an action. */
export function ButtonLink({
  href,
  variant,
  size,
  fullWidth,
  leadingIcon: Leading,
  trailingIcon: Trailing,
  className,
  children,
  ...props
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: React.ComponentType<{ className?: string }>;
  trailingIcon?: React.ComponentType<{ className?: string }>;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link
      href={href}
      className={buttonClass({ variant, size, fullWidth, className })}
      {...props}
    >
      {Leading ? <Leading className="size-4 shrink-0" /> : null}
      {children}
      {Trailing ? <Trailing className="size-4 shrink-0" /> : null}
    </Link>
  );
}

export default Button;
