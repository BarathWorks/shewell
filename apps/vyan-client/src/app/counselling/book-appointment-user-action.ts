"use server";
import { AppointmentType } from "@repo/database";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
interface IBookAppointmentDetailsProps {
  serviceMode: {
    serviceType: AppointmentType;
    priceInCents: number;
    description: string;
    planName: string;
  };
  professionalUser: {
    professionalUserId: string;
  };
  patient: {
    firstName: string;
    email: string;
    phoneNumber: string;
  };
  startingTime: Date;
  endingTime: Date;
}
const BookAppointmentUserAction = async ({
  serviceMode,
  professionalUser,
  patient,
  startingTime,
  endingTime,
}: IBookAppointmentDetailsProps) => {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return;
  const patientInfo = await db.patient.findFirst({
    select: {
      id: true,
    },
    where: {
      userId: session.user.id,
    },
  });
  if (!patientInfo) {
    return;
  }
  try {
    if (
      !serviceMode ||
      !professionalUser ||
      !patient ||
      !startingTime ||
      !endingTime
    ) {
      throw new Error("Incomplete data for booking appointment");
    }

    // Use a transaction with Serializable isolation to prevent concurrent double bookings
    const appointment = await db.$transaction(
      async (tx) => {
        // Check if the timeslot is already booked
        const existingAppointment = await tx.bookAppointment.findFirst({
          where: {
            professionalUserId: professionalUser.professionalUserId,
            startingTime: startingTime,
            status: {
              notIn: ["CANCELLED", "CANCELLED_WITH_REFUND"],
            },
          },
        });

        if (existingAppointment) {
          throw new Error(
            "This timeslot is already booked. Please select a different time.",
          );
        }

        return await tx.bookAppointment.create({
          data: {
            endingTime: endingTime,
            startingTime: startingTime,
            description: serviceMode.description,
            planName: serviceMode.description,
            priceInCents: serviceMode.priceInCents,
            serviceType: serviceMode.serviceType,
            patientId: patientInfo?.id,
            professionalUserId: professionalUser.professionalUserId,
            userId: session.user.id,
          },
          include: {
            professionalUser: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });
      },
      {
        isolationLevel: "Serializable",
      },
    );

    // Create Notification for the Professional
    await db.professionalNotification.create({
      data: {
        title: "New Appointment Booked",
        description: `You have a new ${serviceMode.serviceType} appointment with ${patient.firstName} on ${startingTime.toLocaleDateString()} at ${startingTime.toLocaleTimeString()}.`,
        professionalUserId: professionalUser.professionalUserId,
        time: new Date(),
      },
    });

    // Send confirmation emails
    try {
      const { sendEmail } = await import("@repo/mail");
      const {
        getAppointmentBookingEmailTemplate,
        getDoctorAppointmentBookingEmailTemplate,
      } = await import("~/lib/email-templates");
      const { format } = await import("date-fns");

      const appointmentTime = `${format(startingTime, "hh:mm a")} - ${format(endingTime, "hh:mm a")}`;
      const doctorName =
        `${appointment.professionalUser.firstName} ${appointment.professionalUser.lastName || ""}`.trim() ||
        "Doctor";

      // Email to patient
      const patientEmailTemplate = getAppointmentBookingEmailTemplate({
        userName: patient.firstName,
        userEmail: patient.email,
        doctorName: doctorName,
        appointmentDate: startingTime,
        appointmentTime: appointmentTime,
        planName: serviceMode.planName,
        serviceType: serviceMode.serviceType,
        meetingLink: (appointment.meeting as string) || "",
      });

      await sendEmail({
        from: process.env.FROM_EMAIL!,
        to: [patient.email],
        subject: patientEmailTemplate.subject,
        html: patientEmailTemplate.html,
      });

      // Email to doctor
      const doctorEmailTemplate = getDoctorAppointmentBookingEmailTemplate({
        doctorName: doctorName,
        patientName: patient.firstName,
        appointmentDate: startingTime,
        appointmentTime: appointmentTime,
        planName: serviceMode.planName,
        serviceType: serviceMode.serviceType,
        meetingLink: (appointment.meeting as string) || "",
      });

      if (appointment.professionalUser.email) {
        await sendEmail({
          from: process.env.FROM_EMAIL!,
          to: [appointment.professionalUser.email],
          subject: doctorEmailTemplate.subject,
          html: doctorEmailTemplate.html,
        });
      }
    } catch (emailError) {
      console.error("Failed to send appointment booking emails:", emailError);
      // Don't fail the booking if email fails
    }

    return {
      message: "Appointment has booked",
    };
  } catch (error) {
    throw new Error("Failed to Book the appointment");
  }
};

export default BookAppointmentUserAction;
