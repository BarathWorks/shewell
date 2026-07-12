import "~/styles/globals.css";

import { Inter, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "@repo/ui/src/@/components/toaster";
import { SessionProvider } from "next-auth/react";
import ClientSessionProvider from "./components/client-session-provider";
import PortalLayoutWrapper from "./components/shared/portal-layout-wrapper";
import { getServerSession } from "next-auth";
import { db } from "~/server/db";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
          rel="stylesheet"
        />
      </head>
      <body className={`relative ${inter.variable} ${hanken.variable} ${jetbrains.variable}`}>
        <div className="sticky top-0 z-40">
          {/* <Header /> */}
          <TRPCReactProvider>
            <ClientSessionProvider session={session}>
              <PortalLayoutWrapper>
                {children}
              </PortalLayoutWrapper>
              <Toaster />
            </ClientSessionProvider>
          </TRPCReactProvider>
        </div>
      </body>
    </html>
  );
};
export default RootLayout;
