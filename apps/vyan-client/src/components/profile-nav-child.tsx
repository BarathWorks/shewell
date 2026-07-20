"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, User, MapPin, Bell, ShoppingBag, Calendar, LucideIcon } from "lucide-react";

interface IProfileChildProps {
  profileChild: {
    path: string;
    title: string;
    icon?: LucideIcon;
  };
}

const getIconForPath = (path: string): LucideIcon => {
  switch (path) {
    case "/profile/edit-profile":
      return User;
    case "/profile/manage-address":
      return MapPin;
    case "/profile/notification":
      return Bell;
    case "/profile/orders":
      return ShoppingBag;
    case "/profile/appointments":
      return Calendar;
    default:
      return User;
  }
};

const ProfileNavChild = ({ profileChild }: IProfileChildProps) => {
  const pathname = usePathname();
  const isActive = pathname === profileChild.path;
  const Icon = profileChild.icon || getIconForPath(profileChild.path);

  return (
    <Link
      href={profileChild.path}
      className={`group flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-200 ${
        isActive
          ? "bg-[#E6F4EE] text-[#00898F] font-semibold shadow-sm"
          : "text-gray-700 hover:bg-gray-50 hover:text-[#00898F] font-medium"
      }`}
    >
      <div className="flex items-center gap-3.5">
        <Icon
          className={`h-5 w-5 transition-colors ${
            isActive ? "text-[#00898F]" : "text-gray-500 group-hover:text-[#00898F]"
          }`}
        />
        <span className="font-poppins text-sm md:text-base">
          {profileChild.title}
        </span>
      </div>
      <ChevronRight
        className={`h-4 w-4 transition-transform duration-200 ${
          isActive
            ? "text-[#00898F] translate-x-0.5"
            : "text-gray-400 group-hover:text-[#00898F] group-hover:translate-x-0.5"
        }`}
      />
    </Link>
  );
};

export default ProfileNavChild;

