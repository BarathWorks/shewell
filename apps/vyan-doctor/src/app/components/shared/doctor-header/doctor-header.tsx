"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { env } from "~/env";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/src/@/components/dropdown-menu";
import { LogoutDialog } from "../logout-dialog";

/**
 * The mobile destinations, flat.
 *
 * Blogs is included for signed-in practitioners; signed-out visitors get it on
 * its own, because it is the only thing here they can actually open.
 */
const MOBILE_LINKS = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/appointment", label: "Appointments", Icon: Calendar },
  { href: "/doctor-profile", label: "Profile", Icon: UserCheck },
  { href: "/edit-profile/personal-info", label: "Edit profile", Icon: User },
  { href: "/blogs", label: "Blogs", Icon: BookOpen },
] as const;

const DoctorHeader = () => {
  // `isAppointmentsOpen` and `isMoreOpen` lived here to drive two accordions in
  // the mobile menu. That menu is a flat list now, so nothing reads them.
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  /**
   * Sign-out confirmation, and the account menu that opens it.
   *
   * Both are held here, and that is load-bearing in two different ways:
   *
   *  - The dialog cannot live inside the `DropdownMenuItem`, because Radix
   *    unmounts a menu's children the moment one is selected — the dialog would
   *    be torn down before it could open.
   *  - The menu has to be *controlled*, because the item that opens the dialog
   *    calls `preventDefault()` on its `onSelect` (otherwise Radix's own close
   *    races the dialog's focus trap). Preventing the default also prevents the
   *    close, and an open Radix menu holds `pointer-events: none` on `<body>` —
   *    so the dialog rendered, and every button in it was unclickable. Closing
   *    the menu explicitly is what releases the body again.
   */
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Whether to show the signed-in chrome.
   *
   * The navigation, the practitioner search and the profile menu used to render
   * unconditionally, so a signed-out visitor on /auth/login was shown Dashboard,
   * Profile, Appointments and a Logout button. Every one of those bounced straight
   * back to the login page, but the portal read as though it were already open —
   * which is exactly the impression a sign-in page must not give.
   *
   * `loading` is treated as signed out: it is the first render, and flashing the
   * full app chrome before the session resolves is the same problem in miniature.
   */
  const isAuthenticated = session.status === "authenticated";

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchResults, isLoading } = api.findDoctorsBasedOnSearch.findDoctorsBasedOnSearch.useQuery(
    { inputSearch: debouncedSearchTerm },
    { enabled: debouncedSearchTerm.length > 0 }
  );

  // Close search when mobile menu opens
  useEffect(() => {
    if (isMobileMenuOpen && isSearchOpen) {
      setIsSearchOpen(false);
      setSearchTerm("");
    }
  }, [isMobileMenuOpen, isSearchOpen]);

  // Light band with a hairline, matching the rest of the system. The mark is
  // `vyan-logo-white.png`, a white knockout that would vanish on a light ground,
  // so it is painted as a CSS mask: the PNG supplies the shape through its alpha
  // channel and `background-color` supplies the colour. Same asset, any colour.
  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline bg-surface/85 shadow-sm backdrop-blur-md backdrop-saturate-150">
      <nav aria-label="Primary" className="container-page flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Shewell — home"
          className="flex h-10 w-24 shrink-0 items-center text-ink transition-colors duration-200 hover:text-primary-700 sm:w-32"
        >
          <span
            aria-hidden="true"
            className="h-7 w-full sm:h-8"
            style={{
              display: "block",
              backgroundColor: "currentColor",
              WebkitMaskImage: "url(/images/vyan-logo-white.png)",
              maskImage: "url(/images/vyan-logo-white.png)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "left center",
              maskPosition: "left center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            }}
          />
        </Link>

        {/* Navigation Links - signed in only, hidden on mobile */}
        {isAuthenticated && (
        <div className="hidden items-center gap-4 lg:flex lg:gap-6 xl:gap-8">
          <Link
            href="/dashboard"
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
              pathname === "/dashboard"
                ? "bg-primary-50 text-primary-800"
                : "text-body hover:bg-primary-50 hover:text-primary-800"
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/doctor-profile"
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
              pathname === "/doctor-profile"
                ? "bg-primary-50 text-primary-800"
                : "text-body hover:bg-primary-50 hover:text-primary-800"
            }`}
          >
            Profile
          </Link>

          {/* Appointments Dropdown */}
        <Link
            href="/appointment"
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
              pathname === "/appointment"
                ? "bg-primary-50 text-primary-800"
                : "text-body hover:bg-primary-50 hover:text-primary-800"
            }`}
          >
            Appointments
          </Link>

        </div>
        )}

        {/* Right Side - Icons and Mobile Menu */}
        <div className="flex items-center gap-2 shrink-0 sm:gap-4">
          {/* Signed out: the only two things a visitor can actually do here. */}
          {!isAuthenticated && (
            <>
              <Link
                href="/auth/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-body transition-colors duration-200 hover:bg-primary-50 hover:text-primary-800"
              >
                Login
              </Link>
              <Link
                href="/auth/register/account-setup"
                className="rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-700"
              >
                Create account
              </Link>
            </>
          )}

          {/* Search Pill Button — the directory is not public. */}
          {isAuthenticated && (
          <div className="relative">
            {!isSearchOpen ? (
              <button
                className="flex h-10 items-center gap-2 rounded-lg border border-hairline-strong bg-surface px-3.5 text-body transition-colors duration-200 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-800 transition-all duration-300 hover:bg-primary-100 hover:shadow-md"
                aria-label="Search"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="size-4 shrink-0" />
                <span className="hidden text-sm font-medium sm:inline">Search</span>
              </button>
            ) : (
              <div className="flex flex-col relative">
                <div className="flex h-10 items-center gap-2 rounded-lg border border-primary-500 bg-surface px-3.5 shadow-focus ring-0 ring-primary-500/20">
                  <Search className="size-4 shrink-0 text-muted" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-32 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none sm:w-48"
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    // Delay blur to allow clicking on dropdown items
                    onBlur={() => setTimeout(() => {
                      if (!searchTerm) setIsSearchOpen(false);
                      setShowDropdown(false);
                    }, 200)}
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => {
                        setSearchTerm("");
                        setIsSearchOpen(false);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {showDropdown && searchTerm && (
                  <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-2 w-64 sm:w-72 rounded-xl border border-hairline bg-white shadow-xl z-50 overflow-hidden">
                    {isLoading || searchTerm !== debouncedSearchTerm ? (
                      <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                    ) : searchResults?.doctors && searchResults.doctors.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto">
                        {searchResults.doctors.map((doctor) => (
                          <Link
                            key={doctor.id}
                            href={`/doctor-profile/${doctor.userName}`}
                            className="flex flex-col gap-0.5 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchTerm("");
                              setShowDropdown(false);
                            }}
                          >
                            <span className="text-sm font-semibold text-ink">
                              {doctor.firstName} {doctor.lastName}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                              {/* Display specialization if available or just 'Doctor' */}
                               Doctor
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">No doctors found</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          )}

          {/* User Profile Dropdown */}
          {isAuthenticated && (
          <DropdownMenu open={isAccountMenuOpen} onOpenChange={setIsAccountMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                /*
                  Was `text-white` with a `hover:bg-white/10` — left over from the
                  dark gradient bar this header replaced. On the light band the
                  icon was white on white: the account menu had no visible trigger
                  at all.
                */
                className="flex size-10 items-center justify-center rounded-lg border border-transparent text-body transition-colors duration-200 hover:border-hairline hover:bg-slate-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
                aria-label="Account menu"
              >
                <User className="size-[18px]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mt-2 w-56 rounded-xl border border-hairline bg-white p-2 shadow-xl" align="end">
              <DropdownMenuLabel className="mb-1 border-b border-hairline px-2 pb-2.5 pt-1.5">
                <p className="text-2xs font-semibold uppercase tracking-[0.09em] text-muted">
                  Signed in as
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-ink">
                  {session.data?.user?.email ?? "Your account"}
                </p>
              </DropdownMenuLabel>
              
              <DropdownMenuItem asChild>
                <Link 
                  href="/edit-profile/personal-info" 
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:bg-gray-50"
                >
                  <UserCheck className="h-4 w-4 stroke-[2]" />
                  Edit-Profile
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link 
                  href={env.NEXT_PUBLIC_USER + ""} 
                  target="_blank"
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 stroke-[2]" />
                  Switch Account
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="my-1 bg-gray-100" />
              
              <DropdownMenuItem
                /*
                  Prevent Radix's own close, then close the menu through its
                  controlled state instead. See the note on `isAccountMenuOpen`.
                */
                onSelect={(event) => {
                  event.preventDefault();
                  setIsAccountMenuOpen(false);
                  setIsLogoutOpen(true);
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-body transition-colors hover:bg-danger-50 hover:text-danger-700 focus:bg-danger-50 focus:text-danger-700"
              >
                <LogOut className="size-4 shrink-0" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="flex size-10 items-center justify-center rounded-lg border border-transparent text-body transition-colors duration-200 hover:border-hairline hover:bg-slate-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 lg:hidden"
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

      {/*
        Mobile menu.

        This was a `bg-gradient-to-r from-[#0E3A47] to-[#13647A]` panel with white
        text — the palette of the dark header that this component replaced. Hanging
        below a light, translucent bar it read as a different site's navigation,
        and its "Logout" was `text-red-300`, a tint that only works on a dark
        ground. It is the same surface and the same type as the rest of the app now.

        The nesting also went: Dashboard and Calendar were hidden two levels down
        inside an "Appointments" accordion, and Blogs inside a "More" one, so the
        three most-used destinations took two taps each. They are a flat list.
      */}
      {isMobileMenuOpen && (
        <div className="border-t border-hairline bg-surface lg:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {isAuthenticated ? (
              <>
                {MOBILE_LINKS.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    aria-current={pathname === href ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium transition-colors duration-150 ${
                      pathname === href
                        ? "bg-primary-50 text-primary-800"
                        : "text-ink hover:bg-primary-50 hover:text-primary-800"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon aria-hidden="true" className="size-[18px] shrink-0" />
                    {label}
                  </Link>
                ))}

                <div className="my-2 h-px bg-hairline" />

                <Link
                  href={env.NEXT_PUBLIC_USER + ""}
                  target="_blank"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-body transition-colors duration-150 hover:bg-slate-50 hover:text-ink"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <RefreshCw aria-hidden="true" className="size-[18px] shrink-0" />
                  Switch to client portal
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    // Close the sheet first so the confirmation is not competing
                    // with a full-screen menu behind it, then ask.
                    setIsMobileMenuOpen(false);
                    setIsLogoutOpen(true);
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-[15px] font-medium text-body transition-colors duration-150 hover:bg-danger-50 hover:text-danger-700"
                >
                  <LogOut aria-hidden="true" className="size-[18px] shrink-0" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/blogs"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-ink transition-colors duration-150 hover:bg-primary-50 hover:text-primary-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BookOpen aria-hidden="true" className="size-[18px] shrink-0" />
                  Blogs
                </Link>

                <div className="my-2 h-px bg-hairline" />

                <Link
                  href="/auth/login"
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-hairline-strong px-4 text-sm font-semibold text-body transition-colors duration-150 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log in
                </Link>

                <Link
                  href="/auth/register/account-setup"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* One dialog for both menus. */}
      <LogoutDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen} />
    </header>
  );
};

export default DoctorHeader;
