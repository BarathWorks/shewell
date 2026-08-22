import { redirect } from "next/navigation";

import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import VerifyEmailForm from "./verify-email-form";

/**
 * Practitioner email verification.
 *
 * Deliberately reachable without a session. It is linked from the login screen
 * when an unverified account tries to sign in — at that point sign-in has been
 * refused, so there is no session to read the address from and it arrives as a
 * query parameter instead.
 *
 * That is safe because the parameter only decides *which address the code is sent
 * to*, and the code itself goes to that inbox. Naming an address you do not own
 * gets you a screen asking for a code you will never receive.
 */

interface Props {
  searchParams: { email?: string };
}

const VerifyEmailPage = async ({ searchParams }: Props) => {
  const session = await getServerAuthSession();
  const email = (searchParams.email || session?.user?.email || "").trim().toLowerCase();

  if (!email) {
    redirect("/auth/login");
  }

  const professionalUser = await db.professionalUser.findFirst({
    where: { email: { equals: email, mode: "insensitive" }, deletedAt: null },
    select: { emailVerifiedAt: true },
  });

  if (!professionalUser) {
    redirect("/auth/register/account-setup");
  }

  if (professionalUser.emailVerifiedAt) {
    // Nothing to do here. Signed in, carry on; otherwise go and sign in.
    redirect(session?.user?.email ? "/dashboard" : "/auth/login");
  }

  return <VerifyEmailForm email={email} />;
};

export default VerifyEmailPage;
