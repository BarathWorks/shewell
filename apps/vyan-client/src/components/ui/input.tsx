import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Text input.
 *
 * Like `Card`, this was written against shadcn token names — `border-input`,
 * `placeholder:text-muted-foreground`, `focus-visible:ring-ring`,
 * `file:text-foreground` — none of which exist in this app's config. The border
 * colour, the placeholder colour and the focus ring therefore all resolved to
 * nothing: the field showed a default browser border and no focus indication at
 * all, which is an accessibility problem as much as a visual one.
 *
 * Height is 44px (`h-11`) to match `Button`'s default so a field and its adjacent
 * button line up, and to clear the recommended minimum touch target. Font size
 * stays at 16px on small screens because anything smaller makes iOS Safari zoom
 * the viewport on focus.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-hairline-strong bg-surface px-3.5 py-2",
          "text-base text-ink shadow-control md:text-sm",
          "transition-[border-color,box-shadow] duration-200 ease-out",
          "placeholder:text-muted",
          "hover:border-slate-400",
          "focus-visible:border-primary-500 focus-visible:outline-none focus-visible:shadow-focus",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted",
          "aria-[invalid=true]:border-danger-500 aria-[invalid=true]:focus-visible:shadow-[0_0_0_3px_rgb(209_67_67/0.16)]",
          "file:mr-3 file:h-7 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:text-sm file:font-medium file:text-ink",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
