"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Drop-in replacements for `@repo/ui/.../form/{input,label,password-input}`.
 *
 * These keep the shared components' exact API — same props, same default export
 * shape — so a screen adopts the design system by changing its import path and
 * nothing else. That matters here because the registration wizard is seven long
 * forms of `<UIFormLabel>` / `<UIFormInput>` pairs; restructuring each one by hand
 * would be a large change with a large surface for mistakes, and this gets the
 * whole flow onto one control height, one border colour and one focus treatment
 * in a single line per file.
 *
 * They are local rather than a fix to `@repo/ui` because that package is shared
 * with the client and admin apps, which have their own themes; changing it would
 * restyle all three at once.
 *
 * What they fix relative to the shared originals:
 *  - The shared input sets its border with an inline
 *    `style={{ border: "1px solid rgba(233,233,233,1)" }}`. Inline styles outrank
 *    every class, so the border could not be themed or given an error state from
 *    the call site.
 *  - The shared password input's visibility toggle is a bare `<svg onClick>` —
 *    not focusable, and announcing nothing to a screen reader, on the one field
 *    where being able to check what you typed matters most.
 *  - Neither had a focus ring beyond `outline-primary`, which several call sites
 *    then overrode.
 *
 * New code should prefer `~/components/ui/field`, which also owns the label,
 * hint and error slots.
 */

const CONTROL = [
  "w-full rounded-lg border border-hairline-strong bg-surface px-3.5 text-sm text-ink",
  "placeholder:text-muted",
  "transition-[border-color,box-shadow] duration-200",
  "focus:border-primary-500 focus:shadow-focus focus:outline-none",
  "aria-[invalid=true]:border-danger-500",
  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted",
].join(" ");

interface IUIFormInput extends React.InputHTMLAttributes<HTMLInputElement> {}

export const UIFormInput = ({ className, type, ...props }: IUIFormInput) => (
  <input type={type} className={`${CONTROL} h-11 ${className ?? ""}`} {...props} />
);

interface IUILabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const UIFormLabel = ({
  children,
  className,
  ...props
}: IUILabelProps) => (
  <label
    className={`mb-1.5 block text-sm font-medium leading-none text-ink ${className ?? ""}`}
    {...props}
  >
    {children}
  </label>
);

interface IUIInputPasswordProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const UIFormPasswordInput = ({
  className,
  ...props
}: IUIInputPasswordProps) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative w-full">
      <input
        type={isVisible ? "text" : "password"}
        className={`${CONTROL} h-11 pr-11 ${className ?? ""}`}
        {...props}
      />

      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors duration-200 hover:bg-slate-100 hover:text-ink"
      >
        {isVisible ? (
          <EyeOff aria-hidden="true" className="size-[18px]" />
        ) : (
          <Eye aria-hidden="true" className="size-[18px]" />
        )}
      </button>
    </div>
  );
};

export default UIFormInput;
