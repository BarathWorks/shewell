import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "@repo/ui/src/@/components/toaster";
import { SessionProvider } from "next-auth/react";
import Footer from "./components/shared/footer";
import DoctorHeader from "./components/shared/doctor-header/doctor-header";
import ClientSessionProvider from "./components/client-session-provider";
import { db } from "~/server/db";
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
  // Every one of these runs on every route. Unwrapped, a single database hiccup in
  // the layout blanked the entire app; each now degrades independently to an empty
  // result so the page around it still renders.
  const session = await safeValue("layout:session", () => getServerAuthSession(), null, {
    source: "root-layout",
  });
  const specialisationParentCategories = await safeValue(
    "layout:specialisationParentCategories",
    () =>
      db.professionalSpecializationParentCategory.findMany({
      select: {
        id: true,
        name: true,
        specializations: {
          select: {
            id: true,
            specialization: true,
          },
          where: {
            active: true,
          },
        },
      },
        where: {
          active: true,
        },
      }),
    [],
    { source: "root-layout" }
  );

  const specializations = await safeValue(
    "layout:specializations",
    () =>
      db.professionalSpecializations.findMany({
        select: {
          id: true,
          specialization: true,
        },
        where: {
          active: true,
        },
        take: 4,
      }),
    [],
    { source: "root-layout" }
  );

  return (
    <html lang="en">
      <body className={`relative font-sans ${inter.variable}`}>
        <div className="sticky top-0 z-40">
          {/* <Header /> */}
          <TRPCReactProvider>
            <ClientSessionProvider session={session}>
              <DoctorHeader />
              {children}
              <Footer />
              <Toaster />
            </ClientSessionProvider>
          </TRPCReactProvider>
        </div>
      </body>
    </html>
  );
};
export default RootLayout;
