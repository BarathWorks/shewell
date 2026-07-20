"use client";

import { Button } from "@repo/ui/src/@/components/button";
import { api } from "~/trpc/react";
import { differenceInMinutes, format } from "date-fns";
import Rebook from "./rebook";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { useState } from "react";
import AddReviewRatingUserAction from "./add-review-and-rating-user-action";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PastForm from "./past-form";
import { BookAppointmentStatus } from "@repo/database";
import React from "react";
import AppointmentSkeleton from "./appointment-skeleton";
import { Calendar, Clock, Video, User, CheckCircle2, CalendarX, RotateCcw } from "lucide-react";

const currentDate = new Date();

interface IAdditionalPatients {
  firstName: string;
  phoneNumber: string;
  email: string;
}

const StarDrawing = (
  <path d="M15.1533 1.24496C14.6395 0.359428 13.3607 0.359425 12.8468 1.24496L9.2281 7.48137C8.97427 7.91882 8.53553 8.21734 8.03545 8.29287L1.2537 9.31717C0.114654 9.48921 -0.284892 10.9274 0.602182 11.6623L5.6543 15.8479C6.12196 16.2354 6.34185 16.8465 6.22825 17.4431L4.90669 24.3833C4.69778 25.4804 5.8495 26.3328 6.8377 25.8125L13.2236 22.4501C13.7096 22.1941 14.2905 22.1941 14.7766 22.4501L21.1625 25.8125C22.1507 26.3328 23.3024 25.4804 23.0935 24.3833L21.7719 17.4431C21.6583 16.8465 21.8782 16.2354 22.3459 15.8479L27.398 11.6623C28.285 10.9274 27.8855 9.48921 26.7465 9.31717L19.9647 8.29287C19.4646 8.21734 19.0259 7.91882 18.7721 7.48137L15.1533 1.24496Z" />
);

const customStyles = {
  itemShapes: StarDrawing,
  inactiveFillColor: "#ECECEC",
  activeFillColor: "#00898F",
};

export enum Duration {
  ONE_WEEK = "1_WEEK",
  ONE_MONTH = "1_MONTH",
  THREE_MONTHS = "3_MONTHS",
  SIX_MONTHS = "6_MONTHS",
  ONE_YEAR = "1_YEAR",
}

const Past = ({ duration }: { duration: Duration | undefined }) => {
  const schema = z.object({
    rating: z.number({ required_error: "Please give the rating" }),
    review: z.string({ required_error: "Please give the review" }),
  });

  const trpcContext = api.useUtils();

  const { reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const {
    data: completedAppointments,
    isLoading,
    refetch,
  } = api.searchCompletedAppointments.searchCompletedAppointments.useQuery({
    date: currentDate,
    timeRange: duration!,
  });

  const { toast } = useToast();

  const [expertId, setExpertId] = useState<string>();
  const [bookedAppointmentId, setBookedAppointmentId] = useState<string>();

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
      {completedAppointments?.completedAppointments &&
      completedAppointments.completedAppointments.length > 0 ? (
        <div className="flex flex-col gap-4">
          {completedAppointments.completedAppointments.map((item, index) => {
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

                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E6F4EE] px-2.5 py-1 font-inter text-xs font-semibold text-[#00898F]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Completed
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

                {/* Rating & Review or Add Review Form */}
                <div className="my-3 border-t border-gray-100 pt-3">
                  {item.professionalRating?.rating && item.professionalRating.review ? (
                    <div className="flex flex-col gap-1.5 rounded-xl bg-gray-50 p-3">
                      <div className="flex items-center gap-2">
                        <Rating
                          style={{ maxWidth: 120 }}
                          value={item.professionalRating.rating}
                          itemStyles={customStyles}
                          readOnly
                        />
                        <span className="font-poppins text-xs font-semibold text-[#00898F]">
                          {item.professionalRating.rating} / 5
                        </span>
                      </div>
                      <p className="font-inter text-xs text-gray-600 italic">
                        "{item.professionalRating.review}"
                      </p>
                    </div>
                  ) : (
                    item.status === BookAppointmentStatus.COMPLETED && (
                      <PastForm
                        reviewExist={Boolean(item.professionalRating?.rating)}
                        bookAppointmentId={item.id}
                        professionalUserId={item.professionalUser.id}
                      />
                    )
                  )}
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
            No Past Appointments
          </h3>
          <p className="font-inter text-xs text-gray-500 max-w-sm mt-1">
            Completed appointments for the selected timeframe will be stored here.
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

export default Past;

