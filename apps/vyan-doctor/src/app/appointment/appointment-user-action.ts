"use server";

import { db } from "~/server/db";

// import { IAvailability } from "~/models/availability.model";
import { Day } from "@repo/database";
import { setHours, setMinutes } from "date-fns";
import { createTime } from "../lib/utils";
import { revalidatePath } from "next/cache";
import { TZDate } from "@date-fns/tz";
import { getServerAuthSession } from "~/server/auth";

interface IAvailability {
  availability: {
    available: boolean;
    day: Day;
    availableTimings: {
      startingTime: Date;
      endingTime: Date;
    }[];
  }[];
}
const AppointmentUserAction = async (availabilities: IAvailability) => {
  const session = await getServerAuthSession();
  if (!session) {
    throw new Error("Unauthorised");
  }
  if (!session.user.email) {
    throw new Error("Unauthorised");
  }
  const professionalUser = await db.professionalUser.findFirst({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  if (!professionalUser) {
    throw new Error("Professional User Not Found");
  }

  // console.log(
  //   "availabilityTimingstime",
  //   availabilities.availability[0]?.availabilityTimings[0]?.startingTime,
  // );
  try {
    // delete appointments
    // here i am using deleteMany because it will delete the whole record
    await db.availability.deleteMany({
      where: {
        professionalUserId: professionalUser.id,
      },
    });
    // iterate through each availability object
    for (const availability of availabilities.availability) {
      const dayEnum: Day | undefined = Day[availability.day];
      if (dayEnum === undefined) {
        throw new Error(`Invalid day: ${availability.day}`);
      }

      const date = new Date();

      // const availableTimings = availability.availableTimings.map((timing) => ({
      //   startingTime: createTime(
      //     timing.startingTime.hour,
      //     timing.startingTime.minute,
      //   ),
      //   endingTime: createTime(
      //     timing.endingTime.hour,
      //     timing.endingTime.minute,
      //   ),
      // }));

      const availableTimings = availability.availableTimings.map((timing) => ({
        startingTime: timing.startingTime,
        endingTime: timing.endingTime,
      }));

      console.log(
        "availabileTimings JSON",
        availableTimings[0]?.startingTime.toISOString(),
      );

      // create appointments
      const timeSlots = await db.availability.create({
        data: {
          available: availability.available,
          day: dayEnum,

          availableTimings: {
            // create new timing records for each timing in availability timings
            create: availableTimings,
          },
          professionalUserId: professionalUser.id,
        },
        include: {
          availableTimings: true,
        },
      });
      console.log(
        "timeSlots",
        timeSlots.availableTimings[0]?.startingTime.toTimeString(),
      );
    }
    revalidatePath("/doctor-profile");
    return {
      message: "Availabilities has been added",
    };
  } catch (error) {
    console.log("appointment", error);
    throw new Error("Availabilities has not been added");
  }
};

export default AppointmentUserAction;
