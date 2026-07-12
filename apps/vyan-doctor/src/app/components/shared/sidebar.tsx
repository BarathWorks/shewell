"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { getDoctorProfile } from "./get-doctor-profile-action";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [profile, setProfile] = React.useState<{
    firstName: string | null;
    lastName: string | null;
    media: { fileUrl: string | null } | null;
  } | null>(null);

  React.useEffect(() => {
    getDoctorProfile().then((data) => {
      if (data) {
        setProfile(data);
      }
    });
  }, []);

  const displayName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    : session?.user?.name || "Dr. Vyank (Shewell)";

  const profileImageUrl = profile?.media?.fileUrl;

  const userInitials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "DR";

  const navItems = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: "dashboard",
    },
    {
      name: "Appointments",
      href: "/appointment",
      icon: "calendar_today",
    },
  ];

  return (
    <aside
      className={`h-screen fixed left-0 top-0 flex flex-col py-md bg-surface border-r border-outline-variant z-50 bg-white transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div
        className={`px-md mb-xl flex items-center justify-between ${
          isCollapsed ? "flex-col gap-sm px-0" : ""
        }`}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-xs">
            <Image
              src="/images/vyan-logo.png"
              alt="Shewell Logo"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>
        )}
        <button
          onClick={onToggle}
          className={`p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors duration-200 ${
            isCollapsed ? "mt-2" : ""
          }`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="material-symbols-outlined text-xl">
            {isCollapsed ? "menu" : "menu_open"}
          </span>
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center gap-sm px-md py-sm transition-all duration-200 ${
                isCollapsed ? "justify-center px-0" : ""
              } ${
                isActive
                  ? "text-primary font-bold border-r-4 border-primary bg-primary-container/10"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {!isCollapsed && (
                <span className="font-body-md text-body-md">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile & Notifications */}
      <div
        className={`mt-auto border-t border-outline-variant pt-md px-md flex transition-all duration-300 ${
          isCollapsed
            ? "flex-col items-center gap-md px-0"
            : "items-center justify-between gap-sm"
        }`}
      >
        {/* Profile Link */}
        <Link
          href="/doctor-profile"
          title={isCollapsed ? "Doctor Profile" : undefined}
          className={`flex items-center gap-sm cursor-pointer hover:bg-surface-container p-xs rounded-lg transition-colors duration-200 ${
            isCollapsed ? "justify-center p-2" : "flex-1 min-w-0"
          }`}
        >
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={displayName}
              className="w-9 h-9 rounded-full object-cover border border-primary/20 flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full border border-primary/20 bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
              {userInitials}
            </div>
          )}
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-body-md font-bold text-on-surface truncate leading-tight">
                {displayName}
              </span>
              <span className="text-on-surface-variant font-body-sm text-xs truncate">
                View Profile
              </span>
            </div>
          )}
        </Link>

        {/* Notifications button */}
        <button
          title={isCollapsed ? "Notifications" : undefined}
          className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full relative flex-shrink-0 transition-colors duration-200"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
