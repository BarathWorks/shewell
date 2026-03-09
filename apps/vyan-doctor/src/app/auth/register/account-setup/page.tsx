import { getServerSession } from "next-auth";
import AccountSetupForm from "./account-setup-form";
import { redirect } from "next/navigation";

const AccountSetup = async () => {
  const session = await getServerSession();
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
