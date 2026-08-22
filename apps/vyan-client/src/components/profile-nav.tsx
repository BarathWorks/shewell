"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Menu,
  User,
  X,
} from "lucide-react";

import { LogoutButton } from "./logout-dialog";

/**
 * Profile sidebar.
 *
 * Same three destinations and the same mobile toggle. Sign-out moved to
 * `LogoutButton`, which confirms first and is shared with the site header.
 *
 * Notes on what changed beyond the styling:
 *  - Each item's icon was a separate `.svg` fetched through `next/image`, so the
 *    sidebar cost three extra requests to draw three 24px glyphs. They are
 *    `lucide-react` icons now — already a dependency, and inlined into the bundle.
 *  - The two `.map()` calls wrapped every row in a redundant fragment and put the
 *    `key` on the div inside it rather than the outermost element, which React
 *    warns about and which defeats list reconciliation.
 *  - The active row was indicated only by a background tint. `aria-current` now
 *    carries it too.
 */

const PROFILE_LINKS = [
  { path: "/profile/edit-profile", Icon: User, title: "Edit Profile" },
  { path: "/profile/notification", Icon: Bell, title: "Notification" },
];

const ACCOUNT_LINKS = [
  { path: "/profile/appointments", Icon: CalendarDays, title: "Appointments" },
];

function NavGroup({
  label,
  items,
  pathname,
  onNavigate,
}: {
  label: string;
  items: { path: string; Icon: React.ComponentType<{ className?: string }>; title: string }[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <div>
      <h2 className="px-3 text-2xs font-semibold uppercase tracking-[0.09em] text-muted">
        {label}
      </h2>

      <ul className="mt-2 flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive = pathname === item.path;

          return (
            <li key={item.path}>
              <Link
                href={item.path}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50",
                  isActive
                    ? "bg-primary-50 text-primary-800"
                    : "text-body hover:bg-slate-50 hover:text-ink",
                ].join(" ")}
              >
                <item.Icon
                  className={[
                    "size-[18px] shrink-0",
                    isActive ? "text-primary-600" : "text-muted",
                  ].join(" ")}
                />
                <span className="flex-1">{item.title}</span>
                <ChevronRight
                  aria-hidden="true"
                  className={[
                    "size-4 shrink-0 transition-transform duration-200",
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
    </div>
  );
}

const ProfileNav = ({ email, name }: { email: string; name: string }) => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const initials =
    (name ?? "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <nav aria-label="Profile" className="surface-card overflow-hidden">
      {/* Identity */}
      <div className="flex items-center justify-between gap-3 border-b border-hairline p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            <p className="truncate text-xs text-muted">{email}</p>
          </div>
        </div>

        <button
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-hairline text-body transition-colors duration-200 hover:bg-slate-50 hover:text-ink xl:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={`flex-col gap-6 p-3 ${isMenuOpen ? "flex" : "hidden xl:flex"}`}
      >
        <NavGroup
          label="Profile"
          items={PROFILE_LINKS}
          pathname={pathname}
          onNavigate={() => setIsMenuOpen(false)}
        />
        <NavGroup
          label="Account"
          items={ACCOUNT_LINKS}
          pathname={pathname}
          onNavigate={() => setIsMenuOpen(false)}
        />

        {/*
          Ends the session, so it asks first — the previous version signed out on
          a single click of a row sitting directly under three ordinary
          navigation links, with no separation beyond a hairline and no undo.
          `LogoutButton` owns the confirmation; see `logout-dialog.tsx`.
        */}
        <div className="border-t border-hairline pt-3">
          <LogoutButton className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-body transition-colors duration-200 hover:bg-danger-50 hover:text-danger-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50" />
        </div>
      </div>
    </nav>
  );
};
export default ProfileNav;
