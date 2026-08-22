"use client";

import { usePathname } from "next/navigation";

import Footer from "./footer";

/**
 * The marketing footer, on the routes where it belongs.
 *
 * The root layout rendered `<Footer />` unconditionally, so the sign-in screen
 * carried the full site footer — brand blurb, social icons, four link columns,
 * newsletter — below the login form. On a page whose entire job is one short form
 * that was roughly 700px of unrelated content underneath it, which is why signing
 * in involved scrolling past a footer.
 *
 * Authentication routes are chrome-free: they own the whole viewport, carry their
 * own compact legal line, and never scroll on a desktop screen. Everything else
 * keeps the footer exactly as it was.
 */
const CHROME_FREE_PREFIXES = ["/auth"];

export default function SiteFooter() {
  const pathname = usePathname() ?? "";

  const isChromeFree = CHROME_FREE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isChromeFree) return null;

  return <Footer />;
}
