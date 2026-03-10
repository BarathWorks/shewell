import { getServerSession } from "next-auth";
import "~/styles/globals.css";
import { Inter, Pacifico, Playfair_Display, Amatic_SC } from "next/font/google";
import { Toaster } from "@repo/ui/src/@/components/toaster";
import { Header } from "~/components/header";
import NewFooter from "~/components/new-footer";
import { db } from "~/server/db";
import ClientSessionProvider from "./client-session-provider";
import CardSheet from "~/components/card-sheet";
import { TRPCReactProvider } from "~/trpc/react";

import { Poppins } from "next/font/google";
// import { Header as NewHeader } from "./components/header";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Adjust as needed
  variable: "--font-poppins",
});

const amaticSC = Amatic_SC({
  weight: ["400", "700"],
  subsets: ["latin"],
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
  const session = await getServerSession();
  let verifiedAt: Date | undefined = undefined;
  if (session) {
    const user = await db.user.findFirst({
      select: {
        verifiedAt: true,
        name: true,
        email: true,
        wishlistedProducts: true,
      },
      where: {
        email: session.user.email!,
      },
    });

    verifiedAt = user?.verifiedAt;
  }

  let userDetails;

  if (session?.user?.email) {
    userDetails = await db.user.findFirst({
      select: {
        wishlistedProducts: true,
      },
      where: {
        email: session.user.email,
      },
    });
  }

  return (
    <html
      className={`scroll-smooth scroll-smooth ${poppins.variable} ${inter.variable} ${pacifico.variable} ${playfair.variable} ${amaticSC.variable}`}
      lang="en"
    >
      <body className={"relative font-sans"}>
        <div className="sticky top-0 z-40">
          <ClientSessionProvider session={session} verifiedAt={verifiedAt!}>
            <TRPCReactProvider>
              {/* <Header
                email={session?.user.email!}
                name={session?.user.name!}
                categories={categories}
                wishlistedProLength={
                  userDetails?.wishlistedProducts.length || 0
                }
              /> */}
              <Header />
              {/* <NewHeader /> */}
              {children}
              {/* <NewHeader /> */}
              <NewFooter />
              <CardSheet />
            </TRPCReactProvider>
          </ClientSessionProvider>
        </div>
        <Toaster />

        {/* <div className="">
          <ClientSessionProvider session={session} verifiedAt={verifiedAt!}>
            <TRPCReactProvider>{children} </TRPCReactProvider>
          </ClientSessionProvider>
        </div> */}
        {/* <Footer />
        <Toaster />
        <CardSheet /> */}
      </body>
    </html>
  );
}
