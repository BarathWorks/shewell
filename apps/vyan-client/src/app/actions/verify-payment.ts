"use server";
import { BookAppointmentStatus } from "@repo/database";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import RazorpayClient from "razorpay";
import { db } from "~/server/db";
import { createEvent } from "~/lib/create-event";

interface IRazorPayDetails {
  razorpay_payment_id: string;
  razorpay_signature: string;
}
const VerifyPayment = async (
  { razorpay_payment_id, razorpay_signature }: IRazorPayDetails,
  order_id: string,
) => {
  const session = await getServerSession();
  const user = await db.user.findFirst({
    where: {
      email: session?.user.email!,
    },
  });
  const generated_signature = crypto
    //   Create an HMAC object with the sha256 algorithm and secret key
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    // inputs the data that you want to hash
    .update(`${order_id}|${razorpay_payment_id}`)
    // outputs the hash value in specified coding format
    .digest("hex");
  if (generated_signature === razorpay_signature) {
    const razorpayInstance = new RazorpayClient({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const orderDetails = razorpayInstance.orders.fetch(order_id);
    if ((await orderDetails).amount_paid) {
     
      try {
        await db.bookAppointment.updateMany({
          data: {
            status: BookAppointmentStatus.PAYMENT_SUCCESSFUL,
            razorpayPaymentId: razorpay_payment_id,
          },
          where: {
            razorpayOrderId: order_id,
          },
        });

        // Get the appointment details to create calendar event
        const appointment = await db.bookAppointment.findFirst({
          where: {
            razorpayOrderId: order_id,
          },
          select: {
            id: true,
            professionalUserId: true,
            professionalUser: {
              select: {
                googleAccessToken: true,
                googleRefreshToken: true,
                firstName: true,
                lastName: true,
              },
            },
            patient: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            startingTime: true,
            endingTime: true,
            planName: true,
            description: true,
          },
        });

        // Create Google Calendar event if doctor has authorized
        if (appointment && (appointment.professionalUser.googleAccessToken || appointment.professionalUser.googleRefreshToken)) {
          try {
            const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName || ""}`.trim();
            await createEvent({
              professionalUserId: appointment.professionalUserId,
              appointmentId: appointment.id,
              startTime: appointment.startingTime,
              endTime: appointment.endingTime,
              patientName,
              patientEmail: appointment.patient.email,
              planName: appointment.planName,
              description: appointment.description || "",
            });
            console.log("✅ Google Calendar event created for appointment:", appointment.id);
          } catch (error) {
            console.error("❌ Failed to create Google Calendar event:", error);
            // Don't fail the payment verification if calendar creation fails
          }
        } else {
          console.log("⚠️ Doctor hasn't authorized Google Calendar access - skipping event creation");
        }

      } catch (error) {
        console.log(error);
      }
    }
    return {
      orderDetails,
      message: "Payment is verified",
    };
  } else {
    return {
      message: "Payment is not verified",
    };
  }
};
export default VerifyPayment;
