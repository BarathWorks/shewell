"use server";

import { getServerSession } from "next-auth";
import { db } from "~/server/db";
import { BookAppointmentStatus } from "@repo/database";
import { format, differenceInMinutes } from "date-fns";
import { processRefund } from "./refund-payment";
import { deleteEvent } from "~/lib/create-event";
import { revalidatePath } from "next/cache";

async function CancelAppointment({
  eventId,
  appointmentId,
  professionalUserId,
}: {
  appointmentId: string;
  eventId: string;
  professionalUserId: string;
}) {

  return db.$transaction(
    async (tx) => {
      const session = await getServerSession();

      if (!session) {
        throw new Error("Please login ")
      }

      const currentTime = new Date();

      try {
        const appointment = await tx.bookAppointment.findFirst({
          where: {
            id: appointmentId,
            // userId: user?.id,
          },
        });
        const bookedTime = appointment?.startingTime!;

        const differenceInTime = differenceInMinutes(bookedTime!, currentTime);
        try {
          const response = await deleteEvent({
            eventId: eventId,
            professionalUserId: professionalUserId,
          });

          await db.bookAppointment.update({
            data: {

              meeting: response,
            },
            where: {
              id: appointmentId,
            },
          });

          revalidatePath("/profile/appointments");
          return {
            message: "Meeting response has been updated",
          };

        } catch (error) {
          console.log("error at delete event", error);
        }


        if (Math.abs(differenceInTime) < 120) {
          // if time is less than 120 minutes, then cancel appointment without refund
          try {
            const cancelledAppointment = await db.bookAppointment.update({
              data: {
                status: BookAppointmentStatus.CANCELLED,

              },
              where: {
                id: appointmentId,
                // userId: user?.id,
              },
              include: {
                patient: {
                  select: {
                    firstName: true,
                    email: true,
                  },
                },
                professionalUser: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            });
            revalidatePath("/profile/appointments");

            // Send cancellation email
            try {
              const { sendEmail } = await import("@repo/mail");
              const { getAppointmentCancelEmailTemplate } = await import("~/lib/email-templates");
              const { format } = await import("date-fns");

              const appointmentTime = `${format(cancelledAppointment.startingTime!, "hh:mm a")} - ${format(cancelledAppointment.endingTime!, "hh:mm a")}`;
              const doctorName = `${cancelledAppointment.professionalUser.firstName} ${cancelledAppointment.professionalUser.lastName || ""}`.trim();

              const emailTemplate = getAppointmentCancelEmailTemplate({
                userName: cancelledAppointment.patient.firstName,
                userEmail: cancelledAppointment.patient.email!,
                doctorName: doctorName,
                appointmentDate: cancelledAppointment.startingTime!,
                appointmentTime: appointmentTime,
                planName: cancelledAppointment.planName || "Appointment",
                hasRefund: false,
              });

              await sendEmail({
                from: process.env.FROM_EMAIL!,
                to: [cancelledAppointment.patient.email!],
                subject: emailTemplate.subject,
                html: emailTemplate.html,
              });

              // Send email to doctor
              if (cancelledAppointment.professionalUser.email) {
                await sendEmail({
                  from: process.env.FROM_EMAIL!,
                  to: [cancelledAppointment.professionalUser.email],
                  subject: `❌ Appointment Cancelled - ${cancelledAppointment.patient.firstName}`,
                  html: emailTemplate.html.replace(cancelledAppointment.patient.firstName, doctorName), // Reusing template but replacing greeting for doctor context, strictly speaking should have separate template but this matches reschedule pattern
                });
              }
            } catch (emailError) {
              console.error("Failed to send cancellation email:", emailError);
            }

            return {
              message: "Appointment has been cancelled without refund",
            };
          } catch (error) {
            console.log("if time is less than 120 minutes update error", error);
          }
        }
        // if time is more than 120 minutes, then cancel appointment with refund
        else {
          const refundAmount = appointment?.priceInCents;

          await processRefund(appointment?.razorpayPaymentId!, refundAmount!, appointmentId);
          try {
            const cancelledAppointment = await tx.bookAppointment.update({
              data: {
                status: BookAppointmentStatus.CANCELLED_WITH_REFUND,

              },
              where: {
                id: appointmentId,
                // userId: user?.id,
              },
              include: {
                patient: {
                  select: {
                    firstName: true,
                    email: true,
                  },
                },
                professionalUser: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            });
            revalidatePath("/profile/appointments");

            // Send cancellation with refund email
            try {
              const { sendEmail } = await import("@repo/mail");
              const { getAppointmentCancelEmailTemplate } = await import("~/lib/email-templates");
              const { format } = await import("date-fns");

              const appointmentTime = `${format(cancelledAppointment.startingTime!, "hh:mm a")} - ${format(cancelledAppointment.endingTime!, "hh:mm a")}`;
              const doctorName = `${cancelledAppointment.professionalUser.firstName} ${cancelledAppointment.professionalUser.lastName || ""}`.trim();

              const emailTemplate = getAppointmentCancelEmailTemplate({
                userName: cancelledAppointment.patient.firstName,
                userEmail: cancelledAppointment.patient.email!,
                doctorName: doctorName,
                appointmentDate: cancelledAppointment.startingTime!,
                appointmentTime: appointmentTime,
                planName: cancelledAppointment.planName || "Appointment",
                refundAmount: refundAmount,
                hasRefund: true,
              });

              await sendEmail({
                from: process.env.FROM_EMAIL!,
                to: [cancelledAppointment.patient.email!],
                subject: emailTemplate.subject,
                html: emailTemplate.html,
              });
            } catch (emailError) {
              console.error("Failed to send cancellation email:", emailError);
            }

            return {
              message: "Appointment has been canelled with refund",
            };
          } catch (error) {
            console.log("if time is more than 120 minutes update error", error);
          }
        }
      } catch (error) {
        console.log("appointmnetnotcancelled", error);
        throw new Error("Appointment cannot be cancelled");
      }
    },
    {
      timeout: 10000,
    },
  );
}

export default CancelAppointment;
