import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { api } from "~/trpc/server";
import { SessionProvider } from "next-auth/react";
import Hero from "~/components/hero";
import "~/styles/globals.css";
import { Inter, Pacifico } from "next/font/google";
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
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Adjust as needed
  variable: "--font-poppins",
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
  let verifiedAt: Date | null | undefined = undefined;
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

  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
  const categories = await db.category.findMany({
    select: {
      id: true,
      name: true,
      order: true,
      childCategories: {
        select: {
          id: true,
          name: true,

          childCategories: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    where: {
      deletedAt: null,
      parentCategoryId: null,
    },
  });

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
    take: 4,
  });

  return (
    <html className="scroll-smooth" lang="en">
      <body
        className={`relative font-sans ${inter.variable} ${pacifico.variable} ${poppins.variable}`}
      >
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
              <Toaster />
              <CardSheet />
            </TRPCReactProvider>
          </ClientSessionProvider>
        </div>

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
