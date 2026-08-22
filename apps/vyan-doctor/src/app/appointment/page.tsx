import React from "react";
import { redirect } from "next/navigation";
import "react-day-picker/dist/style.css";

import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { PageHeader, PageShell } from "~/components/ui/page";

import DateNavigationMeeting from "./date-navigation-meeting";
import FullCalendarPage from "./full-calendar";
import AppointmentSettings from "./appointment-settings";
import EditAvailablity from "./add-unavailability";

/**
 * Calendar and day schedule.
 *
 * Structural changes beyond the styling:
 *
 *  - The page returned bare `undefined` for a missing session, a missing email
 *    and a missing practitioner record. A component returning `undefined` renders
 *    nothing, so all three cases produced a blank white page with no explanation
 *    and no way forward. A signed-out visitor now goes to login (matching every
 *    other protected route), and a session with no practitioner record goes to
 *    registration, which is the only thing that can fix it.
 *  - The two controls that change the calendar — availability and blocked days —
 *    were rendered *inside* `FullCalendarPage`, on a teal banner above the grid.
 *    They are page-level actions, so they sit in the page header where the rest of
 *    the app puts them, and the calendar component is now just a calendar.
 *  - Dead imports removed: `TimePicker`, `useState` (in a server component),
 *    `format`, `TZDate`, and an `ITimeValue` interface declared inside the
 *    function body and never used.
 */
const Appointment = async () => {
  const session = await getServerAuthSession();

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const professionalUser = await db.professionalUser.findUnique({
    select: {
      id: true,
      unavailableDay: { select: { date: true } },
    },
    where: { email: session.user.email },
  });

  if (!professionalUser) {
    redirect("/auth/register/account-setup");
  }

  const availabilities = await db.availability.findMany({
    select: {
      available: true,
      day: true,
      availableTimings: {
        select: { startingTime: true, endingTime: true },
      },
    },
    where: { professionalUserId: professionalUser.id },
  });

  return (
    <PageShell>
      <PageHeader
        title="Appointments"
        description="Your consultation calendar. Set the hours you work, block the days you don't, and review each day's schedule below."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Appointments" }]}
        actions={
          <>
            <AppointmentSettings availabilities={availabilities} />
            <EditAvailablity unavailableDays={professionalUser.unavailableDay} />
          </>
        }
      />

      <div className="mt-6 flex flex-col gap-4">
        <FullCalendarPage
          availabilities={availabilities}
          unavailableDays={professionalUser.unavailableDay}
        />

        <DateNavigationMeeting
          unavailableDays={professionalUser.unavailableDay}
        />
      </div>
    </PageShell>
  );
};

export default Appointment;
