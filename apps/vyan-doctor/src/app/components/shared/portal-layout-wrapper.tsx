"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";
import TopHeader from "./top-header";
import DoctorHeader from "./doctor-header/doctor-header";
import Footer from "./footer";

const PortalLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Check if current route is part of clinical portal pages
  const isPortalRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/appointment") ||
    pathname.startsWith("/doctor-profile") ||
    pathname.startsWith("/edit-profile");

  if (isPortalRoute) {
    return (
      <div className="min-h-screen bg-brand-bg text-on-surface">
        <Sidebar />
        <TopHeader />
        {/* Content canvas offset by Sidebar (ml-64) and TopHeader (mt-16) */}
        <main className="ml-64 mt-16 p-lg max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)]">
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
