
import { db } from "~/server/db";
import RegisterOTPForm from "./verify-otp-form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import VerifyOTPForm from "./verify-otp-form";
import { getServerAuthSession } from "~/server/auth";

interface Props {
  searchParams: { email?: string };
}

const RegisterOTP = async ({ searchParams }: Props) => {
  const session = await getServerAuthSession();
  const email = searchParams.email || session?.user?.email;

  let user = null;
  if (email) {
    user = await db.user.findFirst({
      select: {
        verifiedAt: true,
      },
      where: {
        email: email,
      },
    });
  }

  return (
    <>
      <VerifyOTPForm verifiedAt={user?.verifiedAt!} email={email!} />
    </>
  );
};
export default RegisterOTP;
