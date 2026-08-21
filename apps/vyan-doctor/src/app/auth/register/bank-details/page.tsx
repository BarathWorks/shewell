import { db } from "~/server/db";
import BankDetailsForm from "./bank-details-form";
import React from "react";
import { getServerAuthSession } from "~/server/auth";

const BankDetails = async () => {
  const session = await getServerAuthSession();
  if (!session) {
    return;
  }
  if (!session.user.email) {
    return;
  }

  const professionalUser = await db.professionalUser.findFirst({
    select: {
      id: true,
      bankAccountHolderName: true,
      bankAccountNumber: true,
      bankName: true,
      bankBranch: true,
      bankIfscCode: true,
      bankUpiId: true,
    },
    where: {
      email: session.user.email,
    },
  });

  if (!professionalUser) {
    return;
  }

  return (
    <>
      <BankDetailsForm
        professionalUserId={professionalUser.id}
        bankAccountHolderName={professionalUser.bankAccountHolderName || ""}
        bankAccountNumber={professionalUser.bankAccountNumber || ""}
        bankName={professionalUser.bankName || ""}
        bankBranch={professionalUser.bankBranch || ""}
        bankIfscCode={professionalUser.bankIfscCode || ""}
        bankUpiId={professionalUser.bankUpiId || ""}
      />
    </>
  );
};

export default BankDetails;
