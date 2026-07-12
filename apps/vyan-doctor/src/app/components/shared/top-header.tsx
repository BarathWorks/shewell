"use client";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/src/@/components/dropdown-menu";
import { LogOut, User, RefreshCw, UserCheck } from "lucide-react";
import { env } from "~/env";

const TopHeader = () => {
  const { data: session } = useSession();

  // Temporary/mock avatar or initials
  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("")
    : "DR";

  return (
    <header className="fixed top-0 right-0 left-64 h-16 flex justify-between items-center px-lg bg-surface/80 backdrop-blur-md border-b border-outline-variant z-40 bg-white shadow-sm">
      {/* Search Field */}
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-outline">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input
            className="block w-full pl-10 pr-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-body-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all focus:outline-none"
            placeholder="Search patients or reports..."
            type="text"
          />
        </div>
      </div>

      {/* Right Side Tools */}
      <div className="flex items-center gap-md">
        {/* Notifications */}
        <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
        </button>

        <div className="h-8 w-[1px] bg-outline-variant"></div>

        {/* User Status Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-xs ml-md cursor-pointer hover:opacity-80">
              <div className="w-8 h-8 rounded-full border border-primary/20 bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                {userInitials}
              </div>
              <div className="flex flex-col">
                <span className="font-body-md font-bold text-on-surface leading-tight">
                  {session?.user?.name || "Dr. Vyank (Shewell)"}
                </span>
                <span className="text-label-caps text-[10px] text-on-surface-variant">
                  ADMINISTRATOR
                </span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">
                keyboard_arrow_down
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mt-2 w-56 rounded-xl border border-gray-100 bg-white p-2 shadow-xl" align="end">
            <DropdownMenuLabel className="mb-1 px-2 py-1.5 text-lg font-bold text-[#0E3A47]">
              Profile Action
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link
                href="/doctor-profile"
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:bg-gray-50"
              >
                <User className="h-4 w-4 stroke-[2]" />
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/edit-profile/personal-info"
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:bg-gray-50"
              >
                <UserCheck className="h-4 w-4 stroke-[2]" />
                Edit Profile
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
      </div>
    </header>
  );
};

export default TopHeader;
