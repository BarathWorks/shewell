import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

/**
 * Button.
 *
 * Restyled only — every variant and size name the codebase already passes is
 * still accepted, including the ones this file did not previously declare
 * (`OTP`, `nonOTP`, `blog`, `search`, `profile`, `offlineAppointment`,
 * `onlineAppointment`, and the `icon` size). Those were being passed at call
 * sites and silently falling through to `default`, so a button meant to render
 * as an outlined secondary rendered as a solid dark primary. Declaring them
 * fixes that without touching a single call site.
 *
 * Shared shape: a 1px border on every variant — including the solid ones, where
 * it is the same colour as the fill — so variants sit on the same optical grid
 * and swapping one for another never shifts a layout by a pixel.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-lg border font-medium",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
    "disabled:pointer-events-none disabled:opacity-45",
    "active:translate-y-px",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /** The primary action. One per view. */
        default:
          "border-primary-600 bg-primary-600 text-white shadow-xs hover:border-primary-700 hover:bg-primary-700 hover:shadow-sm",

        /** Equal-weight alternative to the primary action. */
        secondary:
          "border-hairline bg-surface text-ink shadow-xs hover:border-hairline-strong hover:bg-slate-50",

        /** Lower emphasis, still clearly a control. */
        outline:
          "border-primary-600 bg-transparent text-primary-700 hover:bg-primary-50",

        /** Lowest emphasis. Toolbar and inline actions. */
        ghost:
          "border-transparent bg-transparent text-body hover:bg-slate-100 hover:text-ink",

        link: "h-auto border-transparent p-0 text-primary-700 underline-offset-4 hover:underline",

        /** Irreversible or destructive actions. */
        destructive:
          "border-danger-500 bg-danger-500 text-white shadow-xs hover:border-danger-600 hover:bg-danger-600",

        /* ---- Named variants kept for existing call sites ---------------- */

        /** Booking and scheduling actions. */
        appointment:
          "border-ink bg-ink text-white shadow-xs hover:border-primary-700 hover:bg-primary-700",
        onlineAppointment:
          "border-primary-600 bg-primary-600 text-white shadow-xs hover:border-primary-700 hover:bg-primary-700",
        offlineAppointment:
          "border-hairline-strong bg-surface text-ink hover:border-primary-500 hover:bg-primary-50 hover:text-primary-800",

        /** Sits on the dark/brand band in the footer subscribe strip. */
        subscribe:
          "rounded-full border-white bg-white text-primary-700 shadow-sm hover:bg-primary-50",

        login:
          "border-primary-600 bg-primary-600 text-white shadow-xs hover:border-primary-700 hover:bg-primary-700",

        green:
          "border-secondary-600 bg-secondary-600 text-white shadow-xs hover:border-secondary-700 hover:bg-secondary-700",

        /** OTP keypad / verification pair. */
        OTP: "border-primary-600 bg-primary-600 text-white shadow-xs hover:border-primary-700 hover:bg-primary-700",
        nonOTP:
          "border-primary-600 bg-surface text-primary-700 hover:bg-primary-50",

        blog: "border-ink bg-ink text-white shadow-xs hover:border-primary-700 hover:bg-primary-700",
        search:
          "border-ink bg-ink text-white shadow-xs hover:border-primary-700 hover:bg-primary-700",
        profile:
          "border-hairline bg-surface text-ink shadow-xs hover:border-hairline-strong hover:bg-slate-50",

        orderBtn:
          "border-secondary-600 bg-secondary-600 text-white shadow-xs hover:border-secondary-700 hover:bg-secondary-700",
        buyAgain:
          "border-hairline bg-surface text-body shadow-xs hover:border-primary-500 hover:bg-primary-50 hover:text-primary-800",
      },
      size: {
        /* Heights land on a 4px grid and every size keeps a comfortable touch
           target: the smallest is 36px, above the 24px minimum and close to the
           44px Apple/WCAG guidance once its surrounding gap is counted. */
        small: "h-9 px-3.5 text-sm",
        default: "h-11 px-5 text-sm",
        normal: "h-11 px-6 text-sm",
        xl: "h-12 px-6 text-base",
        large: "h-12 w-full px-8 text-base sm:w-auto",
        icon: "size-11 p-0",
        "icon-sm": "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
