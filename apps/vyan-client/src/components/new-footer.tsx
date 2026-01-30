"use client";
import React from "react";

export default function NewFooter() {
  return (
    <footer className="bg-[#1A1A1A] pb-6 pt-10 text-white sm:pb-8 sm:pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Top Section */}
        <div className="mb-8 flex flex-col gap-8 sm:mb-12 sm:gap-10 lg:mb-16 lg:gap-12 lg:flex-row lg:items-start lg:justify-between">
          {/* Brand & Socials */}
          <div className="w-full sm:w-auto lg:w-1/3">
            <div className="relative mb-4 h-10 w-20 sm:mb-6 sm:h-12 sm:w-24 md:h-14 md:w-28">
              <img
                src="/home/Logo.png"
                alt="Shewell"
                className="h-full w-full object-contain brightness-0 invert"
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
              <a
                href="https://x.com/shewellcare"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-white sm:gap-2 sm:text-sm"
              >
                <div className="rounded-full bg-white p-1.5 text-black sm:p-2">
                  <img src="/icons/x.svg" alt="X" width={14} height={14} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <span className="hidden sm:inline">X</span>
              </a>
              <a
                href="https://www.instagram.com/shewellcare"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-white sm:gap-2 sm:text-sm"
              >
                <div className="rounded-full bg-white p-1.5 text-black sm:p-2">
                  <img src="/icons/insta.svg" alt="Instagram" width={14} height={14} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <span className="hidden sm:inline">Instagram</span>
              </a>
              <a
                href="https://www.facebook.com/people/Shewellcare/61566486577092"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-white sm:gap-2 sm:text-sm"
              >
                <div className="rounded-full bg-white p-1.5 text-black sm:p-2">
                  <img src="/icons/facebook.svg" alt="Facebook" width={14} height={14} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <span className="hidden sm:inline">Facebook</span>
              </a>
              <a
                href="https://www.youtube.com/@Shewellcare"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-white sm:gap-2 sm:text-sm"
              >
                <div className="rounded-full bg-white p-1.5 text-black sm:p-2">
                  <img src="/icons/youtube.svg" alt="YouTube" width={14} height={14} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <span className="hidden sm:inline">YouTube</span>
              </a>
            </div>
          </div>

          {/* Links & Contact - Responsive Grid */}
          <div className="flex flex-col gap-6 w-full sm:gap-8 sm:w-auto lg:w-2/3 md:flex-row md:justify-end md:gap-12 lg:gap-16">
            <div>
              <h4 className="mb-3 text-base font-light sm:mb-4 sm:text-lg md:text-xl lg:text-2xl">Quick Links</h4>
              <ul className="flex flex-col gap-2 text-xs text-gray-300 sm:gap-3 sm:text-sm md:text-base">
                <li>
                  <a href="#" className="transition-colors hover:text-[#167D71]">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-[#167D71]">
                    Recipe
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-[#167D71]">
                    Reviews
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-base font-light sm:mb-4 sm:text-lg md:text-xl lg:text-2xl">Contact</h4>
              <ul className="space-y-2 text-xs text-gray-300 sm:space-y-3 sm:text-sm md:text-base">
                <li className="leading-relaxed">123 colony Gurgram, Haryana- 122001</li>
                <li>
                  <a href="mailto:abcdvyan@gmail.com" className="transition-colors hover:text-[#167D71]">
                    abcdvyan@gmail.com
                  </a>
                </li>
                <li>
                  <a href="tel:+911234567890" className="transition-colors hover:text-[#167D71]">
                    +91-1234567890
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-700 my-6 sm:my-8 md:my-10" />

        {/* Bottom Bar - Responsive */}
        <div className="flex flex-col items-center justify-between gap-4 pt-4 text-xs text-gray-500 sm:gap-6 sm:pt-6 md:pt-8 md:flex-row md:gap-0">
          <div className="flex flex-wrap justify-center gap-4 md:justify-start sm:gap-6 md:gap-8">
            <a href="/terms" className="transition-colors hover:text-white">
              Terms & Conditions
            </a>
            <a href="/privacy-policy" className="transition-colors hover:text-white">
              Privacy Policy
            </a>
          </div>
          <div className="text-center md:text-right">2025 &copy; All Rights Reserved</div>
        </div>
      </div>
    </footer>
  );
}
