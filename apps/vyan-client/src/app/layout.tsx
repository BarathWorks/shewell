import "~/styles/globals.css";
import { Inter, Pacifico, Playfair_Display, Amatic_SC } from "next/font/google";
import { Toaster } from "@repo/ui/src/@/components/toaster";
import { Header } from "~/components/header";
import NewFooter from "~/components/new-footer";
import ClientSessionProvider from "./client-session-provider";
import CardSheet from "~/components/card-sheet";
import { TRPCReactProvider } from "~/trpc/react";
import { getServerAuthSession } from "~/server/auth";

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

import { SlowSiteAlert } from "~/components/slow-site-alert";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  
  // PERFORMANCE FIX: Removed blocking database queries from layout
  // verifiedAt is now stored in JWT token and accessible via session
  // This avoids database queries while maintaining verification redirect functionality

  return (
    <html
      className={`scroll-smooth scroll-smooth ${poppins.variable} ${inter.variable} ${pacifico.variable} ${playfair.variable} ${amaticSC.variable}`}
      lang="en"
    >
      <body className={"relative font-sans"}>
        <SlowSiteAlert />
        <div className="sticky top-0 z-40">
          <ClientSessionProvider session={session} verifiedAt={session?.user?.verifiedAt}>
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
              <NewFooter />
              <CardSheet />
            </TRPCReactProvider>
          </ClientSessionProvider>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
