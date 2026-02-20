"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Session } from "next-auth";
import { redirect, usePathname, useSearchParams } from "next/navigation";

const ClientSessionProvider = ({
  session,
  children,
  verifiedAt
}: {
  session: Session | null;
  children: ReactNode;
  verifiedAt: Date | null
}) => {

  const pathname = usePathname()

  // CRITICAL FIX: Only redirect logged-in users who haven't verified email
  // Don't redirect guests (session is null)
  if (session && verifiedAt === null && pathname !== `/auth/register-otp`) {
    redirect('/auth/register-otp')
  }
  return <SessionProvider session={session}>{children}</SessionProvider>;
};

export default ClientSessionProvider;
