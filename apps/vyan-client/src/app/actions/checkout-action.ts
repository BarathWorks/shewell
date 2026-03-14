"use server";

import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { db } from "~/server/db";
import { AppointmentType, BookAppointmentStatus } from "@repo/database";
import { createEvent } from "~/lib/create-event";
import { revalidatePath } from "next/cache";
interface IBookAppointmentDetailsProps {
  serviceMode: {
    serviceType: AppointmentType;
    taxedAmount: number;
    totalPriceInCents: number;
    priceInCents: number;
    description: string;
    planName: string;
  };
  professionalUser: {
    professionalUserId: string;
  };
  patient: {
    id: string;
    firstName: string;
    email: string;
    phoneNumber: string;
    message: string;
    additionalPatients: {
      firstName: string;
      email: string;
      phoneNumber: string;
    }[];
  };
  startingTime: Date;
  endingTime: Date;
}
async function CheckoutAction({
  serviceMode,
  professionalUser,
  patient,
  startingTime,
  endingTime,
}: IBookAppointmentDetailsProps) {
  return db.$transaction(
    async (tx) => {
      var instance = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });

      const session = await getServerSession();
      if (!session?.user) {
        return {
          error: "Unauthorised",
        };
      }
      // fetching user info
      const user = await tx.user.findFirst({
        where: {
          email: session?.user.email!,
        },
      });
      if (!user) {
        return;
      }
      // fetching patient info
      // const patientInfo = await tx.patient.findFirst({
      //   select: {
      //     id: true,
      //   },
      //   where: {
      //     userId: user.id,
      //   },
      // });
      // if (!patientInfo) {
      //   return;
      // }

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

        // Check if the timeslot is already booked
        const existingAppointment = await tx.bookAppointment.findFirst({
          where: {
            professionalUserId: professionalUser.professionalUserId,
            startingTime: startingTime,
            status: {
              notIn: [
                BookAppointmentStatus.CANCELLED,
                BookAppointmentStatus.CANCELLED_WITH_REFUND,
              ],
            },
          },
        });

        if (existingAppointment) {
          return {
            error:
              "This timeslot is already booked. Please select a different time.",
          };
        }

        const bookAppointment = await tx.bookAppointment.create({
          data: {
            endingTime: endingTime,
            startingTime: startingTime,
            description: serviceMode.description,
            planName: serviceMode.description,
            priceInCents: serviceMode.priceInCents,
            taxedAmount: serviceMode.taxedAmount,
            totalPriceInCents: serviceMode.totalPriceInCents,
            serviceType: serviceMode.serviceType,
            // patientId: patientInfo?.id,
            patientId: patient.id,
            professionalUserId: professionalUser.professionalUserId,
            status: BookAppointmentStatus.PAYMENT_PENDING,
            userId: user.id,
          },
        });

        if (!bookAppointment) {
          return {
            error: "Failed to create appointment",
          };
        }
        //   fetching appointment details from the database
        const appointment = await tx.bookAppointment.findFirst({
          where: {
            id: bookAppointment.id,
          },
        });

        //  create order on Razorpay
        const appointmentInstance = await instance.orders.create({
          amount: appointment?.totalPriceInCents!,
          currency: "INR",
          // receipt: "bookAppointment#1",
          // notes: {
          //   bookAppointmentId: bookAppointment.id,
          // },
        });

        //  applying try-catch block so that even if the create event cannot be created for any reason , our appointment must be booked inspite when event cannot be created
        // Note: Meeting creation removed from checkout to prevent "zombie" meetings for unpaid attempts.
        // It is now handled in verify-payment.ts upon successful payment captured.

        await tx.bookAppointment.update({
          data: {
            razorpayOrderId: appointmentInstance.id,
          },
          where: {
            userId: user.id,
            id: bookAppointment.id,
          },
        });

        revalidatePath("/profile/appointments");
        return {
          message: "Appointment has booked",
          user: {
            name: user.name,
            email: user.email,
          },
          name: "Vyan",
          currency: "INR",
          amount: appointmentInstance.amount,
          orderId: appointmentInstance.id,
          description: "",
          image: "",
        };
      } catch (error) {
        console.log("booking", error);
        if (error instanceof Error) {
          return { error: error.message };
        }
        return { error: "Failed to Book the appointment" };
      }
    },
    {
      timeout: 10000,
      isolationLevel: "Serializable",
    },
  );
}
export default CheckoutAction;
