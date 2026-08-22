"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeIndianRupee,
  ChevronRight,
  GraduationCap,
  Stethoscope,
  UserRound,
} from "lucide-react";

/**
 * Navigation between the four profile sections.
 *
 * This replaces a 631-line file. It was the same four links written out twice —
 * once under `block md:hidden`, once under `hidden md:block` — with each step's
 * icon pasted in as a raw multi-path `<svg>` at two sizes, and the connecting
 * line drawn with `after:-right-[25px] after:sm:-right-[50px]` pseudo-elements
 * whose offsets had to be re-tuned at each breakpoint.
 *
 * Two things were wrong beyond the length:
 *
 *  - Which step was current came from `?step=` in the query string compared as a
 *    *string* (`step > "1"`). String comparison would have broken at ten steps,
 *    but it broke sooner than that: nothing in the app ever set `?step=`, so
 *    `step` was null on every visit and no step ever highlighted. The current
 *    section now comes from the pathname, which is always right.
 *  - It was presented as a stepper — numbered, with progress lines between —
 *    but these four sections can be edited in any order and are all already
 *    complete. It reads as a section list, because that is what it is.
 */

const SECTIONS = [
  {
    href: "/edit-profile/personal-info",
    label: "Personal information",
    description: "Name, photo, contact details",
    Icon: UserRound,
  },
  {
    href: "/edit-profile/qualification",
    label: "Qualifications",
    description: "Degrees, experience, about you",
    Icon: GraduationCap,
  },
  {
    href: "/edit-profile/specialization",
    label: "Specialisations",
    description: "The areas you practise in",
    Icon: Stethoscope,
  },
  {
    href: "/edit-profile/prices",
    label: "Consultation fees",
    description: "What you charge, per mode",
    Icon: BadgeIndianRupee,
  },
] as const;

const StepperEditProfile = () => {
  const pathname = usePathname() ?? "";

  return (
    <nav aria-label="Profile sections" className="surface-card overflow-hidden">
      {/*
        One list, two behaviours. Below `md` it scrolls horizontally as a row of
        chips; from `md` up it is a vertical list in the sidebar. Same markup, so
        the two can never fall out of step the way the duplicated versions did.
      */}
      <ul className="flex gap-1 overflow-x-auto scrollbar-hide p-2 md:flex-col md:gap-0.5 md:overflow-visible">
        {SECTIONS.map(({ href, label, description, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href} className="shrink-0 md:shrink">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50",
                  isActive
                    ? "bg-primary-50 text-primary-800"
                    : "text-body hover:bg-slate-50 hover:text-ink",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors duration-200",
                    isActive
                      ? "bg-primary-600 text-white ring-primary-600"
                      : "bg-slate-100 text-muted ring-transparent group-hover:text-body",
                  ].join(" ")}
                >
                  <Icon className="size-[18px]" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block whitespace-nowrap text-sm font-medium md:whitespace-normal">
                    {label}
                  </span>
                  <span className="mt-0.5 hidden text-xs leading-relaxed text-muted md:block">
                    {description}
                  </span>
                </span>

                <ChevronRight
                  aria-hidden="true"
                  className={[
                    "hidden size-4 shrink-0 transition-transform duration-200 md:block",
                    isActive
                      ? "text-primary-500"
                      : "text-slate-300 group-hover:translate-x-0.5",
                  ].join(" ")}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default StepperEditProfile;
