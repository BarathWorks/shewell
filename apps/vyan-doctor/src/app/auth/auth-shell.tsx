"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, ShieldCheck, Wallet } from "lucide-react";

/**
 * The shell every authentication screen sits in.
 *
 * Replaces the layout the login, register and verify-email routes each carried
 * their own near-copy of. That layout was a `container mx-auto` two-column block
 * dropped into the middle of the normal site page, which produced the problems
 * this rewrite is meant to end:
 *
 *  - It inherited the site footer from the root layout — brand blurb, social
 *    icons, four link columns — so signing in meant scrolling past ~700px of
 *    marketing to reach a form with two fields. (`site-footer.tsx` now withholds
 *    the footer on `/auth/*`; this shell supplies a two-line legal strip in its
 *    place.)
 *  - Nothing constrained the height, so the page always scrolled even though its
 *    content is short. The shell is exactly the height of what the layout leaves
 *    it, and the form column — not the window — is what scrolls if a long form
 *    needs it.
 *  - Spacing was a chain of magic numbers per breakpoint
 *    (`gap-5 md:gap-[53px] xl:gap-[60px] 2xl:gap-[198px]`), which is why the two
 *    columns drifted apart at wide sizes. It is a two-track grid now.
 *
 * Below `lg` the brand panel is dropped entirely rather than stacked: on a phone
 * it is a screenful of decoration between the user and the thing they came to do.
 */

const SLIDES = [
  "/images/doctor-auth-slide_1.png",
  "/images/doctor-auth-slide_2.png",
] as const;

const HIGHLIGHTS = [
  {
    Icon: CalendarCheck,
    title: "Your calendar, your rules",
    body: "Publish availability once and let clients book only the slots you have opened.",
  },
  {
    Icon: Wallet,
    title: "Transparent earnings",
    body: "Every consultation, payout and refund tracked to the rupee on one dashboard.",
  },
  {
    Icon: ShieldCheck,
    title: "Verified practitioners only",
    body: "Credential checks on every profile, so clients arrive already trusting you.",
  },
] as const;

/** Auto-advancing crossfade. Two images, no carousel library, no layout shift. */
function BrandSlides() {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    // Respect the OS setting rather than animating regardless: this is
    // decoration, and it sits behind a form someone is trying to read.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced || paused) return;

    const timer = setInterval(
      () => setIndex((current) => (current + 1) % SLIDES.length),
      5000,
    );
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="relative aspect-[15/10] w-full overflow-hidden rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((slide, slideIndex) => (
        <Image
          key={slide}
          src={slide}
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 1024px) 40vw, 0px"
          priority={slideIndex === 0}
          className={`object-cover transition-opacity duration-700 ease-out ${
            slideIndex === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 p-4">
        {SLIDES.map((slide, slideIndex) => (
          <button
            key={slide}
            type="button"
            aria-label={`Show image ${slideIndex + 1} of ${SLIDES.length}`}
            aria-current={slideIndex === index}
            onClick={() => setIndex(slideIndex)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              slideIndex === index
                ? "w-6 bg-white"
                : "w-1.5 bg-white/45 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function AuthShell({
  children,
  /** Headline on the brand panel. */
  title = "Provide wellness, virtually.",
  subtitle = "Run your practice on Shewell — bookings, records and payouts in one place.",
  /** The counterpart action, shown top-right of the form column. */
  altAction,
  /** Constrains the form column; registration steps need more room than a login. */
  contentWidth = "md",
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  altAction?: { label: string; href: string; prompt: string };
  contentWidth?: "md" | "lg" | "xl";
}) {
  const widthClass = {
    md: "max-w-md",
    lg: "max-w-xl",
    xl: "max-w-3xl",
  }[contentWidth];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas lg:flex-row">
      {/* ------------------------------------------------------------------ */}
      {/* Brand panel                                                         */}
      {/* ------------------------------------------------------------------ */}
      <aside className="relative hidden shrink-0 overflow-hidden bg-primary-800 lg:flex lg:w-[44%] xl:w-[46%]">
        {/* Two soft radial washes, drawn behind the content. Cheaper than an
            image and it never has to load. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(120% 100% at 0% 0%, rgba(56,163,172,0.55) 0%, rgba(0,0,0,0) 55%), radial-gradient(100% 90% at 100% 100%, rgba(0,143,78,0.4) 0%, rgba(0,0,0,0) 60%)",
          }}
        />

        <div className="relative flex w-full flex-col justify-between gap-8 overflow-y-auto p-8 xl:p-12">
          <Link
            href="/"
            aria-label="Shewell — home"
            className="flex h-8 w-32 shrink-0 items-center text-white transition-opacity duration-200 hover:opacity-85"
          >
            <span
              aria-hidden="true"
              className="h-8 w-full"
              style={{
                display: "block",
                backgroundColor: "currentColor",
                WebkitMaskImage: "url(/images/vyan-logo-white.png)",
                maskImage: "url(/images/vyan-logo-white.png)",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "left center",
                maskPosition: "left center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
            />
          </Link>

          <div className="flex min-h-0 flex-col gap-7">
            <div>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white xl:text-4xl">
                {title}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 xl:text-base">
                {subtitle}
              </p>
            </div>

            <div className="hidden xl:block">
              <BrandSlides />
            </div>

            <ul className="flex flex-col gap-4">
              {HIGHLIGHTS.map(({ Icon, title: heading, body }) => (
                <li key={heading} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-inset ring-white/20"
                  >
                    <Icon className="size-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{heading}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/65">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/55">
            © {new Date().getFullYear()} Shewell. Practitioner portal.
          </p>
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* Form column — the only thing that scrolls                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
          {/* The mark repeats here only where the brand panel is not shown. */}
          <Link
            href="/"
            aria-label="Shewell — home"
            className="flex h-8 w-28 shrink-0 items-center text-ink transition-colors duration-200 hover:text-primary-700 lg:invisible"
          >
            <span
              aria-hidden="true"
              className="h-7 w-full"
              style={{
                display: "block",
                backgroundColor: "currentColor",
                WebkitMaskImage: "url(/images/vyan-logo-white.png)",
                maskImage: "url(/images/vyan-logo-white.png)",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "left center",
                maskPosition: "left center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
            />
          </Link>

          {altAction ? (
            <p className="text-sm text-muted">
              <span className="hidden sm:inline">{altAction.prompt} </span>
              <Link
                href={altAction.href}
                className="font-semibold text-primary-700 underline-offset-4 hover:underline"
              >
                {altAction.label}
              </Link>
            </p>
          ) : null}
        </div>

        <main className="flex flex-1 items-center justify-center px-5 py-6 sm:px-8">
          <div className={`w-full ${widthClass}`}>{children}</div>
        </main>

        {/* The compact legal strip that stands in for the site footer. */}
        <footer className="border-t border-hairline px-5 py-4 sm:px-8">
          <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-xs leading-relaxed text-muted">
              By continuing you agree to our{" "}
              <Link
                href="/terms"
                target="_blank"
                className="font-medium text-primary-700 underline-offset-2 hover:underline"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                className="font-medium text-primary-700 underline-offset-2 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <nav aria-label="Legal" className="flex items-center gap-4">
              <Link
                href="/refund-policy"
                target="_blank"
                className="text-xs text-muted transition-colors duration-200 hover:text-ink"
              >
                Refunds
              </Link>
              <Link
                href="/terms"
                target="_blank"
                className="text-xs text-muted transition-colors duration-200 hover:text-ink"
              >
                Terms
              </Link>
              <Link
                href="/privacy-policy"
                target="_blank"
                className="text-xs text-muted transition-colors duration-200 hover:text-ink"
              >
                Privacy
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
