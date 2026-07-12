"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();

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
    {
      name: "Profile",
      href: "/doctor-profile",
      icon: "groups",
    },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col py-md bg-surface border-r border-outline-variant z-50">
      {/* Brand Header */}
      <div className="px-md mb-xl">
        <div className="flex items-center gap-xs">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: "32px" }}>
            health_and_safety
          </span>
          <span className="font-headline-md text-headline-md font-bold text-primary">Shewell</span>
        </div>
        <p className="text-on-surface-variant font-body-sm pl-xs">Clinical Portal</p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-sm px-md py-sm transition-colors duration-200 ${
                isActive
                  ? "text-primary font-bold border-r-4 border-primary bg-primary-container/10"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body-md text-body-md">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
