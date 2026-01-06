import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-[#FAFAFA] text-[#333333] hover:border-[#00898F]",
  {
    variants: {
      variant: {
        default:
          "border-gray-200",
        secondary:
          "border-gray-200",
        destructive:
          "border-gray-200",
        outline: "border-gray-200",
        address: "font-inter font-medium text-sm text-active py-2 px-3 rounded-md border border-[#D2D2D2]", 
        selectedAddress: "font-inter font-medium text-sm text-white bg-secondary rounded-md py-2 px-3"
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

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
