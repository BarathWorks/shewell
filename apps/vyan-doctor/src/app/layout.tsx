import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "@repo/ui/src/@/components/toaster";
import { SessionProvider } from "next-auth/react";
import SiteFooter from "./components/shared/site-footer";
import DoctorHeader from "./components/shared/doctor-header/doctor-header";
import ClientSessionProvider from "./components/client-session-provider";
import { safeValue } from "@repo/observability";
import { getServerAuthSession } from "~/server/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Shewell ",
  description: "Shewell",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  /**
   * The session, and nothing else.
   *
   * This used to await three things in series before returning a single byte:
   * the session, then every active specialisation parent category with its
   * nested specialisations, then the first four specialisations. Because this is
   * the root layout, nothing below it could stream until all three resolved — so
   * every route in the portal, signed in or not, waited on all of them, and the
   * header could not paint until the slowest one came back. Measured on
   * /auth/login, that put time-to-first-byte anywhere between 0.7s and 11.5s.
   *
   * Neither list was ever rendered. Both were assigned to locals that appear
   * nowhere in the markup below — two database round-trips per request whose
   * results were discarded. Removing them leaves the one await that the server
   * gating of the header genuinely depends on.
   *
   * `safeValue` is kept: unwrapped, a database hiccup here blanked the entire
   * app, and this degrades to a signed-out render instead.
   */
  const session = await safeValue("layout:session", () => getServerAuthSession(), null, {
    source: "root-layout",
  });

  return (
    <html lang="en">
      <body className={`min-h-screen bg-canvas font-sans antialiased ${inter.variable}`}>
        {/*
          The header, the page and the footer used to sit inside a single
          `<div className="sticky top-0 z-40">`. A sticky box containing the whole
          document cannot stick to anything — and because a sticky ancestor
          establishes the containing block for its descendants, it also stopped the
          header's own `sticky` from tracking the viewport.
        */}
        <TRPCReactProvider>
          <ClientSessionProvider session={session}>
            <div className="flex min-h-screen flex-col">
              {/*
                Signed-out visitors do not get the practitioner nav.

                Every destination in it — Dashboard, Profile, Appointments, Edit
                profile — requires a session, so before sign-in the bar was a row
                of links that could only bounce the visitor back to /auth/login.
                Gated on the server session rather than `useSession`, so there is
                no flash of the bar on first paint.
              */}
              {session ? <DoctorHeader /> : null}

              {/*
                A column flex container rather than a plain block, so a page can
                say `flex-1` and fill whatever height the header and footer leave
                it. The authentication shell relies on this to be exactly one
                viewport tall — as a block, `min-h-screen` on the child plus a
                header above it overflowed and put the whole sign-in screen on a
                scrollbar.
              */}
              <main className="flex flex-1 flex-col">{children}</main>

              <SiteFooter />
              <Toaster />
            </div>
          </ClientSessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
};
export default RootLayout;
