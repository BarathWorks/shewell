"use server";

import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { format, formatISO } from "date-fns";
import { getServerAuthSession } from "~/server/auth";

const DeleteAvailabilityUserAction = async (date: Date) => {
  //   console.log("datesforunavailabilityDay", formatISO(date));
  const session = await getServerAuthSession();

  if(!session){
    throw new Error("Unauthorised")
  }
  if(!session.user.email){
    throw new Error("Unauthorised")
  }

  try {
    const professionalUser = await db.professionalUser.findFirst({
      select: {
        id: true,
      },
      where: {
        email: session.user.email,
      },
    });
    if (!professionalUser) {
      throw new Error("Professional User has not been found");
      return;
    }

    const unavailableDay = await db.unAvailableDay.findFirst({
      select: {
        date: true,
        id: true
      },
      where: {
        date: new Date(format(formatISO(date),"yyyy-MM-dd")),
        professionalUserId: professionalUser.id,
      },
    });

    if (!unavailableDay) {
      console.log(
        "dateForUnavailableDay",
        unavailableDay,
        "date",
        formatISO(date),
        "professionalUserId",
        professionalUser.id,
      );
      throw new Error("Unavailable day has not been found");
      return;
    }
   
    await db.unAvailableDay.delete({
      where: {
        id: unavailableDay.id,
      },
    });
    revalidatePath("/appointment");
    return {
      message: "Unavailable day has been deleted",
    };
  } catch (error) {
    console.log(error);
    throw new Error("Unavailability has not been deleted");
  }
};

export default DeleteAvailabilityUserAction;
