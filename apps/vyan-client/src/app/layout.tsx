import "~/styles/globals.css";
import { Inter, Amatic_SC } from "next/font/google";
import { Toaster } from "@repo/ui/src/@/components/toaster";
import { Header } from "~/components/header";
import NewFooter from "~/components/new-footer";
import ClientSessionProvider from "./client-session-provider";
import { TRPCReactProvider } from "~/trpc/react";
import { getServerAuthSession } from "~/server/auth";
import { safeValue } from "@repo/observability";

// import { Header as NewHeader } from "./components/header";
/**
 * One interface typeface.
 *
 * Inter carries the whole UI now — see the `fontFamily` note in
 * `tailwind.config.ts`. It exposes both `--font-inter` (what the Tailwind aliases
 * resolve to) and `--font-sans` so any stylesheet still reaching for the older
 * variable keeps working.
 *
 * Pacifico, Playfair Display and Poppins were all loaded on every page. Pacifico
 * and Playfair were referenced by nothing at all, and `next/font` emits an
 * @font-face and preloads the files for every family it is handed — so two full
 * families were downloaded on every page view for nothing. Poppins is replaced by
 * Inter. Three fewer families now cross the wire.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/** The one decorative face, used by a single heading. */
const amaticSC = Amatic_SC({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-amatic-sc",
});

export const metadata = {
  title: "Shewell",
  description: "Shewell",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};



export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The root layout wraps every route, so an unhandled throw here takes down the
  // whole site rather than one page. A session lookup that fails (database down,
  // pooler saturated) degrades to signed-out instead — the marketing pages, blogs
  // and doctor profiles all still render.
  const session = await safeValue("layout:session", () => getServerAuthSession(), null, {
    source: "root-layout",
  });
  
  // PERFORMANCE FIX: Removed blocking database queries from layout
  // verifiedAt is now stored in JWT token and accessible via session
  // This avoids database queries while maintaining verification redirect functionality

  return (
    <html
      className={`scroll-smooth ${inter.variable} ${amaticSC.variable}`}
      lang="en"
    >
      <body className="min-h-screen bg-canvas font-sans antialiased">
        {/*
          The header, the page and the footer used to sit inside a single
          `<div className="sticky top-0 z-40">`. A sticky box containing the whole
          document cannot stick to anything — and because a sticky ancestor
          establishes the containing block for its descendants, it also stopped the
          header's own `sticky` from tracking the viewport. The wrapper is gone; the
          header sticks on its own.

          `<main>` is a landmark and the skip link's target, neither of which the
          bare fragment provided.
        */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-ink focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Skip to content
        </a>

        <ClientSessionProvider session={session} verifiedAt={session?.user?.verifiedAt}>
          <TRPCReactProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main id="main" className="flex-1">
                {children}
              </main>
              <NewFooter />
            </div>
          </TRPCReactProvider>
        </ClientSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
