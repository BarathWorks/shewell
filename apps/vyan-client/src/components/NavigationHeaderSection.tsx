"use client";

import { ChevronDownIcon, SearchIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import Link from "next/link";

const navigationItems = [
  { label: "Service", hasDropdown: true, href: "#" },
  { label: "Book experts", hasDropdown: false, href: "/counselling" },
  { label: "Sessions", hasDropdown: false, href: "/session" },
  { label: "Product", hasDropdown: false, href: "/products" },
  { label: "SheFit", hasDropdown: false, href: "/shefit" },
  { label: "Blog", hasDropdown: false, href: "/blogs" },
];

export const NavigationHeaderSection = (): JSX.Element => {
  return (
    <header className="relative flex h-[70px] w-full flex-col items-start justify-center gap-3 bg-transparent bg-[linear-gradient(270deg,rgba(0,137,143,1)_0%,rgba(23,47,91,1)_100%),linear-gradient(0deg,rgba(51,51,51,1)_0%,rgba(51,51,51,1)_100%)] px-4 py-0 backdrop-blur-[37px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(37px)_brightness(100%)] sm:h-[80px] sm:gap-6 sm:px-8 lg:h-[100px] lg:px-[50px]">
      <div className="relative flex w-full items-center justify-between">
        <div className="relative h-6 w-[120px] sm:h-8 sm:w-[160px] lg:h-10 lg:w-[205.88px]">
          <img
            className="absolute left-0 top-px h-[22px] w-[22px] sm:h-[30px] sm:w-[30px] lg:h-[38px] lg:w-[37px]"
            alt="Vector"
            src="/vector-1.svg"
          />

          <div className="absolute left-[22px] top-[-16px] text-[32px] font-normal leading-[normal] tracking-[0] text-white [font-family:'Agbalumo',Helvetica] sm:left-[30px] sm:top-[-22px] sm:text-[44px] lg:left-[38px] lg:top-[-27px] lg:text-[55.5px]">
            hewell
          </div>
        </div>

        <nav className="relative hidden flex-[0_0_auto] items-center gap-6 lg:inline-flex xl:gap-10">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="relative inline-flex flex-[0_0_auto] cursor-pointer items-center gap-2 border-none bg-transparent px-2 py-4 transition-opacity hover:opacity-80 xl:gap-3 xl:px-3 xl:py-6"
            >
              <span className="relative mt-[-1.00px] w-fit whitespace-nowrap text-lg font-medium leading-7 tracking-[0] text-[#ffffff99] [font-family:'Poppins',Helvetica] xl:text-2xl xl:leading-9">
                {item.label}
              </span>
              {item.hasDropdown && (
                <ChevronDownIcon className="relative h-3 w-3 text-[#ffffff99]" />
              )}
            </Link>
          ))}
        </nav>

        <div className="relative flex h-[40px] w-auto items-center justify-end gap-3 sm:h-[50px] sm:gap-4 lg:h-[60px] lg:gap-6">
          <Button
            variant="ghost"
            // size="icon"
            className="relative inline-flex h-[40px] w-[40px] flex-[0_0_auto] items-center justify-center gap-3 rounded-[100px] bg-[#ffffff0d] px-2 py-0 hover:bg-[#ffffff1a] sm:h-[50px] sm:w-[50px] sm:px-3 lg:h-[60px] lg:w-[60px] lg:px-3.5"
          >
            <SearchIcon className="relative h-5 w-5 text-white sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
          </Button>

          <img
            className="relative h-[40px] w-[40px] cursor-pointer sm:h-[50px] sm:w-[50px] lg:h-[60px] lg:w-[60px]"
            alt="Frame"
            src="/frame-427319946.svg"
          />
        </div>
      </div>
    </header>
  );
};
