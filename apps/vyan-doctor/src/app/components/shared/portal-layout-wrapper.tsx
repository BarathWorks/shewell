"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";
import DoctorHeader from "./doctor-header/doctor-header";
import Footer from "./footer";

const PortalLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Check if current route is part of clinical portal pages
  const isPortalRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/appointment") ||
    pathname.startsWith("/doctor-profile") ||
    pathname.startsWith("/edit-profile");

  if (isPortalRoute) {
    return (
      <div className="min-h-screen bg-brand-bg text-on-surface">
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
        {/* Content canvas offset by Sidebar (ml-64 when open, ml-16 when collapsed) */}
        <main
          className={`transition-all duration-300 ease-in-out p-lg max-w-[1600px] mx-auto min-h-screen ${
            isCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          {children}
        </main>
      </div>
    );
  }

  // Default layout for public/auth/marketing pages
  return (
    <>
      <DoctorHeader />
      {children}
      <Footer />
    </>
  );
};

export default PortalLayoutWrapper;
