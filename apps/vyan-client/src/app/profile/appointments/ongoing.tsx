"use client";

import { Button } from "@repo/ui/src/@/components/button";
import Link from "next/link";
import { api } from "~/trpc/react";
import { differenceInMinutes, format } from "date-fns";
import CancelAppointment from "~/app/actions/cancel-appointment";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@repo/ui/src/@/components/dialog";
import { useState } from "react";
import Reschedule from "./reschedulte";
import { BookAppointmentStatus } from "@repo/database";
import AppointmentSkeleton from "./appointment-skeleton";
import { Calendar, Clock, Video, User, AlertCircle, CalendarX, ExternalLink } from "lucide-react";

const currentDate = new Date();

const Ongoing = () => {
  const { data, isLoading, refetch } =
    api.searchOngoingAppointments.searchOngoingAppointments.useQuery({
      date: currentDate,
    });

  const { toast } = useToast();

  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<string>();
  const [rescheduleExpertId, setRescheduleExpertId] = useState<string>();
  const [rescheduleAppointmentDate, setRescheduleAppointmentDate] = useState<Date>();
  const [rescheduleEventId, setRescheduleEventId] = useState<string>();
  const [rescheduleDuration, setRescheduleDuration] = useState<number>();

  const [cancelAppointmentId, setCancelAppointmentId] = useState<string>();
  const [cancelExpertId, setCancelExpertId] = useState<string>();
  const [cancelEventId, setCancelEventId] = useState<string>();
  const [cancelAppointmentStartingTime, setCancelAppointmentStartingTime] = useState<Date>();

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
      appointmentId,
      eventId,
      professionalUserId,
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
      });
  };

  const [close, setClose] = useState<boolean>();
  const handleDialogClose = (value: boolean) => {
    setClose(value);
  };

  const [openDialogReschedule, setOpenDialogReschedule] = useState<boolean>();
  const handleDialogReschedule = () => {
    setOpenDialogReschedule(true);
  };

  const currentTime = new Date();
  const handleCancelDialog = () => {
    setClose(true);
  };

  if (isLoading) {
    return <AppointmentSkeleton />;
  }

  return (
    <>
      {data?.typedAppointments && data.typedAppointments.length > 0 ? (
        <div className="flex flex-col gap-4">
          {data.typedAppointments.map((item, index) => {
            const durationMins = differenceInMinutes(
              new Date(item.endingTime!),
              new Date(item.startingTime!)
            );

            return (
              <div
                key={item.id || index}
                className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all hover:shadow-md md:p-6"
              >
                {/* Status Pill Badge */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-poppins text-base font-semibold text-[#181818] md:text-lg">
                      {item.patient.additionalPatients.length > 0 ? "Couple" : "Single"} Therapy
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#E6F4EE] px-2.5 py-0.5 font-inter text-xs font-semibold text-[#00898F]">
                      <Video className="h-3.5 w-3.5" />
                      Online
                    </span>
                  </div>

                  <div>
                    {item.status === BookAppointmentStatus.PAYMENT_SUCCESSFUL && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-0.5 font-inter text-xs font-medium text-amber-700">
                        Upcoming Today
                      </span>
                    )}
                    {item.status === BookAppointmentStatus.CANCELLED && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-0.5 font-inter text-xs font-medium text-red-600">
                        Cancelled
                      </span>
                    )}
                    {item.status === BookAppointmentStatus.COMPLETED && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#E6F4EE] px-2.5 py-0.5 font-inter text-xs font-semibold text-[#00898F]">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* Time & Session Length */}
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
                  <span className="font-inter text-sm font-semibold text-[#00898F]">
                    ₹{(item.totalPriceInCents || 0) / 100}
                  </span>
                </div>

                {/* Doctor & Patient Info */}
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
                </div>

                {/* Meet Link Trigger */}
                {item.status !== BookAppointmentStatus.CANCELLED &&
                  item.status !== BookAppointmentStatus.CANCELLED_WITH_REFUND &&
                  item.meeting?.hangoutLink && (
                    <div className="mt-2 mb-4">
                      <Link
                        href={item.meeting.hangoutLink}
                        target="_blank"
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#00898F] px-4 py-2.5 font-poppins text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#007277]"
                      >
                        <Video className="h-4 w-4" />
                        Join Google Meet Session
                        <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </div>
                  )}

                {/* Action Controls */}
                {item.status !== BookAppointmentStatus.CANCELLED &&
                  item.status !== BookAppointmentStatus.CANCELLED_WITH_REFUND &&
                  new Date(item.endingTime!) > currentTime && (
                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      {new Date(item.startingTime!) > currentTime && (
                        <span className="flex items-center gap-1 font-inter text-xs text-amber-600">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                          Cancellation available up to 2 hours before start
                        </span>
                      )}

                      <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                        {new Date(item.startingTime!) > currentTime && (
                          <>
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
                                handleDialogReschedule();
                              }}
                              className="rounded-xl bg-[#00898F] px-4 py-2 font-poppins text-xs font-semibold text-white hover:bg-[#007277]"
                            >
                              Reschedule
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
          <CalendarX className="h-10 w-10 text-gray-400 mb-2" />
          <h3 className="font-poppins text-base font-semibold text-gray-700">
            No Appointments Today
          </h3>
          <p className="font-inter text-xs text-gray-500 max-w-sm mt-1">
            You don't have any medical appointments scheduled for today.
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

      {/* Cancel Modal */}
      <Dialog open={close} onOpenChange={setClose}>
        <DialogContent className="w-full max-w-[420px] rounded-2xl p-6">
          <h3 className="font-poppins text-lg font-semibold text-[#181818]">
            Cancel Appointment?
          </h3>
          <p className="font-inter text-xs text-gray-600 mt-1">
            Are you sure you want to cancel today's appointment?
          </p>
          {cancelAppointmentStartingTime && (
            <div className="mt-2 rounded-xl bg-amber-50 p-3 font-inter text-xs text-amber-700">
              {Math.abs(differenceInMinutes(new Date(cancelAppointmentStartingTime), currentTime)) > 120
                ? "✓ Full refund will be issued."
                : "⚠️ Refund will not be issued for cancellations within 2 hours of start time."}
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

export default Ongoing;

