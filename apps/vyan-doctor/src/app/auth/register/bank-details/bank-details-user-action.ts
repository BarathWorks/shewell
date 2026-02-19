"use server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "~/server/db";

interface IBankDetailsProps {
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankName: string;
  bankBranch: string;
  bankIfscCode: string;
  bankUpiId?: string;
}

const BankDetailsUserAction = async ({
  bankAccountHolderName,
  bankAccountNumber,
  bankName,
  bankBranch,
  bankIfscCode,
  bankUpiId,
}: IBankDetailsProps) => {
  const session = await getServerSession();
  if (!session?.user) {
    return {
      error: "Unauthorised user",
    };
  }

  if (!session.user.email) {
    throw new Error("Unauthorised");
  }

  const formData = z.object({
    bankAccountHolderName: z.string().min(1, "Account holder name is required"),
    bankAccountNumber: z.string().min(1, "Account number is required"),
    bankName: z.string().min(1, "Bank name is required"),
    bankBranch: z.string().min(1, "Branch name is required"),
    bankIfscCode: z
      .string()
      .min(1, "IFSC code is required")
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),
    bankUpiId: z.string().optional(),
  });

  const isValidData = formData.parse({
    bankAccountHolderName,
    bankAccountNumber,
    bankName,
    bankBranch,
    bankIfscCode,
    bankUpiId,
  });

  if (!isValidData) return { error: "Please enter the valid data" };

  try {
    const professionalUser = await db.professionalUser.findFirst({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    if (!professionalUser) {
      return { error: "Professional user not found" };
    }

    await db.professionalUser.update({
      data: {
        bankAccountHolderName,
        bankAccountNumber,
        bankName,
        bankBranch,
        bankIfscCode,
        bankUpiId: bankUpiId || null,
      },
      where: {
        email: session.user.email,
      },
    });

    revalidatePath("/auth/register/bank-details");
    return {
      message: "Successfully added bank details",
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Error",
    };
  }
};

export default BankDetailsUserAction;
