"use client";

import { useState } from "react";
import Image from "next/image";
import ProfileNavChild from "./profile-nav-child";
import { Button } from "@repo/ui/src/@/components/button";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "~/store/cart.store";
import { LogOut, Menu, X, User as UserIcon } from "lucide-react";

const profile = [
  {
    path: "/profile/edit-profile",
    title: "Edit Profile",
  },
  {
    path: "/profile/manage-address",
    title: "Manage Addresses",
  },
  {
    path: "/profile/notification",
    title: "Notification",
  },
];

const account = [
  {
    path: "/profile/orders",
    title: "Orders",
  },
  {
    path: "/profile/appointments",
    title: "Appointments",
  },
];

const ProfileNav = ({ email, name }: { email: string; name: string }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { emptyCart } = useCartStore((state) => ({ emptyCart: state.emptyCart }));

  const getInitials = (userName: string) => {
    if (!userName) return "U";
    return userName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="w-full xl:w-[343px] 2xl:w-[375px]">
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:p-6">
        {/* User Profile Header Card */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div
              className="relative flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-[#E6F4EE] bg-[#E6F4EE] shadow-xs transition-transform hover:scale-105"
              onClick={() => router.push("/profile/edit-profile")}
            >
              <span className="font-poppins text-base font-bold text-[#00898F]">
                {getInitials(name)}
              </span>
            </div>
            <div className="flex flex-col">
              <span
                onClick={() => router.push("/profile/edit-profile")}
                className="cursor-pointer font-poppins text-base font-semibold text-[#181818] hover:text-[#00898F]"
              >
                {name || "User Profile"}
              </span>
              <span className="font-inter text-xs text-[#666666] truncate max-w-[190px]">
                {email || "user@example.com"}
              </span>
            </div>
          </div>

          {/* Mobile menu toggle button */}
          <button
            className="p-2 text-gray-600 hover:text-[#00898F] xl:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Navigation Content */}
        <div className={`mt-5 flex flex-col gap-6 ${isMenuOpen ? "block" : "hidden xl:block"}`}>
          {/* Profile Section */}
          <div>
            <h4 className="mb-2 font-poppins text-xs font-semibold uppercase tracking-wider text-gray-400">
              Profile
            </h4>
            <div className="flex flex-col gap-1">
              {profile.map((item, index) => (
                <ProfileNavChild key={index} profileChild={item} />
              ))}
            </div>
          </div>

          {/* Account Section */}
          <div>
            <h4 className="mb-2 font-poppins text-xs font-semibold uppercase tracking-wider text-gray-400">
              Account
            </h4>
            <div className="flex flex-col gap-1">
              {account.map((item, index) => (
                <ProfileNavChild key={index} profileChild={item} />
              ))}
            </div>
          </div>

          {/* Logout Action */}
          <div className="pt-2">
            <Button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50/60 py-3 font-poppins text-sm font-semibold text-red-600 shadow-xs transition-all hover:bg-red-100/80 hover:text-red-700 hover:shadow-sm"
              onClick={() => {
                signOut({ redirect: false }).then(() => router.push("/"));
                emptyCart();
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileNav;
