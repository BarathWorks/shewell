"use client";

import * as React from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

/**
 * Form controls for the practitioner app.
 *
 * These exist rather than `@repo/ui/.../form/*` because those set their border
 * with an inline `style={{ border: "1px solid rgba(233,233,233,1)" }}`. An inline
 * style outranks every class, so the shared input could not be given a focus
 * ring, an error state, or the app's hairline colour without editing a package
 * three apps share. They also had no error slot at all, which is why every form
 * in this app repeated `{errors.x && <p className="text-red-500">…}` by hand at a
 * different size and colour each time.
 *
 * What you get here: one control height (44px, comfortably above the 44px touch
 * target minimum), one focus treatment, and errors wired through `aria-invalid`
 * and `aria-describedby` so a screen reader announces them rather than leaving
 * them as red text floating near the field.
 */

const CONTROL_BASE = [
  "w-full rounded-lg border bg-surface text-sm text-ink",
  "placeholder:text-muted",
  "transition-[border-color,box-shadow] duration-200",
  "focus:outline-none focus:ring-0",
  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted",
].join(" ");

const CONTROL_TONE = {
  normal: "border-hairline-strong focus:border-primary-500 focus:shadow-focus",
  invalid: "border-danger-500 focus:border-danger-500 focus:shadow-none focus:ring-2 focus:ring-danger-500/25",
};

function toneFor(invalid?: boolean) {
  return invalid ? CONTROL_TONE.invalid : CONTROL_TONE.normal;
}

/* -------------------------------------------------------------------------- */
/* Field wrapper                                                               */
/* -------------------------------------------------------------------------- */

let fieldSeed = 0;

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium leading-none text-ink"
        >
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-0.5 text-danger-500">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {children}

      {error ? (
        <p className="flex items-start gap-1.5 text-xs font-medium text-danger-600">
          <AlertCircle aria-hidden="true" className="mt-px size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p className="text-xs leading-relaxed text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Text input                                                                  */
/* -------------------------------------------------------------------------- */

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  invalid?: boolean;
  /** Rendered inside the control, before the text. */
  leadingIcon?: React.ComponentType<{ className?: string }>;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, invalid, leadingIcon: Icon, ...props }, ref) => {
    if (!Icon) {
      return (
        <input
          ref={ref}
          aria-invalid={invalid || undefined}
          className={`${CONTROL_BASE} ${toneFor(invalid)} h-11 px-3.5 ${className ?? ""}`}
          {...props}
        />
      );
    }

    return (
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
        <input
          ref={ref}
          aria-invalid={invalid || undefined}
          className={`${CONTROL_BASE} ${toneFor(invalid)} h-11 pl-11 pr-3.5 ${className ?? ""}`}
          {...props}
        />
      </div>
    );
  },
);
TextInput.displayName = "TextInput";

/* -------------------------------------------------------------------------- */
/* Password input                                                              */
/* -------------------------------------------------------------------------- */

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  TextInputProps
>(({ className, invalid, leadingIcon: Icon, ...props }, ref) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative">
      {Icon ? (
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
      ) : null}

      <input
        ref={ref}
        type={isVisible ? "text" : "password"}
        aria-invalid={invalid || undefined}
        className={`${CONTROL_BASE} ${toneFor(invalid)} h-11 pr-11 ${Icon ? "pl-11" : "pl-3.5"} ${className ?? ""}`}
        {...props}
      />

      {/*
        A real <button>, not a bare <svg onClick>. The shared component used the
        latter, so the control could not be reached by keyboard and announced
        nothing — on a password field, the one place a user most often needs it.
      */}
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
});
PasswordInput.displayName = "PasswordInput";

/* -------------------------------------------------------------------------- */
/* Textarea                                                                    */
/* -------------------------------------------------------------------------- */

export const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(({ className, invalid, rows = 4, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    aria-invalid={invalid || undefined}
    className={`${CONTROL_BASE} ${toneFor(invalid)} resize-y px-3.5 py-2.5 leading-relaxed ${className ?? ""}`}
    {...props}
  />
));
TextArea.displayName = "TextArea";

/* -------------------------------------------------------------------------- */
/* Select                                                                      */
/* -------------------------------------------------------------------------- */

export const SelectInput = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(({ className, invalid, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={`${CONTROL_BASE} ${toneFor(invalid)} h-11 cursor-pointer appearance-none px-3.5 pr-10 ${className ?? ""}`}
      {...props}
    >
      {children}
    </select>
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
    >
      <path
        d="m5 7.5 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
));
SelectInput.displayName = "SelectInput";

/** Stable ids for label/control pairs in components that render lists of fields. */
export function useFieldId(prefix = "field") {
  const reactId = React.useId?.();
  const fallback = React.useRef<string>();
  if (!reactId && !fallback.current) fallback.current = `${prefix}-${++fieldSeed}`;
  return `${prefix}-${reactId ?? fallback.current}`;
}
