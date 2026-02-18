import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { db } from "~/server/db";

// Function to initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const processRefund = async (
  paymentId: string,
  amount: number,
  appointmentId: string,
) => {
  try {
    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount: amount.toString(),
      speed: "normal",
      // notes: {
      //   notes_key_1: "Optional Note 1",
      //   notes_key_2: "Optional Note 2",
      // },
      //   receipt: "Receipt No. 32",
    });

    // const session = await getServerSession();
    // const user = await db.user.findFirst({
    //   where: {
    //     email: session?.user.email!,
    //   },
    // });
    // if (!user) {
    //   return;
    // }
    // const appointment = await db.bookAppointment.findFirst({
    //   where: {
    //     userId: user.id!,
    //   },
    // });
    // if (!appointment) {
    //   return;
    // }

    await db.bookAppointment.update({
      data: {
        razorpayRefundId: refund.id,
      },
      where: {
        id: appointmentId,
        // razorpayPaymentId: paymentId,
      },
    });

    // Mark the AppointmentPayment as PENDING so this earning
    // is excluded from future available balance calculations
    try {
      await db.appointmentPayment.updateMany({
        where: { appointmentId },
        data: { paymentStatus: "PENDING" },
      });
    } catch (apError) {
      console.error(
        "Failed to update AppointmentPayment status on refund:",
        apError,
      );
      // Don't fail the refund if this fails — the refund itself was already processed
    }

    return {
      refund,
    };
  } catch (error) {
    console.error("Refund Error:", error);
    throw new Error("Refund process failed");
  }
};
