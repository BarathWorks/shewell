"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

interface IBankDetailsProps {
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankName: string;
  bankBranch: string;
  bankIfscCode: string;
  bankUpiId?: string;
}

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

const BankDetailsUserAction = async ({
  bankAccountHolderName,
  bankAccountNumber,
  bankName,
  bankBranch,
  bankIfscCode,
  bankUpiId,
}: IBankDetailsProps): Promise<ActionResult> => {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return {
      success: false,
      error: "Unauthorised user",
    };
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
    bankUpiId: z
      .string()
      .trim()
      .regex(/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/, "Invalid UPI ID")
      .optional()
      .or(z.literal("")),
  });

  const isValidData = formData.safeParse({
    bankAccountHolderName,
    bankAccountNumber,
    bankName,
    bankBranch,
    bankIfscCode,
    bankUpiId,
  });

  if (!isValidData.success) {
    return { success: false, error: isValidData.error.errors[0]?.message || "Please enter the valid data" };
  }

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
      return { success: false, error: "Professional user not found" };
    }

    await db.professionalUser.update({
      data: {
        bankAccountHolderName,
        bankAccountNumber,
        bankName,
        bankBranch,
        bankIfscCode,
        // Stored as null rather than "" so the admin payouts screen's presence
        // check reads correctly.
        bankUpiId: isValidData.data.bankUpiId || null,
      },
      where: {
        email: session.user.email,
      },
    });

    revalidatePath("/auth/register/bank-details");
    return {
      success: true,
      message: "Successfully added bank details",
    };
  } catch (error) {
    console.error("Error saving bank details:", error);
    return {
      success: false,
      error: "Failed to save bank details. Please try again.",
    };
  }
};

export default BankDetailsUserAction;
