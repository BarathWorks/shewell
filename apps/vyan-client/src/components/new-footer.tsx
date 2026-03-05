"use client";
import React from "react";

export default function NewFooter() {
  return (
    <footer className="bg-[#1A1A1A] pb-6 pt-8 text-white sm:pb-8 sm:pt-10 md:pb-10 md:pt-12">
      <div className=" px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16">
        {/* Top Section */}
        <div className="mb-8 flex flex-col gap-8 sm:mb-10 sm:gap-10 md:mb-12 lg:mb-14 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          {/* Brand & Socials */}
          <div className="w-full lg:w-[50%]">
            <div className="flex flex-col gap-0">
              <div className="relative h-14 w-28 sm:h-16 sm:w-32 md:h-20 md:w-40 lg:h-24 lg:w-48">
                <img
                  src="/home/Logo.png"
                  alt="Shewell"
                  className="h-full w-full object-contain brightness-0 invert"
                />
              </div>
              <p className="mb-12 text-sm text-gray-400 sm:text-base md:mb-16 md:text-base lg:pr-8">
                Empowering motherhood with care, expertise, and support every
                step of the way.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <a
                href="https://x.com/shewellcare"
                target="_blank"
                rel="noopener noreferrer"
                className="group transition-transform hover:scale-110"
                aria-label="X (Twitter)"
              >
                <div className="rounded-full bg-white p-2.5 text-black transition-all group-hover:bg-[#167D71] sm:p-3">
                  <img
                    src="/icons/x.svg"
                    alt="X"
                    width={16}
                    height={16}
                    className="group-hover:invert sm:h-5 sm:w-5"
                  />
                </div>
              </a>
              <a
                href="https://www.instagram.com/shewellcare"
                target="_blank"
                rel="noopener noreferrer"
                className="group transition-transform hover:scale-110"
                aria-label="Instagram"
              >
                <div className="rounded-full bg-white p-2.5 text-black transition-all group-hover:bg-[#167D71] sm:p-3">
                  <img
                    src="/icons/insta.svg"
                    alt="Instagram"
                    width={16}
                    height={16}
                    className="group-hover:invert sm:h-5 sm:w-5"
                  />
                </div>
              </a>
              <a
                href="https://www.facebook.com/people/Shewellcare/61566486577092"
                target="_blank"
                rel="noopener noreferrer"
                className="group transition-transform hover:scale-110"
                aria-label="Facebook"
              >
                <div className="rounded-full bg-white p-2.5 text-black transition-all group-hover:bg-[#167D71] sm:p-3">
                  <img
                    src="/icons/facebook.svg"
                    alt="Facebook"
                    width={16}
                    height={16}
                    className="group-hover:invert sm:h-5 sm:w-5"
                  />
                </div>
              </a>
              <a
                href="https://www.youtube.com/@Shewellcare"
                target="_blank"
                rel="noopener noreferrer"
                className="group transition-transform hover:scale-110"
                aria-label="YouTube"
              >
                <div className="rounded-full bg-white p-2.5 text-black transition-all group-hover:bg-[#167D71] sm:p-3">
                  <img
                    src="/icons/youtube.svg"
                    alt="YouTube"
                    width={16}
                    height={16}
                    className="group-hover:invert sm:h-5 sm:w-5"
                  />
                </div>
              </a>
            </div>
          </div>

          {/* Links & Contact - Responsive Grid */}
          <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 md:gap-12 lg:w-[50%] lg:gap-12">
            <div>
              <h4 className="mb-4 text-lg font-medium sm:mb-5 sm:text-xl md:text-2xl">
                Quick Links
              </h4>
              <ul className="flex flex-col gap-3 text-sm text-gray-300 sm:gap-3.5 sm:text-base">
                <li>
                  <a
                    href="#"
                    className="inline-block transition-all hover:translate-x-1 hover:text-[#167D71]"
                  >
                    Home{" "}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="inline-block transition-all hover:translate-x-1 hover:text-[#167D71]"
                  >
                    Sessions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="inline-block transition-all hover:translate-x-1 hover:text-[#167D71]"
                  >
                    Counselling
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-lg font-medium sm:mb-5 sm:text-xl md:text-2xl">
                Contact Us
              </h4>
              <ul className="space-y-3.5 text-sm text-gray-300 sm:space-y-4 sm:text-base">
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#167D71]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <a
                    href="https://maps.google.com/?q=NO.1274,+CHARUKESI+APARTMENTS,+17TH+STREET,+POOMPUHAR+NAGAR,+KOLATHUR,+CHENNAI,+Tamil+Nadu,+India+600099"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leading-relaxed transition-colors hover:text-[#167D71]"
                  >
                    NO.1274, CHARUKESI APARTMENTS,
                    <br className="hidden sm:block" /> 17TH STREET, POOMPUHAR
                    NAGAR,
                    <br className="hidden sm:block" /> KOLATHUR, CHENNAI,
                    <br className="hidden sm:block" /> Tamil Nadu, India -
                    600099
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 flex-shrink-0 text-[#167D71]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <a
                    href="mailto:info@shewellofficial.com"
                    className="transition-colors hover:text-[#167D71]"
                  >
                    info@shewellofficial.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 flex-shrink-0 text-[#167D71]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <a
                    href="tel:+917397380900"
                    className="transition-colors hover:text-[#167D71]"
                  >
                    +91 7397 380 900
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-6 border-gray-700/50 sm:my-8 md:my-10" />

        {/* Bottom Bar - Responsive */}
        <div className="flex flex-col items-center justify-between gap-5 text-sm text-gray-400 sm:flex-row sm:gap-6 md:text-base">
          <div className="flex flex-wrap items-center justify-center gap-5 sm:justify-start sm:gap-6 md:gap-8">
            <a href="/terms" className="transition-all hover:text-[#167D71]">
              Terms & Conditions
            </a>
            <span className="hidden text-gray-600 sm:inline">•</span>
            <a
              href="/privacy-policy"
              className="transition-all hover:text-[#167D71]"
            >
              Privacy Policy
            </a>
            <span className="hidden text-gray-600 sm:inline">•</span>
            <a
              href="/refund-policy"
              className="transition-all hover:text-[#167D71]"
            >
              Refund & Cancellation
            </a>
          </div>
          <div className="text-center sm:text-right">
            <span className="text-gray-500">
              2025 © Shewell. All Rights Reserved
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
