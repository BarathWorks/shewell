import "react-day-picker/dist/style.css";

import DateNavigationMeeting from "./date-navigation-meeting";
import TimePicker from "react-time-picker";
import FullCalendarPage from "./full-calendar";
import { db } from "~/server/db";
import { useState } from "react";
import React from "react";
import { format } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { getServerAuthSession } from "~/server/auth";
const Appointment = async () => {
  const session = await getServerAuthSession();
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
  

  return (
    <>
      <div className="w-full">
        <div className="container mx-auto max-w-full">
          <FullCalendarPage availabilities={availabilities} unavailableDays={professionalUser.unavailableDay} />

          <div>
            <DateNavigationMeeting
              unavailableDays={professionalUser.unavailableDay}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export default Appointment;
