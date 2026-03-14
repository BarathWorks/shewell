"use server";
import { BookAppointmentStatus } from "@repo/database";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
// Removed duplicate RazorpayClient import
import { db } from "~/server/db";
import { createEvent } from "~/lib/create-event";

import { sendEmail } from "@repo/mail";
import {
  getAppointmentBookingEmailTemplate,
  getDoctorAppointmentBookingEmailTemplate,
} from "~/lib/email-templates";
import { format } from "date-fns";

interface IRazorPayDetails {
  razorpay_payment_id: string;
  razorpay_signature: string;
}
const VerifyPayment = async (
  { razorpay_payment_id, razorpay_signature }: IRazorPayDetails,
  order_id: string,
) => {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return { success: false, message: "User session not found" };
    }

    const user = await db.user.findFirst({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return { success: false, message: "Invalid payment signature" };
    }

    const razorpayInstance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const orderData = await razorpayInstance.orders.fetch(order_id);
    if (!orderData || !orderData.amount_paid) {
      return { success: false, message: "Payment not completed on gateway" };
    }

    // Get the appointment details
    const appointment = await db.bookAppointment.findFirst({
      where: { razorpayOrderId: order_id },
      include: {
        professionalUser: true,
        patient: true,
      },
    });

    if (!appointment) {
      return { success: false, message: "Appointment record not found" };
    }

    // Idempotency check: If already successful, don't trigger event creation/emails again
    if (appointment.status === BookAppointmentStatus.PAYMENT_SUCCESSFUL) {
      console.log("ℹ️ VerifyPayment: Appointment already successful, skipping duplicate processing.");
      return { success: true, message: "Payment is already verified" };
    }

    // Update status to SUCCESSFUL
    await db.bookAppointment.update({
      where: { id: appointment.id },
      data: {
        status: BookAppointmentStatus.PAYMENT_SUCCESSFUL,
        razorpayPaymentId: razorpay_payment_id,
      },
    });

    // Create AppointmentPayment record for doctor earnings tracking
    try {
      const totalAmount = appointment.totalPriceInCents ?? appointment.priceInCents;
      const doctorShareInCents = Math.floor(totalAmount * 0.8);
      const platformShareInCents = totalAmount - doctorShareInCents;

      await db.appointmentPayment.create({
        data: {
          appointmentId: appointment.id,
          doctorId: appointment.professionalUserId,
          totalAmountInCents: totalAmount,
          doctorShareInCents,
          platformShareInCents,
          paymentStatus: "PENDING",
        },
      });
      console.log("✅ AppointmentPayment created for earnings tracking");
    } catch (paymentError) {
      console.error("❌ Failed to create AppointmentPayment:", paymentError);
    }

    // Create Notification for the Professional
    await db.professionalNotification.create({
      data: {
        title: "New Appointment Booked",
        description: `You have a new ${appointment.serviceType} appointment with ${appointment.patient.firstName} on ${appointment.startingTime?.toLocaleDateString()} at ${appointment.startingTime?.toLocaleTimeString()}.`,
        professionalUserId: appointment.professionalUserId,
        time: new Date(),
      },
    });

    const doctorName = `${appointment.professionalUser.firstName} ${appointment.professionalUser.lastName || ""}`.trim() || "Doctor";
    const appointmentTime = `${format(appointment.startingTime, "hh:mm a")} - ${format(appointment.endingTime, "hh:mm a")}`;
    let meetingLink = "";

    // Create Google Calendar event if doctor has authorized
    if (appointment.professionalUser.googleAccessToken || appointment.professionalUser.googleRefreshToken) {
      try {
        const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName || ""}`.trim();
        const eventResult = await createEvent({
          professionalUserId: appointment.professionalUserId,
          appointmentId: appointment.id,
          startTime: appointment.startingTime,
          endTime: appointment.endingTime,
          patientName,
          patientEmail: appointment.patient.email,
          planName: appointment.planName,
          description: appointment.description || "",
        });

        if (eventResult?.hangoutLink) {
          meetingLink = eventResult.hangoutLink;
        }
        console.log("✅ Google Calendar event created for appointment:", appointment.id);
      } catch (error) {
        console.error("❌ Failed to create Google Calendar event:", error);
      }
    }

    // Send confirmation emails
    try {
      console.log("---------------------------------------------------");
      console.log("START BOOKING EMAIL PROCESS");

      // Email to patient
      const patientEmailTemplate = getAppointmentBookingEmailTemplate({
        userName: appointment.patient.firstName,
        userEmail: appointment.patient.email,
        doctorName: doctorName,
        appointmentDate: appointment.startingTime,
        appointmentTime: appointmentTime,
        planName: appointment.planName,
        serviceType: appointment.serviceType,
        meetingLink: meetingLink,
      });

      await sendEmail({
        from: process.env.FROM_EMAIL!,
        to: [appointment.patient.email],
        subject: patientEmailTemplate.subject,
        html: patientEmailTemplate.html,
      });

      // Email to doctor
      if (appointment.professionalUser.email) {
        const doctorEmailTemplate = getDoctorAppointmentBookingEmailTemplate({
          doctorName: doctorName,
          patientName: appointment.patient.firstName,
          appointmentDate: appointment.startingTime,
          appointmentTime: appointmentTime,
          planName: appointment.planName,
          serviceType: appointment.serviceType,
          meetingLink: meetingLink,
        });

        await sendEmail({
          from: process.env.FROM_EMAIL!,
          to: [appointment.professionalUser.email],
          subject: doctorEmailTemplate.subject,
          html: doctorEmailTemplate.html,
        });
      }

      console.log("END BOOKING EMAIL PROCESS");
      console.log("---------------------------------------------------");
    } catch (emailError) {
      console.error("Failed to send appointment booking emails:", emailError);
    }

    return {
      success: true,
      orderDetails: orderData,
      message: "Payment is verified",
    };
  } catch (error: any) {
    console.error("VerifyPayment Error:", error);
    return { success: false, message: error.message || "Failed to verify payment" };
  }
};
export default VerifyPayment;
