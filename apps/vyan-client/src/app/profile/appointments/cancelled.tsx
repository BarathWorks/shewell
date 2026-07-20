"use client";

import { Button } from "@repo/ui/src/@/components/button";
import { api } from "~/trpc/react";
import { differenceInMinutes, format } from "date-fns";
import { useState } from "react";
import Rebook from "./rebook";
import React from "react";
import AppointmentSkeleton from "./appointment-skeleton";
import { Calendar, Clock, Video, User, XCircle, CalendarX, RotateCcw } from "lucide-react";

interface IAdditionalPatients {
  firstName: string;
  phoneNumber: string;
  email: string;
}

const Cancelled = () => {
  const { data, isLoading } =
    api.searchCancelledAppointments.searchCancelledAppointments.useQuery();

  const [openDialogRebook, setOpenDialogRebook] = useState<boolean>();
  const handleDialogRebook = () => {
    setOpenDialogRebook(true);
  };

  const [rebookExpertId, setRebookExpertId] = useState<string>();
  const [rebookAppointmentId, setRebookAppointmentId] = useState<string>();
  const [rebookPatientId, setRebookPatientId] = useState<string>();
  const [rebookPatientEmail, setRebookPatientEmail] = useState<string>();
  const [rebookPatientFirstName, setRebookPatientFirstName] = useState<string>();
  const [rebookPatientMessage, setRebookPatientMessage] = useState<string>();
  const [rebookAdditionalPatients, setRebookAdditionalPatients] = useState<IAdditionalPatients[]>();
  const [rebookPatientPhoneNumber, setRebookPatientPhoneNumber] = useState<string>();
  const [rebookIsCouple, setRebookIsCouple] = useState<boolean>();
  const [rebookDefaultDuration, setRebookDefaultDuration] = useState<number>();

  if (isLoading) {
    return <AppointmentSkeleton />;
  }

  return (
    <>
      {data?.cancelledAppointments && data.cancelledAppointments.length > 0 ? (
        <div className="flex flex-col gap-4">
          {data.cancelledAppointments.map((item, index) => {
            const durationMins = differenceInMinutes(
              new Date(item.endingTime!),
              new Date(item.startingTime!)
            );

            return (
              <div
                key={item.id || index}
                className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all hover:shadow-md md:p-6"
              >
                {/* Status Badge & Header */}
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

                  <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 font-inter text-xs font-medium text-red-600">
                    <XCircle className="h-3.5 w-3.5" />
                    Cancelled
                  </span>
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
                  <span className="font-inter text-sm font-semibold text-gray-400 line-through">
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

                {/* Rebook Action Button */}
                <div className="flex justify-end border-t border-gray-100 pt-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setRebookExpertId(item.professionalUser.id);
                      setRebookAppointmentId(item.id);
                      setRebookPatientId(item.patient.id);
                      setRebookPatientEmail(item.patient.email);
                      setRebookPatientFirstName(item.patient.firstName);
                      setRebookPatientPhoneNumber(item.patient.phoneNumber);
                      setRebookPatientMessage(item.patient.message || "");
                      setRebookAdditionalPatients(item.patient.additionalPatients);
                      setRebookIsCouple(item.patient.additionalPatients.length > 0);
                      setRebookDefaultDuration(Number(durationMins));
                      handleDialogRebook();
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-[#00898F] px-5 py-2 font-poppins text-xs font-semibold text-white hover:bg-[#007277]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Rebook Session
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
          <CalendarX className="h-10 w-10 text-gray-400 mb-2" />
          <h3 className="font-poppins text-base font-semibold text-gray-700">
            No Cancelled Appointments
          </h3>
          <p className="font-inter text-xs text-gray-500 max-w-sm mt-1">
            Appointments that were cancelled will be archived here.
          </p>
        </div>
      )}

      {/* Rebook Modal */}
      {rebookAppointmentId && (
        <Rebook
          open={openDialogRebook!}
          onOpenChange={setOpenDialogRebook}
          expertId={rebookExpertId!}
          appointmentId={rebookAppointmentId!}
          patientId={rebookPatientId!}
          patientEmail={rebookPatientEmail!}
          patientFirstName={rebookPatientFirstName!}
          patientPhoneNumber={rebookPatientPhoneNumber!}
          patientMessage={rebookPatientMessage!}
          additionalPatients={rebookAdditionalPatients!}
          isCouple={rebookIsCouple!}
          defaultDuration={rebookDefaultDuration!}
        />
      )}
    </>
  );
};

export default Cancelled;

