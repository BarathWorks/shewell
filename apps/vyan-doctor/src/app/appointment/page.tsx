import "react-day-picker/dist/style.css";

import DateNavigationMeeting from "./date-navigation-meeting";
import TimePicker from "react-time-picker";
import FullCalendarPage from "./full-calendar";
import { db } from "~/server/db";
import { getServerSession } from "next-auth";
import { useState } from "react";
import React from "react";
import { format } from "date-fns";
import { TZDate } from "@date-fns/tz";
const Appointment = async () => {
  const session = await getServerSession();
  if (!session) {
    return;
  }
  if(!session.user.email){
    return
  }
  const professionalUser = await db.professionalUser.findUnique({
    select: {
      id: true,
      unavailableDay: {
        select: {
          date: true,
        },
      },
    },
    where: {
      email: session.user.email,
    },
  });

  if (!professionalUser) {
    return;
  }
  const availabilities = await db.availability.findMany({
    select: {
      available: true,
      day: true,
      availableTimings: {
        select: {
          startingTime: true,
          endingTime: true,
        },
      },
    },
    where: {
      professionalUserId: professionalUser.id,
    },
  });

  interface ITimeValue {
    hour: number;
    minute: number;
  }
  console.log("unavailableDays", professionalUser.unavailableDay);
  

  const prices = await db.professionalUserAppointmentPrice.findFirst({
    where: {
      professionalUserId: professionalUser.id,
    },
    select: {
      priceInCentsForSingle: true,
      priceInCentsForCouple: true,
    },
  });

  return (
    <>
      <div className="w-full">
        <div className="container mx-auto max-w-full">
          <FullCalendarPage
            availabilities={availabilities}
            unavailableDays={professionalUser.unavailableDay}
            prices={prices}
          />
        </div>
      </div>
    </>
  );
};
export default Appointment;
