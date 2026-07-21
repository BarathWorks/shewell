"use client";

import { Button } from "@repo/ui/src/@/components/button";
import { api } from "~/trpc/react";
import { differenceInMinutes, format } from "date-fns";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@repo/ui/src/@/components/dialog";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import CancelAppointment from "~/app/actions/cancel-appointment";
import Reschedule from "./reschedulte";
import React from "react";
import AppointmentSkeleton from "./appointment-skeleton";
import { Calendar, Clock, Video, User, AlertCircle, CalendarX } from "lucide-react";

const date = new Date();

const Upcoming = () => {
  const { data, isLoading, refetch } =
    api.searchUpcomingAppointments.searchUpcomingAppointments.useQuery({
      date: date,
    });

  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<string>();
  const [rescheduleExpertId, setRescheduleExpertId] = useState<string>();
  const [rescheduleAppointmentDate, setRescheduleAppointmentDate] = useState<Date>();
  const [rescheduleEventId, setRescheduleEventId] = useState<string>();
  const [rescheduleDuration, setRescheduleDuration] = useState<number>();

  const [cancelAppointmentId, setCancelAppointmentId] = useState<string>();
  const [cancelExpertId, setCancelExpertId] = useState<string>();
  const [cancelEventId, setCancelEventId] = useState<string>();
  const [cancelAppointmentStartingTime, setCancelAppointmentStartingTime] = useState<Date>();

  const { toast } = useToast();

  const cancelAppointment = ({
    appointmentId,
    eventId,
    professionalUserId,
  }: {
    appointmentId: string;
    eventId: string;
    professionalUserId: string;
  }) => {
    CancelAppointment({
      appointmentId: appointmentId,
      eventId: eventId,
      professionalUserId: professionalUserId,
    })
      .then((resp) => {
        toast({
          title: resp?.message,
          variant: "default",
        });
        refetch();
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: err.message,
        });
        refetch();
      })
      .finally(() => {
        refetch();
      });
  };

  const [close, setClose] = useState<boolean>();
  const handleDialogClose = (value: boolean) => {
    setClose(value);
  };

  const [openDialogReschedule, setOpenDialogReschedule] = useState<boolean>();
  const handleRescheduleDialog = () => {
    setOpenDialogReschedule(true);
  };

  const handleCancelDialog = () => {
    setClose(true);
  };

  const currentTime = new Date();

  if (isLoading) {
    return <AppointmentSkeleton />;
  }

  return (
    <>
      {data?.typedUpcomingAppointments && data.typedUpcomingAppointments.length > 0 ? (
        <div className="flex flex-col gap-4">
          {data.typedUpcomingAppointments.map((item, index) => {
            const durationMins = differenceInMinutes(
              new Date(item.endingTime!),
              new Date(item.startingTime!)
            );

            return (
              <div
                key={item.id || index}
                className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all hover:shadow-md md:p-6"
              >
                {/* Top Row: Type, Price & Time */}
                <div className="flex flex-col gap-3 border-b border-gray-100 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-poppins text-base font-semibold text-[#181818] md:text-lg">
                        {item.patient.additionalPatients.length > 0 ? "Couple" : "Individual"} Therapy
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#E6F4EE] px-2.5 py-0.5 font-inter text-xs font-semibold text-[#00898F]">
                        <Video className="h-3.5 w-3.5" />
                        Online
                      </span>
                    </div>
                    <span className="font-inter text-sm font-semibold text-[#00898F]">
                      ₹{(item.totalPriceInCents || 0) / 100}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-inter text-[#666666] md:text-sm">
                    <div className="flex items-center gap-1.5 font-medium text-gray-700">
                      <Calendar className="h-4 w-4 text-[#00898F]" />
                      <span>{format(new Date(item.startingTime!), "EEEE, MMMM d, yyyy")}</span>
                      <Clock className="ml-2 h-4 w-4 text-[#00898F]" />
                      <span>
                        {format(new Date(item.startingTime!), "hh:mm a")} -{" "}
                        {format(new Date(item.endingTime!), "hh:mm a")}
                      </span>
                    </div>
                    <span className="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                      {durationMins} mins session
                    </span>
                  </div>
                </div>

                {/* Details Row: Participants, Doctor & Message */}
                <div className="my-4 flex flex-col gap-2 font-inter text-xs md:text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="font-semibold text-gray-800">Doctor:</span>
                    <span>
                      Dr. {item.professionalUser.firstName}{" "}
                      {item.professionalUser.displayQualification?.specialization &&
                        `(${item.professionalUser.displayQualification.specialization})`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="ml-6 font-semibold text-gray-800">Participants:</span>
                    <span>
                      {item.patient.firstName}
                      {item.patient.additionalPatients.map((ap) => `, ${ap.firstName}`).join("")}
                    </span>
                  </div>

                  {item.patient.message && (
                    <div className="ml-6 mt-1 rounded-xl bg-gray-50 p-2.5 text-xs text-gray-500 italic">
                      "{item.patient.message}"
                    </div>
                  )}
                </div>

                {/* Action Controls */}
                <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex items-center gap-1 font-inter text-xs text-amber-600">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    Cancellation available up to 2 hours before start
                  </span>

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCancelAppointmentId(item.id);
                        setCancelExpertId(item.professionalUser.id);
                        setCancelEventId(item.meeting?.id);
                        setCancelAppointmentStartingTime(item.startingTime);
                        handleCancelDialog();
                      }}
                      className="rounded-xl border-red-200 px-4 py-2 font-poppins text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      onClick={() => {
                        setRescheduleAppointmentDate(item.startingTime);
                        setRescheduleAppointmentId(item.id);
                        setRescheduleExpertId(item.professionalUser.id);
                        setRescheduleEventId(item.meeting?.id);
                        setRescheduleDuration(Number(durationMins));
                        handleRescheduleDialog();
                      }}
                      className="rounded-xl bg-[#00898F] px-4 py-2 font-poppins text-xs font-semibold text-white hover:bg-[#007277]"
                    >
                      Reschedule
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
          <CalendarX className="h-10 w-10 text-gray-400 mb-2" />
          <h3 className="font-poppins text-base font-semibold text-gray-700">
            No Upcoming Appointments
          </h3>
          <p className="font-inter text-xs text-gray-500 max-w-sm mt-1">
            You don't have any scheduled appointments coming up.
          </p>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleAppointmentId && (
        <Reschedule
          open={openDialogReschedule!}
          onOpenChange={setOpenDialogReschedule}
          appointmentId={rescheduleAppointmentId!}
          expertId={rescheduleExpertId!}
          appointmentDate={rescheduleAppointmentDate!}
          eventId={rescheduleEventId!}
          duration={rescheduleDuration!}
        />
      )}

      {/* Cancel Confirmation Modal */}
      <Dialog open={close} onOpenChange={setClose}>
        <DialogContent className="w-full max-w-[420px] rounded-2xl p-6">
          <h3 className="font-poppins text-lg font-semibold text-[#181818]">
            Cancel Appointment?
          </h3>
          <p className="font-inter text-xs text-gray-600 mt-1">
            Are you sure you want to cancel this appointment?
          </p>
          {cancelAppointmentStartingTime && (
            <div className="mt-2 rounded-xl bg-amber-50 p-3 font-inter text-xs text-amber-700">
              {Math.abs(differenceInMinutes(new Date(cancelAppointmentStartingTime), currentTime)) > 120
                ? "✓ Cancellation is before 2 hours. You are eligible for a full refund."
                : "⚠️ Cancellation is within 2 hours. Refund may not apply."}
            </div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl px-4 py-2 text-xs font-poppins font-medium">
                No, Keep
              </Button>
            </DialogClose>
            <Button
              onClick={() => {
                cancelAppointment({
                  appointmentId: cancelAppointmentId!,
                  eventId: cancelEventId!,
                  professionalUserId: cancelExpertId!,
                });
                handleDialogClose(false);
              }}
              className="rounded-xl bg-red-600 px-4 py-2 font-poppins text-xs font-semibold text-white hover:bg-red-700"
            >
              Yes, Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Upcoming;

