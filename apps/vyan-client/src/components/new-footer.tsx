"use client";
import React from "react";

export default function NewFooter() {
  return (
    <footer className="bg-[#1A1A1A] pb-8 pt-16 text-white">
      <div className="max-w-8xl mx-auto px-20">
        {/* Top Section */}
        <div className="mb-16 flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          {/* Brand & Socials */}
          <div className="lg:w-1/3">
            <div className="relative mb-8 h-16 w-48">
              <img
                src="/home/Logo.png"
                alt="Shewell"
                className="h-full w-full object-contain brightness-0 invert"
              />
            </div>
            <div className="flex gap-4">
              <a
                href="#"
                className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
              >
                <div className="rounded-full bg-white p-2 text-black">
                  <img src="/icons/x.svg" alt="Twitter" width={18} height={18} />
                </div>
                <span className="text-sm">Twitter</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
              >
                <div className="rounded-full bg-white p-2 text-black">
                  <img src="/icons/insta.svg" alt="Instagram" width={18} height={18} />
                </div>
                <span className="text-sm">Instagram</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
              >
                <div className="rounded-full bg-white p-2 text-black">
                  <img src="/icons/linkedin.svg" alt="LinkedIn" width={18} height={18} />
                </div>
                <span className="text-sm">LinkedIn</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
              >
                <div className="rounded-full bg-white p-2 text-black">
                  <img src="/icons/youtube.svg" alt="YouTube" width={18} height={18} />
                </div>
                <span className="text-sm">YouTube</span>
              </a>
            </div>
          </div>

          {/* Links & Contact aligned horizontally */}
          <div className="flex flex-col gap-10 lg:w-2/3 lg:flex-row lg:justify-end lg:gap-16">
            <div>
              <h4 className="mb-6 text-2xl font-light">Quick links</h4>
              <ul className="flex flex-col gap-4 text-gray-300">
                <li>
                  <a href="#" className="transition-colors hover:text-[#167D71]">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-[#167D71]">
                    Blog
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
              <h4 className="mb-6 text-2xl font-light">Contact</h4>
              <ul className="space-y-4 text-gray-300">
                <li>123 colony Gurgram, Haryana- 122001</li>
                <li>abcdvyan@gmail.com</li>
                <li>+91-1234567890</li>
              </ul>
            </div>
          </div>

          {/* Subscription Form
          <div className="lg:w-1/2">
            <h3 className="mb-8 text-2xl font-light">
              Subscribe for the latest updates.
            </h3>
            <form className="space-y-4">
              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  First Name 
                  <span className="text-[#FC3903]"> *</span>
                </label>
                
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-700 bg-[#2A2A2A] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#167D71]"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  Email 
                  <span className="text-[#FC3903]"> *</span>
                </label>
                <input
                  type="email"
                  className="w-full rounded-md border border-gray-700 bg-[#2A2A2A] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#167D71]"
                />
              </div>
              <button className="mt-2 rounded-md bg-[#167D71] px-8 py-3 font-medium text-white transition-colors hover:bg-[#12685E]">
                Subscribe
              </button>
            </form>
          </div> */}
        </div>

        {/* Links Grid
        <div className="mb-16 grid grid-cols-2 gap-8 pt-16 md:grid-cols-4">
          {/* Quick Links */
          

          /* Counselling
          <div>
            <h4 className="mb-6 text-2xl font-light">Counselling</h4>
            <ul className="space-y-4 text-gray-300">
              <li>
                <a href="#" className="transition-colors hover:text-[#167D71]">
                  Psychology
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-[#167D71]">
                  Nutritious
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-[#167D71]">
                  Mental Health
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-[#167D71]">
                  New Born Child
                </a>
              </li>
            </ul>
          </div>

          Service
          <div>
            <h4 className="mb-6 text-2xl font-light">Service</h4>
            <ul className="space-y-4 text-gray-300">
              <li>
                <a href="#" className="transition-colors hover:text-[#167D71]">
                  Pregnancies
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-[#167D71]">
                  Child Health
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-[#167D71]">
                  Prenatal
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-[#167D71]">
                  Postnatal
                </a>
              </li>
            </ul>
          </div>

          </div> */}

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between pt-8 text-xs text-gray-500 md:flex-row">
          <div className="mb-4 flex gap-8 md:mb-0">
            <a href="#" className="hover:text-white">
              Terms & Conditions
            </a>
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
          </div>
          <div className="mb-4 md:mb-0">2025 &copy; All Rights Reserved</div>
        </div>
      </div>
    </footer>
  );
}
