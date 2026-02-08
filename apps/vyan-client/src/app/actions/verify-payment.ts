"use server";
import { BookAppointmentStatus } from "@repo/database";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import RazorpayClient from "razorpay";
import { db } from "~/server/db";
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
                email: true, // Email is directly on ProfessionalUser
              },
            },
            patient: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            serviceType: true,
            startingTime: true,
            endingTime: true,
            planName: true,
            description: true,
          },
        });

        // Create Notification for the Professional
        await db.professionalNotification.create({
          data: {
            title: "New Appointment Booked",
            description: `You have a new ${appointment?.serviceType} appointment with ${appointment?.patient.firstName} on ${appointment?.startingTime?.toLocaleDateString()} at ${appointment?.startingTime?.toLocaleTimeString()}.`,
            professionalUserId: appointment?.professionalUserId!,
            time: new Date(),
          },
        });

        const doctorName =
          `${appointment?.professionalUser.firstName} ${appointment?.professionalUser.lastName || ""}`.trim() ||
          "Doctor";
        const appointmentTime = `${format(appointment?.startingTime!, "hh:mm a")} - ${format(appointment?.endingTime!, "hh:mm a")}`;

        let meetingLink = "";

        // Create Google Calendar event if doctor has authorized
        if (
          appointment &&
          (appointment.professionalUser.googleAccessToken ||
            appointment.professionalUser.googleRefreshToken)
        ) {
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

            if (eventResult && eventResult.hangoutLink) {
              meetingLink = eventResult.hangoutLink;
            }

            console.log(
              "✅ Google Calendar event created for appointment:",
              appointment.id,
            );
          } catch (error) {
            console.error("❌ Failed to create Google Calendar event:", error);
            // Don't fail the payment verification if calendar creation fails
          }
        } else {
          console.log(
            "⚠️ Doctor hasn't authorized Google Calendar access - skipping event creation",
          );
        }

        // Send confirmation emails
        if (appointment) {
          try {
            console.log("---------------------------------------------------");
            console.log("START BOOKING EMAIL PROCESS");
            console.log("Using FROM_EMAIL:", process.env.FROM_EMAIL);
            console.log("Sending patient email to:", appointment.patient.email);

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
            console.log("patientEmailTemplate", patientEmailTemplate);
            console.log("Patient email sent successfully.");

            // Email to doctor
            const doctorEmailTemplate =
              getDoctorAppointmentBookingEmailTemplate({
                doctorName: doctorName,
                patientName: appointment.patient.firstName,
                appointmentDate: appointment.startingTime,
                appointmentTime: appointmentTime,
                planName: appointment.planName,
                serviceType: appointment.serviceType,
                meetingLink: meetingLink,
              });

            console.log("doctorEmailTemplate", doctorEmailTemplate);
            console.log(
              "Sending doctor email to:",
              appointment.professionalUser.email,
            );

            if (appointment.professionalUser.email) {
              await sendEmail({
                from: process.env.FROM_EMAIL!,
                to: [appointment.professionalUser.email],
                subject: doctorEmailTemplate.subject,
                html: doctorEmailTemplate.html,
              });
              console.log("Doctor email sent successfully.");
            } else {
              console.log("Doctor email not found, skipping.");
            }

            console.log("END BOOKING EMAIL PROCESS");
            console.log("---------------------------------------------------");
          } catch (emailError) {
            console.error(
              "Failed to send appointment booking emails:",
              emailError,
            );
          }
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
