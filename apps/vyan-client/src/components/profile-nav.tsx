"use client";
import Image from "next/image";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "~/components/ui/navigation-menu";
import ProfileNavChild from "./profile-nav-child";
import { Button } from "@repo/ui/src/@/components/button";
import { signOut } from "next-auth/react";
import { redirect, usePathname, useRouter } from "next/navigation";
const profile = [
  {
    path: "/profile/edit-profile",
    img: "/icons/profile-nav/profile-nav.svg",
    title: "Edit Profile",
  },
  {
    path: "/profile/notification",
    img: "/icons/profile-nav/profile-notif.svg",
    title: "Notification",
  },
];
const account = [
  {
    path: "/profile/appointments",
    img: "/icons/profile-account/profile-cal.svg",
    title: "Appointments",
  },
];
interface IProfileProps {
  userProfile: {
    email: string;
    title: string;
  };
}
const ProfileNav = ({ email, name }: { email: string; name: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <>
      <div className="w-full xl:w-[343px] 2xl:w-[375px]">
        {/* image + email*/}
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
          <div className="w-8 ">
            <div
              className="relative aspect-square cursor-pointer"
              onClick={() => router.push("/profile/edit-profile")}
            >
              <Image
                fill={true}
                src="/profile-user.png"
                alt=""
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="font-poppins text-lg font-semibold text-active">
              {name}
            </div>
            <div className="font-inter text-sm font-normal text-inactive ">
              {email}
            </div>
          </div>
          </div>
          {/* Mobile menu toggle */}
          <button
            className="xl:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6 text-active"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <div className={`flex flex-col gap-6 ${isMenuOpen ? 'block' : 'hidden xl:block'}`}>
          {/* profile */}
          <div>
            <div className="mt-5 pl-5 font-poppins text-lg font-bold text-active">
              Profile
            </div>
            {profile &&
              profile.map((item, index) => {
                return (
                  <>
                    <div
                      key={index}
                      className={`hover:bg-[#E6F4EE] ${pathname === item.path ? "bg-[#E6F4EE]" : ""}`}
                    >
                      <div className="px-6 py-[14px]">
                        <ProfileNavChild profileChild={item} />
                      </div>
                    </div>
                  </>
                );
              })}
          </div>
          {/* Account */}
          <div>
            <div className="pl-5 font-poppins text-lg font-bold text-active">
              Account
            </div>
            {account &&
              account.map((item, index) => {
                return (
                  <>
                    <div
                      key={index}
                      className={`hover:bg-[#E6F4EE] ${pathname === item.path ? "bg-[#E6F4EE]" : ""}`}
                    >
                      <div className="px-6 py-[14px]">
                        <ProfileNavChild profileChild={item} />
                      </div>
                    </div>
                  </>
                );
              })}
          </div>
          <div className="mb-3 mt-3 px-3 text-center">
            <Button
              className="w-full rounded-xl border border-gray-200 bg-white py-[14px] font-poppins font-medium text-black shadow-sm transition-all hover:bg-primary hover:text-white hover:shadow-md"
              onClick={() => {
                signOut({ redirect: false }).then(() => router.push("/"));
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
export default ProfileNav;
