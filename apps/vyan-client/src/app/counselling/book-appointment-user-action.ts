"use server";
import { AppointmentType } from "@repo/database";
import { getServerSession } from "next-auth";
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
  const session = await getServerSession();
  const user = await db.user.findFirst({
    select: {
      id: true,
    },
    where: {
      email: session?.user.email!,
    },
  });
  if (!user) {
    return;
  }
  const patientInfo = await db.patient.findFirst({
    select: {
      id: true,
    },
    where: {
      userId: user.id,
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
            userId: user.id,
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

      console.log("---------------------------------------------------");
      console.log("START BOOKING EMAIL PROCESS");
      console.log("Using FROM_EMAIL:", process.env.FROM_EMAIL);
      console.log("Sending patient email to:", patient.email);

      await sendEmail({
        from: process.env.FROM_EMAIL!,
        to: [patient.email],
        subject: patientEmailTemplate.subject,
        html: patientEmailTemplate.html,
      });
      console.log("patientEmailTemplate", patientEmailTemplate);
      console.log("Patient email sent successfully.");

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
      }
      console.log("END BOOKING EMAIL PROCESS");
      console.log("---------------------------------------------------");
    } catch (emailError) {
      console.error("Failed to send appointment booking emails:", emailError);
      // Don't fail the booking if email fails
    }

    return {
      message: "Appointment has booked",
    };
  } catch (error) {
    console.log("booking", error);
    throw new Error("Failed to Book the appointment");
  }
};

export default BookAppointmentUserAction;
