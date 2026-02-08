"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronDown, Search, User, Menu, X, LayoutDashboard, Calendar, BookOpen, LogOut, RefreshCw, UserCheck } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
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

const DoctorHeader = () => {
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

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

  return (
    <header className="relative sticky top-0 z-50 w-full bg-gradient-to-r from-[#0E3A47] to-[#13647A] shadow-md">
      <nav className="mx-auto flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="relative h-8 w-24 shrink-0 sm:h-10 sm:w-28 md:w-32">
          <Image
            src="/images/vyan-logo-white.png"
            alt="Shewell"
            fill
            className="object-contain"
          />
        </Link>

        {/* Navigation Links - Hidden on mobile */}
        <div className="hidden items-center gap-4 lg:flex lg:gap-6 xl:gap-8">
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors lg:text-base ${
              pathname === "/dashboard" ? "text-[#A5F3FC]" : "text-white hover:text-[#A5F3FC]"
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/doctor-profile"
            className={`text-sm font-medium transition-colors lg:text-base ${
              pathname === "/doctor-profile" ? "text-[#A5F3FC]" : "text-white hover:text-[#A5F3FC]"
            }`}
          >
            Profile
          </Link>

          {/* Appointments Dropdown */}
        <Link
            href="/appointment"
            className={`text-sm font-medium transition-colors lg:text-base ${
              pathname === "/appointment" ? "text-[#A5F3FC]" : "text-white hover:text-[#A5F3FC]"
            }`}
          >
            Appointments
          </Link>

        </div>

        {/* Right Side - Icons and Mobile Menu */}
        <div className="flex items-center gap-2 shrink-0 sm:gap-4">
          {/* Search Pill Button */}
          <div className="relative">
            {!isSearchOpen ? (
              <button
                className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[#0E3A47] shadow-sm transition-all duration-300 hover:bg-[#A5F3FC] hover:shadow-md"
                aria-label="Search"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4 stroke-[2.5]" />
                <span className="hidden text-sm font-semibold sm:inline">Search</span>
              </button>
            ) : (
              <div className="flex flex-col relative">
                <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-2 ring-[#00898F]/20">
                  <Search className="h-4 w-4 text-[#0E3A47] stroke-[2.5]" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-32 bg-transparent text-sm font-medium text-[#0E3A47] placeholder-gray-400 focus:outline-none sm:w-48"
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
                  <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-2 w-64 sm:w-72 rounded-xl border border-gray-100 bg-white shadow-xl z-50 overflow-hidden">
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
                            <span className="text-sm font-semibold text-[#0E3A47]">
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

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-full bg-transparent p-1 text-white transition-all duration-300 hover:bg-white/10 hover:text-[#A5F3FC] focus:outline-none"
                aria-label="User profile"
              >
                <User className="h-6 w-6 stroke-[1.5]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mt-2 w-56 rounded-xl border border-gray-100 bg-white p-2 shadow-xl" align="end">
              <DropdownMenuLabel className="mb-1 px-2 py-1.5 text-lg font-bold text-[#0E3A47]">
                Profile
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
              
              <DropdownMenuItem asChild>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-semibold text-[#0E3A47] transition-all hover:bg-gray-50 hover:shadow-sm focus:bg-gray-50"
                >
                  <LogOut className="h-4 w-4 stroke-[2]" />
                  Logout
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <button
            className="rounded-lg bg-[#1A8191] p-2 text-white transition-colors hover:bg-[#13647A] lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-[#13647A] bg-gradient-to-r from-[#0E3A47] to-[#13647A] px-3 py-4 sm:px-4 sm:py-6 lg:hidden">
          <div className="flex flex-col gap-3 sm:gap-4">
            <Link
              href="/"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:py-3 sm:text-base ${
                pathname === "/" ? "bg-[#1A8191] text-[#A5F3FC]" : "text-white hover:bg-[#1A8191]"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>

            <Link
              href="/doctor-profile"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:py-3 sm:text-base ${
                pathname === "/doctor-profile" ? "bg-[#1A8191] text-[#A5F3FC]" : "text-white hover:bg-[#1A8191]"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </Link>

            <button
              onClick={() => setIsAppointmentsOpen(!isAppointmentsOpen)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1A8191] sm:px-4 sm:py-3 sm:text-base"
            >
              Appointments
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isAppointmentsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isAppointmentsOpen && (
              <div className="flex flex-col gap-2 border-t border-[#1A8191] pt-2 pl-4 sm:pt-3 sm:pl-6">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-200 transition-colors hover:text-white hover:bg-[#1A8191] sm:px-4 sm:py-3 sm:text-base"
                  onClick={() => {
                    setIsAppointmentsOpen(false);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/appointment"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-200 transition-colors hover:text-white hover:bg-[#1A8191] sm:px-4 sm:py-3 sm:text-base"
                  onClick={() => {
                    setIsAppointmentsOpen(false);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Calendar className="h-4 w-4" />
                  Calendar
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1A8191] sm:px-4 sm:py-3 sm:text-base"
            >
              More
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isMoreOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isMoreOpen && (
              <div className="flex flex-col gap-2 border-t border-[#1A8191] pt-2 pl-4 sm:pt-3 sm:pl-6">
                <Link
                  href="/blogs"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-200 transition-colors hover:text-white hover:bg-[#1A8191] sm:px-4 sm:py-3 sm:text-base"
                  onClick={() => {
                    setIsMoreOpen(false);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <BookOpen className="h-4 w-4" />
                  Blogs
                </Link>
              </div>
            )}

            <hr className="border-[#1A8191]" />

            <Link
              href={env.NEXT_PUBLIC_USER + ""}
              target="_blank"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#A5F3FC] transition-colors hover:bg-[#1A8191] sm:px-4 sm:py-3 sm:text-base"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Switch to Client Portal
            </Link>

            {session.status === "authenticated" ? (
              <button
                onClick={() => {
                  signOut().then(() => router.push("/"));
                  setIsMobileMenuOpen(false);
                }}
                className="rounded-md px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-[#1A8191] hover:text-red-200 sm:px-4 sm:py-3 sm:text-base text-left"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-[#A5F3FC] transition-colors hover:bg-[#1A8191] sm:px-4 sm:py-3 sm:text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default DoctorHeader;
