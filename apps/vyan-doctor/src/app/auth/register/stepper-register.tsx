"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";

/**
 * Registration progress.
 *
 * The steps are derived from the pathname first, falling back to `?step=` only
 * when the path is not one of the known routes. That order matters: the forms set
 * `?step=` on the *next* page when they navigate, so anyone arriving by any other
 * means — a bookmark, a browser back button, a link from the login screen's
 * "verify your email" notice — had no parameter and the stepper silently fell
 * back to showing step 1 while displaying step 4's form.
 *
 * Visually it was seven 40px circles, filled ones numbered and unfilled ones
 * blank `#D2D2D2` discs with the number omitted entirely, joined by absolutely
 * positioned `after:left-[40px]` lines that only lined up at one width. It is a
 * proportional bar with a "Step n of 7" label — legible at any width, and it says
 * how much is left, which seven discs never did.
 */

const STEPS = [
  { path: "/auth/register/account-setup", label: "Account setup" },
  { path: "/auth/register/personal-info", label: "Personal info" },
  { path: "/auth/register/address", label: "Address" },
  { path: "/auth/register/identity-documents", label: "Identity & documents" },
  { path: "/auth/register/education", label: "Education" },
  { path: "/auth/register/practice-details", label: "Practice details" },
  { path: "/auth/register/bank-details", label: "Bank details" },
] as const;

const StepperRegister = () => {
  const pathname = usePathname() ?? "";
  const params = useSearchParams();

  const indexFromPath = STEPS.findIndex(
    (step) => pathname === step.path || pathname.startsWith(`${step.path}/`),
  );

  const parsedParam = Number.parseInt(params?.get("step") ?? "", 10);
  const indexFromParam =
    Number.isInteger(parsedParam) && parsedParam >= 1 && parsedParam <= STEPS.length
      ? parsedParam - 1
      : -1;

  const currentIndex =
    indexFromPath >= 0 ? indexFromPath : indexFromParam >= 0 ? indexFromParam : 0;

  const current = STEPS[currentIndex]!;
  const completed = currentIndex;
  const percent = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{current.label}</p>
        <p className="tabular shrink-0 text-xs font-medium text-muted">
          Step {currentIndex + 1} of {STEPS.length}
        </p>
      </div>

      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={currentIndex + 1}
        aria-label={`Registration progress: ${current.label}`}
        className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className="h-full rounded-full bg-primary-600 transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* The remaining steps, named. Seven unlabelled discs told a practitioner
          how many screens were left but nothing about what they would be asked. */}
      <ol className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {STEPS.map((step, index) => {
          const isDone = index < completed;
          const isCurrent = index === currentIndex;

          return (
            <li
              key={step.path}
              aria-current={isCurrent ? "step" : undefined}
              className={[
                "inline-flex items-center gap-1 text-2xs font-medium",
                isCurrent
                  ? "text-primary-700"
                  : isDone
                    ? "text-secondary-600"
                    : "text-muted/70",
              ].join(" ")}
            >
              {isDone ? (
                <Check aria-hidden="true" className="size-3 shrink-0" />
              ) : (
                <span
                  aria-hidden="true"
                  className={`size-1.5 shrink-0 rounded-full ${
                    isCurrent ? "bg-primary-600" : "bg-slate-300"
                  }`}
                />
              )}
              {step.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default StepperRegister;
