import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "@repo/ui/src/@/components/toaster";
import { SessionProvider } from "next-auth/react";
import Footer from "./components/shared/footer";
import DoctorHeader from "./components/shared/doctor-header/doctor-header";
import ClientSessionProvider from "./components/client-session-provider";
import { getServerSession } from "next-auth";
import { db } from "~/server/db";

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
  const session = await getServerSession();
  const specialisationParentCategories =
    await db.professionalSpecializationParentCategory.findMany({
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
    });

  const specializations = await db.professionalSpecializations.findMany({
    select: {
      id: true,
      specialization: true,
    },
    where: {
      
      active: true,
    },
    take : 4
  });

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
