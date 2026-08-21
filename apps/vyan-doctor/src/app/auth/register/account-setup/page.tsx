import AccountSetupForm from "./account-setup-form";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

const AccountSetup = async () => {
  const session = await getServerAuthSession();
  if (session) {
    redirect("/");
  }
  return (
    <>
      <AccountSetupForm />
    </>
  );
};

export default AccountSetup;
