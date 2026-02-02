"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Search, User, Menu, X } from "lucide-react";
import { env } from "~/env";

export function Header() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="relative sticky top-0 z-50 w-full bg-gradient-to-r from-[#0E3A47] to-[#13647A] shadow-md">
      <nav className="mx-auto flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="relative h-8 w-24 shrink-0 sm:h-10 sm:w-28 md:w-32">
          <img
            src="/home/Logo.png"
            alt="Shewell"
            className="h-full w-full object-contain"
          />
        </Link>

        {/* Navigation Links - Hidden on mobile */}
        <div className="hidden items-center gap-4 lg:flex lg:gap-6 xl:gap-8">
          <Link
            href="/session"
            className="text-sm font-medium text-white transition-colors hover:text-[#A5F3FC] lg:text-base"
          >
            Sessions
          </Link>

          <Link
            href="/counselling"
            className="text-sm font-medium text-white transition-colors hover:text-[#A5F3FC] whitespace-nowrap lg:text-base"
          >
            Book Experts
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setIsMoreOpen(true)}
            onMouseLeave={() => setIsMoreOpen(false)}
          >
            <button
              className="flex items-center gap-1 text-sm font-medium text-white transition-colors hover:text-[#A5F3FC] lg:text-base"
              onClick={() => setIsMoreOpen(!isMoreOpen)}
            >
              More
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isMoreOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isMoreOpen && (
              <div className="absolute left-0 top-full z-10 mt-1">
                <div className="w-48 rounded-md bg-white shadow-lg">
                  <Link
                    href="/shefit"
                    className="block rounded-t-md px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-[#f3f4f6]"
                    onClick={() => setIsMoreOpen(false)}
                  >
                    SheFit
                  </Link>
                  <Link
                    href="/products"
                    className="block rounded-b-md px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-[#f3f4f6]"
                    onClick={() => setIsMoreOpen(false)}
                  >
                    Products
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Icons and Mobile Menu */}
        <div className="flex items-center gap-2 shrink-0 sm:gap-3">
          {/* Search */}
          <div className="relative">
            {!isSearchOpen ? (
              <button
                className="rounded-full bg-[#1A8191] p-2 text-white transition-all duration-300 hover:bg-[#A5F3FC] hover:text-[#13647A] sm:p-2"
                aria-label="Search"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            ) : (
              <div className="absolute right-0 top-[-16px] sm:top-[-18px] flex items-center gap-2 rounded-full bg-[#1A8191] px-3 py-2 sm:px-4 sm:py-2">
                <Search className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-24 bg-transparent text-sm text-white placeholder-white/70 focus:outline-none sm:w-32 sm:text-base"
                  autoFocus
                  onBlur={() => setIsSearchOpen(false)}
                />
              </div>
            )}
          </div>

          {/* User Profile */}
          <Link
            href="/auth/login"
            className="rounded-full bg-[#1A8191] p-2 text-white transition-all duration-300 hover:bg-[#A5F3FC] hover:text-[#13647A]"
            aria-label="User profile"
          >
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>

          {/* Therapist Register - Hidden on small screens */}
          <Link
            href={env.NEXT_PUBLIC_PROFESSIONAL + ""}
            target="_blank"
            className="hidden px-2 py-1 text-xs text-[#FFFFFF99] transition-colors hover:text-white sm:px-3 sm:py-2 sm:block sm:text-sm md:whitespace-nowrap lg:text-base"
          >
            Therapist
          </Link>

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
              href="/session"
              className="rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1A8191] sm:px-4 sm:py-3 sm:text-base"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sessions
            </Link>

            <Link
              href="/counselling"
              className="rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1A8191] sm:px-4 sm:py-3 sm:text-base"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Book Experts
            </Link>

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
                  href="/shefit"
                  className="rounded-md px-3 py-2 text-sm text-gray-200 transition-colors hover:text-white hover:bg-[#1A8191] sm:px-4 sm:py-3 sm:text-base"
                  onClick={() => {
                    setIsMoreOpen(false);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  SheFit
                </Link>
                <Link
                  href="/products"
                  className="rounded-md px-3 py-2 text-sm text-gray-200 transition-colors hover:text-white hover:bg-[#1A8191] sm:px-4 sm:py-3 sm:text-base"
                  onClick={() => {
                    setIsMoreOpen(false);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Products
                </Link>
              </div>
            )}

            <hr className="border-[#1A8191]" />

            <Link
              href={env.NEXT_PUBLIC_PROFESSIONAL + ""}
              target="_blank"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#A5F3FC] transition-colors hover:bg-[#1A8191] sm:px-4 sm:py-3 sm:text-base"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Register as Therapist
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
