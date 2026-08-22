import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Badge.
 *
 * Every variant previously resolved to the same thing: the base class hard-coded
 * `bg-[#FAFAFA] text-[#333333]`, and all four of `default`, `secondary`,
 * `destructive` and `outline` set only `border-gray-200` on top of it. So a
 * destructive badge and a default badge were pixel-identical, and status could
 * not be read from colour at all.
 *
 * They are distinct now, on the same tint-plus-hairline pattern so a row of mixed
 * badges still reads as one family. `address` and `selectedAddress` are kept for
 * the address picker.
 */
const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1",
    "text-xs font-medium leading-none",
    "transition-colors duration-200",
    "[&_svg]:size-3 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: "border-hairline bg-slate-50 text-body",
        secondary: "border-primary-100 bg-primary-50 text-primary-800",
        destructive: "border-danger-100 bg-danger-50 text-danger-700",
        outline: "border-hairline-strong bg-transparent text-body",
        success: "border-success-100 bg-success-50 text-secondary-700",
        warning: "border-warning-100 bg-warning-50 text-warning-600",
        info: "border-info-100 bg-info-50 text-info-600",

        address:
          "rounded-lg border-hairline-strong bg-surface px-3 py-2 text-sm font-medium text-ink hover:border-primary-400",
        selectedAddress:
          "rounded-lg border-secondary-600 bg-secondary-600 px-3 py-2 text-sm font-medium text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
