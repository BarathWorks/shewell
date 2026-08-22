"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  User,
  UserCog,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/src/@/components/dropdown-menu";

import { LogoutDialog } from "./logout-dialog";
import { env } from "~/env";
import { useSession } from "next-auth/react";

/**
 * Site header.
 *
 * Visual rework only — the same links, the same state, the same session and env
 * usage as before.
 *
 * The band was a teal-to-navy gradient. A light header reads as the more clinical
 * choice and stops the masthead competing with page content for attention, but
 * `/home/Logo.png` is a pure-white knockout (every opaque pixel is #FFF), so on a
 * light background it would simply disappear. Rather than commission a second
 * asset, the mark is painted as a CSS mask: the PNG supplies the shape through
 * its alpha channel and `background-color` supplies the colour. Identical
 * geometry, any colour, one file.
 */

const NAV_LINKS = [
  { href: "/session", label: "Sessions" },
  { href: "/counselling", label: "Book Experts" },
] as const;

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        backgroundColor: "currentColor",
        WebkitMaskImage: "url(/home/Logo.png)",
        maskImage: "url(/home/Logo.png)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "left center",
        maskPosition: "left center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

export function Header() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  /**
   * Sign-out confirmation, and the account menu that opens it.
   *
   * Both are held here, for two separate reasons:
   *
   *  - Radix unmounts a dropdown's children on select, so a dialog nested inside
   *    a `DropdownMenuItem` is destroyed before it can open.
   *  - The menu is *controlled* because the item that opens the dialog calls
   *    `preventDefault()` on `onSelect` (otherwise Radix's own close races the
   *    dialog's focus trap). Preventing the default also prevents the close, and
   *    an open Radix menu keeps `pointer-events: none` on `<body>` — so the
   *    dialog would render with every one of its buttons unclickable. Closing
   *    the menu through its own state is what releases the body again.
   *
   * One dialog serves both the desktop menu and the mobile sheet.
   */
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const { data: session } = useSession();

  // Purely presentational: the header sits flat on the page until it starts to
  // overlap content, at which point a hairline and a shadow separate the two.
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full",
        "bg-surface/85 backdrop-blur-md backdrop-saturate-150",
        "border-b transition-[border-color,box-shadow] duration-300",
        isScrolled
          ? "border-hairline shadow-sm"
          : "border-transparent shadow-none",
      ].join(" ")}
    >
      <nav
        aria-label="Primary"
        className="container-page flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]"
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="Shewell — home"
          className="relative flex h-10 w-[7.5rem] shrink-0 items-center text-ink transition-colors duration-200 hover:text-primary-700 sm:w-[8.75rem]"
        >
          <Wordmark className="h-7 sm:h-8" />
        </Link>

        {/* Primary navigation — desktop */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative rounded-md px-3 py-2 text-sm font-medium text-body transition-colors duration-200 hover:bg-primary-50 hover:text-primary-800"
            >
              {link.label}
            </Link>
          ))}

          <div
            className="relative"
            onMouseEnter={() => setIsMoreOpen(true)}
            onMouseLeave={() => setIsMoreOpen(false)}
          >
            <button
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-body transition-colors duration-200 hover:bg-primary-50 hover:text-primary-800"
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              aria-expanded={isMoreOpen}
              aria-haspopup="true"
            >
              More
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isMoreOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isMoreOpen && (
              <div className="absolute left-0 top-full z-10 pt-2">
                <div className="w-52 overflow-hidden rounded-xl border border-hairline bg-surface p-1.5 shadow-lg">
                  <Link
                    href="/shefit"
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-body transition-colors duration-150 hover:bg-primary-50 hover:text-primary-800"
                    onClick={() => setIsMoreOpen(false)}
                  >
                    SheFit
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Search */}
          <div className="relative">
            {!isSearchOpen ? (
              <button
                className="flex size-10 items-center justify-center rounded-lg border border-transparent text-body transition-colors duration-200 hover:border-hairline hover:bg-slate-50 hover:text-ink"
                aria-label="Search"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-[18px] w-[18px]" />
              </button>
            ) : (
              <div className="absolute right-0 top-1/2 flex w-56 -translate-y-1/2 items-center gap-2 rounded-lg border border-primary-500 bg-surface px-3 shadow-focus sm:w-64">
                <Search className="h-[18px] w-[18px] shrink-0 text-muted" />
                <input
                  type="text"
                  placeholder="Search…"
                  className="h-10 w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
                  autoFocus
                  onBlur={() => setIsSearchOpen(false)}
                />
              </div>
            )}
          </div>

          {/*
            Account.

            Signed out this is still a link to sign-in. Signed in it is a menu:
            the icon used to go straight to /profile/edit-profile, which meant the
            site had no way to log out at all outside the profile sidebar.
          */}
          {session ? (
            <DropdownMenu
              open={isAccountMenuOpen}
              onOpenChange={setIsAccountMenuOpen}
            >
              <DropdownMenuTrigger asChild>
                <button
                  className="flex size-10 items-center justify-center rounded-lg border border-transparent text-body transition-colors duration-200 hover:border-hairline hover:bg-slate-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
                  aria-label="Account menu"
                >
                  <User className="h-[18px] w-[18px]" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="mt-2 w-60 rounded-xl border border-hairline bg-surface p-2 shadow-lg"
              >
                <DropdownMenuLabel className="mb-1 border-b border-hairline px-2 pb-2.5 pt-1.5">
                  <p className="text-2xs font-semibold uppercase tracking-[0.09em] text-muted">
                    Signed in as
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-ink">
                    {session.user?.email ?? session.user?.name ?? "Your account"}
                  </p>
                </DropdownMenuLabel>

                <DropdownMenuItem asChild>
                  <Link
                    href="/profile/edit-profile"
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-body transition-colors hover:bg-slate-50 hover:text-ink focus:bg-slate-50"
                  >
                    <UserCog className="size-4 shrink-0" />
                    Edit profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/profile/appointments"
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-body transition-colors hover:bg-slate-50 hover:text-ink focus:bg-slate-50"
                  >
                    <CalendarDays className="size-4 shrink-0" />
                    Appointments
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/profile/notification"
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-body transition-colors hover:bg-slate-50 hover:text-ink focus:bg-slate-50"
                  >
                    <Bell className="size-4 shrink-0" />
                    Notifications
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-hairline" />

                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    setIsAccountMenuOpen(false);
                    setIsLogoutOpen(true);
                  }}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-body transition-colors hover:bg-danger-50 hover:text-danger-700 focus:bg-danger-50 focus:text-danger-700"
                >
                  <LogOut className="size-4 shrink-0" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/auth/login"
              className="flex size-10 items-center justify-center rounded-lg border border-transparent text-body transition-colors duration-200 hover:border-hairline hover:bg-slate-50 hover:text-ink"
              aria-label="Sign in"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
          )}

          {/* Practitioner sign-up */}
          <Link
            href={env.NEXT_PUBLIC_PROFESSIONAL + ""}
            target="_blank"
            className="hidden h-10 items-center rounded-lg border border-hairline-strong px-3.5 text-sm font-medium text-body transition-colors duration-200 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-800 md:inline-flex lg:px-4"
          >
            Register as Therapist
          </Link>

          {/* Mobile menu */}
          <button
            className="flex size-10 items-center justify-center rounded-lg border border-transparent text-body transition-colors duration-200 hover:border-hairline hover:bg-slate-50 hover:text-ink lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-hairline bg-surface lg:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-3 text-[15px] font-medium text-ink transition-colors duration-150 hover:bg-primary-50 hover:text-primary-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="flex items-center justify-between rounded-lg px-3 py-3 text-[15px] font-medium text-ink transition-colors duration-150 hover:bg-primary-50 hover:text-primary-800"
              aria-expanded={isMoreOpen}
            >
              More
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isMoreOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isMoreOpen && (
              <div className="ml-3 flex flex-col gap-1 border-l border-hairline pl-3">
                <Link
                  href="/shefit"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-body transition-colors duration-150 hover:bg-primary-50 hover:text-primary-800"
                  onClick={() => {
                    setIsMoreOpen(false);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  SheFit
                </Link>
              </div>
            )}

            <div className="rule my-2" />

            {/* Account. The mobile sheet had no sign-out either. */}
            {session ? (
              <>
                <Link
                  href="/profile/edit-profile"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-ink transition-colors duration-150 hover:bg-primary-50 hover:text-primary-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserCog className="size-[18px] shrink-0" />
                  Edit profile
                </Link>

                <Link
                  href="/profile/appointments"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-ink transition-colors duration-150 hover:bg-primary-50 hover:text-primary-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <CalendarDays className="size-[18px] shrink-0" />
                  Appointments
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    // Close the sheet before asking, so the confirmation is not
                    // competing with a full-screen menu behind it.
                    setIsMobileMenuOpen(false);
                    setIsLogoutOpen(true);
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-[15px] font-medium text-body transition-colors duration-150 hover:bg-danger-50 hover:text-danger-700"
                >
                  <LogOut className="size-[18px] shrink-0" />
                  Log out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-ink transition-colors duration-150 hover:bg-primary-50 hover:text-primary-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="size-[18px] shrink-0" />
                Sign in
              </Link>
            )}

            <Link
              href={env.NEXT_PUBLIC_PROFESSIONAL + ""}
              target="_blank"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-hairline-strong px-4 text-sm font-medium text-body transition-colors duration-150 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Register as Therapist
            </Link>
          </div>
        </div>
      )}

      {/* One dialog for both menus. */}
      <LogoutDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen} />
    </header>
  );
}
