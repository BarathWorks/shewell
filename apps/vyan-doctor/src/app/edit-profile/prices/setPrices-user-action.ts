"use server";

import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

type IAppointmentPrice = {
  appointmentPrice: {
    // coupleSession: boolean;
    time: number|null;
    priceInCentsForSingle: number|null;
    priceInCentsForCouple : number | null
  }[];
};
const SetPriceUserAction = async ({ appointmentPrice }: IAppointmentPrice) => {
  const session = await getServerAuthSession();
  if(!session){
    throw new Error("Unauthorised")
  }
  if(!session.user.email){
    throw new Error("Unauthorised")
  }
  const professionalUser = await db.professionalUser.findFirst({
    select: {
      id: true,
    },
    where: {
      email: session.user.email,
    },
  });
  if (!professionalUser) {
    return;
  }

  try {
    // delete prices
    await db.professionalUserAppointmentPrice.deleteMany({
      where: {
        professionalUserId: professionalUser.id,
      },
    });
    // create prices
    await db.professionalUserAppointmentPrice.createMany({
      data: appointmentPrice.map((item) => ({
      
        priceInCentsForSingle: item.priceInCentsForSingle! * 100,
        priceInCentsForCouple : item.priceInCentsForCouple! * 100,
        time: item.time!,
        professionalUserId: professionalUser.id,
      })),
    });
    revalidatePath("/edit-profile/prices");
    
    return {
      message: "Prices are set",
    };
  } catch (error) {
    console.log("SetPriceUserAction", error);
    throw new Error("Prices did not set");
  }
};

export default SetPriceUserAction;
