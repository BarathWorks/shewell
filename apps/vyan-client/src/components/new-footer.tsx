"use client";

import React from "react";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

/**
 * Site footer.
 *
 * Visual rework only. Every destination is unchanged, including the three Quick
 * Links that point at `#` — those were already placeholders and repointing them
 * would change behaviour, so they are left exactly as they were.
 *
 * The ground is now the palette's deepest ink rather than a free-standing
 * `#1A1A1A`, the four social buttons and three contact rows are generated from
 * data instead of being copy-pasted markup, and the columns sit on a real grid so
 * the layout holds together between the `sm` and `lg` breakpoints — previously it
 * jumped straight from one column to a 50/50 split with nothing in between.
 */

const SOCIALS = [
  { href: "https://x.com/shewellcare", label: "X (Twitter)", icon: "/icons/x.svg" },
  {
    href: "https://www.instagram.com/shewellcare",
    label: "Instagram",
    icon: "/icons/insta.svg",
  },
  {
    href: "https://www.facebook.com/people/Shewellcare/61566486577092",
    label: "Facebook",
    icon: "/icons/facebook.svg",
  },
  {
    href: "https://www.youtube.com/@Shewellcare",
    label: "YouTube",
    icon: "/icons/youtube.svg",
  },
] as const;

const QUICK_LINKS = [
  { href: "#", label: "Home" },
  { href: "#", label: "Sessions" },
  { href: "#", label: "Counselling" },
] as const;

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/refund-policy", label: "Refund & Cancellation" },
] as const;

export default function NewFooter() {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-300">
      <div className="container-page py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-5">
            <div className="h-9 w-36 sm:h-10 sm:w-40">
              <img
                src="/home/Logo.png"
                alt="Shewell"
                className="h-full w-full object-contain object-left"
              />
            </div>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
              Empowering motherhood with care, expertise, and support every step
              of the way.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] transition-colors duration-200 hover:border-primary-500/60 hover:bg-primary-500/15"
                >
                  <img
                    src={social.icon}
                    alt=""
                    aria-hidden="true"
                    width={16}
                    height={16}
                    className="h-4 w-4 opacity-80 invert"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-3">
            <h4 className="text-2xs font-semibold uppercase tracking-[0.09em] text-slate-500">
              Quick Links
            </h4>
            <ul className="mt-5 flex flex-col gap-3.5 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="inline-block py-1 text-slate-300 transition-colors duration-200 hover:text-primary-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h4 className="text-2xs font-semibold uppercase tracking-[0.09em] text-slate-500">
              Contact Us
            </h4>
            <ul className="mt-5 flex flex-col gap-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-primary-400"
                />
                <a
                  href="https://maps.google.com/?q=NO.1274,+CHARUKESI+APARTMENTS,+17TH+STREET,+POOMPUHAR+NAGAR,+KOLATHUR,+CHENNAI,+Tamil+Nadu,+India+600099"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 leading-relaxed text-slate-300 transition-colors duration-200 hover:text-primary-300"
                >
                  NO.1274, Charukesi Apartments, 17th Street, Poompuhar Nagar,
                  Kolathur, Chennai, Tamil Nadu, India&nbsp;&ndash;&nbsp;600099
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail
                  aria-hidden="true"
                  className="size-4 shrink-0 text-primary-400"
                />
                <a
                  href="mailto:info@shewellofficial.com"
                  className="inline-block py-1 text-slate-300 transition-colors duration-200 hover:text-primary-300"
                >
                  info@shewellofficial.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone
                  aria-hidden="true"
                  className="size-4 shrink-0 text-primary-400"
                />
                <a
                  href="tel:+917397380900"
                  className="inline-block py-1 text-slate-300 transition-colors duration-200 hover:text-primary-300"
                >
                  +91 7397 380 900
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-10 border-white/10" />

        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm sm:justify-start"
          >
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-block py-1 text-slate-400 transition-colors duration-200 hover:text-primary-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-sm text-slate-500">
            2025 © Shewell. All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
