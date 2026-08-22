"use client";
import { Button } from "@repo/ui/src/@/components/button";
import AppointmentData from "./appointment-data";
import { api } from "~/trpc/react";
// import { Duration } from "./page";
import { differenceInMinutes, format } from "date-fns";
import Rebook from "./rebook";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { useState } from "react";
import AddReviewRatingUserAction from "./add-review-and-rating-user-action";
import { toast, useToast } from "@repo/ui/src/@/components/use-toast";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PastForm from "./past-form";
import { BookAppointmentStatus } from "@repo/database";
import React from "react";
import AppointmentSkeleton from "./appointment-skeleton";
const currentDate = new Date();
/**
 * Optional throughout, matching what the tRPC query actually returns.
 *
 * These fields were declared required while the serialised router output carries
 * them as optional — the mismatch that `ignoreBuildErrors` was hiding. The JSX
 * already reads each one defensively.
 */
interface IAdditionalPatients {
  firstName?: string;
  phoneNumber?: string;
  email?: string;
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
  // use to refetch the data using trpc
  const trpcContext = api.useUtils();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  // completed appointments
  const {
    data: completedAppointments,
    isLoading,
    refetch,
  } = api.searchCompletedAppointments.searchCompletedAppointments.useQuery({
    date: currentDate,
    timeRange: duration!,
  });

 
  // if (!rating) {
  //   return;
  // }
  // if (!review) {
  //   return;
  // }
  const { toast } = useToast();

  const [expertId, setExpertId] = useState<string>();
  const [bookedAppointmentId, setBookedAppointmentId] = useState<string>();
  const handleAddReview = (
    professionalUserId: { professionalUserId: string },
    bookAppointmentId: { bookAppointmentId: string },
  ) => {
    setExpertId(professionalUserId.professionalUserId),
      setBookedAppointmentId(bookAppointmentId.bookAppointmentId);
  };

  const onSubmit = (
    // professionalUserId: string,
    // bookAppointmentId: string,
    data: z.infer<typeof schema>,
  ) => {
    const rating = data.rating;
    const review = data.review;
    const professionalUserId = expertId!;
    const bookAppointmentId = bookedAppointmentId!;

    AddReviewRatingUserAction({
      review,
      rating,
      professionalUserId,
      bookAppointmentId,
    })
      .then((resp) => {
        // See the note in past-form.tsx: a rejected review returns `{ error }`, and
        // reading only `message` showed an empty toast.
        if (resp?.error) {
          toast({ description: resp.error, variant: "destructive" });
          return;
        }
        toast({
          description: resp?.message,
          variant: "default",
        });
        reset();
        // setRating(0);
        // setReview("");
        refetch();
        trpcContext.invalidate();
      })
      .catch((err) => {
        console.log(err);
        toast({
          description: err.message,
          variant: "destructive",
        });
      });
  };

  const [openDialogRebook, setOpenDialogRebook] = useState<boolean>();
  const handleDialogRebook = () => {
    setOpenDialogRebook(true);
  };

  const [rebookExpertId, setRebookExpertId] = useState<string>();
  const [rebookAppointmentId, setRebookAppointmentId] = useState<string>();
  const [rebookPatientId, setRebookPatientId] = useState<string>();
  const [rebookPatientEmail, setRebookPatientEmail] = useState<string>();
  const [rebookPatientFirstName, setRebookPatientFirstName] =
    useState<string>();
  const [rebookPatientMessage, setRebookPatientMessage] = useState<string>();
  const [rebookAdditionalPatients, setRebookAdditionalPatients] =
    useState<IAdditionalPatients[]>();
  const [rebookPatientPhoneNumber, setRebookPatientPhoneNumber] =
    useState<string>();
  const [rebookIsCouple, setRebookIsCouple] = useState<boolean>();
  const [rebookDefaultDuration, setRebookDefaultDuration] = useState<number>();
  return (
    <>
      {isLoading ? (
        <AppointmentSkeleton/>
      ) : completedAppointments?.completedAppointments.length! > 0 ? (
        <div
          className={`flex  flex-col gap-[14px]  ${completedAppointments?.completedAppointments.length! > 2 ? "h-[400px] overflow-y-scroll" : ""}`}
        >
          {/* session-completed */}
          <div className="flex  flex-col gap-[14px]  ">
            {completedAppointments?.completedAppointments.map((item, index) => {
              // console.log("appointmentId", item.id);
              return (
                <>
                  <div
                    key={item.id}
                    className="flex w-full flex-col gap-[14px] rounded-[8px]  border-b py-2 md:border md:p-3 lg:p-4 xl:p-5 2xl:p-6"
                  >
                    {item.status === BookAppointmentStatus.COMPLETED && (
                      <div className="self-end rounded-lg bg-secondary-50 px-2 py-1 font-inter text-xs font-medium text-secondary">
                        Session Completed
                      </div>
                    )}
                    {item.status === BookAppointmentStatus.CANCELLED && (
                      <div className="self-end rounded-lg bg-secondary-50 px-2 py-1 font-inter text-xs font-medium text-red-500">
                        Session Cancelled
                      </div>
                    )}
                    {item.status ===
                      BookAppointmentStatus.PAYMENT_SUCCESSFUL && (
                      <div className="self-end rounded-lg bg-secondary-50 px-2 py-1 font-inter text-xs font-medium text-red-500">
                        Pending..
                      </div>
                    )}
                    <div className="flex w-full items-start gap-[6px] md:gap-2 lg:gap-3 2xl:gap-4">
                      {/* calendar-svg */}
                      <div className="pt-1">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.5703 8.08594C13.9586 8.08594 14.2734 7.77114 14.2734 7.38281C14.2734 6.99449 13.9586 6.67969 13.5703 6.67969C13.182 6.67969 12.8672 6.99449 12.8672 7.38281C12.8672 7.77114 13.182 8.08594 13.5703 8.08594Z"
                            fill="#00898F"
                          />
                          <path
                            d="M15.1875 1.40625H14.2734V0.703125C14.2734 0.314789 13.9586 0 13.5703 0C13.182 0 12.8672 0.314789 12.8672 0.703125V1.40625H9.66797V0.703125C9.66797 0.314789 9.35318 0 8.96484 0C8.57651 0 8.26172 0.314789 8.26172 0.703125V1.40625H5.09766V0.703125C5.09766 0.314789 4.78287 0 4.39453 0C4.0062 0 3.69141 0.314789 3.69141 0.703125V1.40625H2.8125C1.26169 1.40625 0 2.66794 0 4.21875V15.1875C0 16.7383 1.26169 18 2.8125 18H8.19141C8.57974 18 8.89453 17.6852 8.89453 17.2969C8.89453 16.9085 8.57974 16.5938 8.19141 16.5938H2.8125C2.03709 16.5938 1.40625 15.9629 1.40625 15.1875V4.21875C1.40625 3.44334 2.03709 2.8125 2.8125 2.8125H3.69141V3.51562C3.69141 3.90396 4.0062 4.21875 4.39453 4.21875C4.78287 4.21875 5.09766 3.90396 5.09766 3.51562V2.8125H8.26172V3.51562C8.26172 3.90396 8.57651 4.21875 8.96484 4.21875C9.35318 4.21875 9.66797 3.90396 9.66797 3.51562V2.8125H12.8672V3.51562C12.8672 3.90396 13.182 4.21875 13.5703 4.21875C13.9586 4.21875 14.2734 3.90396 14.2734 3.51562V2.8125H15.1875C15.9629 2.8125 16.5938 3.44334 16.5938 4.21875V8.22656C16.5938 8.6149 16.9085 8.92969 17.2969 8.92969C17.6852 8.92969 18 8.6149 18 8.22656V4.21875C18 2.66794 16.7383 1.40625 15.1875 1.40625Z"
                            fill="#00898F"
                          />
                          <path
                            d="M13.7461 9.49219C11.4005 9.49219 9.49219 11.4005 9.49219 13.7461C9.49219 16.0917 11.4005 18 13.7461 18C16.0917 18 18 16.0917 18 13.7461C18 11.4005 16.0917 9.49219 13.7461 9.49219ZM13.7461 16.5938C12.1759 16.5938 10.8984 15.3163 10.8984 13.7461C10.8984 12.1759 12.1759 10.8984 13.7461 10.8984C15.3163 10.8984 16.5938 12.1759 16.5938 13.7461C16.5938 15.3163 15.3163 16.5938 13.7461 16.5938Z"
                            fill="#00898F"
                          />
                          <path
                            d="M14.7656 13.043H14.4492V12.3047C14.4492 11.9164 14.1344 11.6016 13.7461 11.6016C13.3578 11.6016 13.043 11.9164 13.043 12.3047V13.7461C13.043 14.1344 13.3578 14.4492 13.7461 14.4492H14.7656C15.154 14.4492 15.4688 14.1344 15.4688 13.7461C15.4688 13.3578 15.154 13.043 14.7656 13.043Z"
                            fill="#00898F"
                          />
                          <path
                            d="M10.5117 8.08594C10.9 8.08594 11.2148 7.77114 11.2148 7.38281C11.2148 6.99449 10.9 6.67969 10.5117 6.67969C10.1234 6.67969 9.80859 6.99449 9.80859 7.38281C9.80859 7.77114 10.1234 8.08594 10.5117 8.08594Z"
                            fill="#00898F"
                          />
                          <path
                            d="M7.45312 11.1445C7.84145 11.1445 8.15625 10.8297 8.15625 10.4414C8.15625 10.0531 7.84145 9.73828 7.45312 9.73828C7.0648 9.73828 6.75 10.0531 6.75 10.4414C6.75 10.8297 7.0648 11.1445 7.45312 11.1445Z"
                            fill="#00898F"
                          />
                          <path
                            d="M4.39453 8.08594C4.78286 8.08594 5.09766 7.77114 5.09766 7.38281C5.09766 6.99449 4.78286 6.67969 4.39453 6.67969C4.00621 6.67969 3.69141 6.99449 3.69141 7.38281C3.69141 7.77114 4.00621 8.08594 4.39453 8.08594Z"
                            fill="#00898F"
                          />
                          <path
                            d="M4.39453 11.1445C4.78286 11.1445 5.09766 10.8297 5.09766 10.4414C5.09766 10.0531 4.78286 9.73828 4.39453 9.73828C4.00621 9.73828 3.69141 10.0531 3.69141 10.4414C3.69141 10.8297 4.00621 11.1445 4.39453 11.1445Z"
                            fill="#00898F"
                          />
                          <path
                            d="M4.39453 14.2031C4.78286 14.2031 5.09766 13.8883 5.09766 13.5C5.09766 13.1117 4.78286 12.7969 4.39453 12.7969C4.00621 12.7969 3.69141 13.1117 3.69141 13.5C3.69141 13.8883 4.00621 14.2031 4.39453 14.2031Z"
                            fill="#00898F"
                          />
                          <path
                            d="M7.45312 14.2031C7.84145 14.2031 8.15625 13.8883 8.15625 13.5C8.15625 13.1117 7.84145 12.7969 7.45312 12.7969C7.0648 12.7969 6.75 13.1117 6.75 13.5C6.75 13.8883 7.0648 14.2031 7.45312 14.2031Z"
                            fill="#00898F"
                          />
                          <path
                            d="M7.45312 8.08594C7.84145 8.08594 8.15625 7.77114 8.15625 7.38281C8.15625 6.99449 7.84145 6.67969 7.45312 6.67969C7.0648 6.67969 6.75 6.99449 6.75 7.38281C6.75 7.77114 7.0648 8.08594 7.45312 8.08594Z"
                            fill="#00898F"
                          />
                        </svg>
                      </div>

                      {/* appointment-data */}
                      <div key={index} className="w-full">
                        <div className="flex flex-col gap-[10px]">
                          {/* div-a */}
                          <div className="mb-3 flex items-center justify-between 2xl:mb-[14px]">
                            <div className="font-inter text-base font-semibold text-active xl:text-lg">
                              {item.patient.additionalPatients.length > 0
                                ? "Couple"
                                : "Single"}{" "}
                              Therapy
                            </div>
                            <div className="font-inter text-xs font-semibold text-inactive md:text-sm">
                              INR {item.totalPriceInCents! / 100}
                            </div>
                          </div>
                          {/* div-b */}
                          <div className="flex justify-between ">
                            {/* div-b-1 */}
                            <div className="flex items-center gap-[2px] 2xl:gap-[6px]">
                              <div className="">
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M11 6C11 8.76 8.76 11 6 11C3.24 11 1 8.76 1 6C1 3.24 3.24 1 6 1C8.76 1 11 3.24 11 6Z"
                                    stroke="#4D4D4D"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                  <path
                                    d="M7.85641 7.58988L6.30641 6.66488C6.03641 6.50488 5.81641 6.11988 5.81641 5.80488V3.75488"
                                    stroke="#4D4D4D"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                </svg>
                              </div>
                              <div className="font-inter text-xs font-medium text-inactive md:text-sm">
                                {format(item.startingTime!, "HH:mma")} -{" "}
                                {format(item.endingTime!, "HH:mma")},
                                {format(item.startingTime!, "MMMM dd, yyyy")}
                              </div>
                            </div>
                            {/* div-b-2 */}
                            <div className="font-inter text-xs font-semibold text-secondary  md:text-sm">
                              {differenceInMinutes(
                                new Date(item.endingTime!),
                                new Date(item.startingTime!),
                              )}{" "}
                              mins Session
                            </div>
                          </div>
                          {/* div-c */}
                          <div className="flex flex-col gap-[10px] lg:flex-row lg:justify-between">
                            {/* div-c-1 */}
                            <div className="flex  items-center gap-2">
                              <div className="font-inter text-sm font-semibold text-primary md:text-[15px] md:leading-[22px] xl:text-base">
                                Participants:{" "}
                              </div>
                              <div className="font-inter text-xs font-normal md:text-sm">
                                {/* PBKCO, Taki( Father), Mini( Mother){" "} */}
                                {item.patient.firstName}{" "}
                                {item.patient.additionalPatients.map(
                                  (additionalPatient, index) =>
                                    "," +
                                    additionalPatient.firstName +
                                    (index <
                                    item.patient.additionalPatients.length - 1
                                      ? ","
                                      : ""),
                                )}
                              </div>
                            </div>
                            {/* div-c-2 */}
                            <div className="flex  items-center gap-2">
                              {" "}
                              <div className="font-inter text-sm font-semibold text-primary md:text-[15px] md:leading-[22px]  xl:text-base ">
                                Doctor:
                              </div>
                              <div className="font-inter text-xs font-normal md:text-sm ">
                                Dr.{item.professionalUser.firstName} {item.professionalUser.displayQualification?.specialization && (item.professionalUser.displayQualification?.specialization)}
                              </div>
                            </div>
                          </div>
                          {/* div-e */}
                          {item.patient.message && (
                            <div className="flex  items-center gap-2">
                              {" "}
                              <div className="font-inter text-sm font-semibold text-primary md:text-[15px] md:leading-[22px] xl:text-base ">
                                Message:
                              </div>
                              <div className="font-inter text-xs font-normal text-muted xl:text-sm">
                                {item.patient.message}
                              </div>
                            </div>
                          )}
                          {/* div-f */}
                          <div className="flex items-center justify-between ">
                            <div className="font-inter text-xs font-medium text-inactive">
                              Appointment booked for
                              {" "}
                              {
                                item.professionalUser.displayQualification
                                  ?.specialization
                              }
                            </div>
                            <div className="flex items-center gap-1">
                              <div>
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 14 14"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M11.6654 5.83366C11.6654 9.33366 6.9987 12.8337 6.9987 12.8337C6.9987 12.8337 2.33203 9.33366 2.33203 5.83366C2.33203 4.59598 2.8237 3.409 3.69887 2.53383C4.57404 1.65866 5.76102 1.16699 6.9987 1.16699C8.23638 1.16699 9.42336 1.65866 10.2985 2.53383C11.1737 3.409 11.6654 4.59598 11.6654 5.83366Z"
                                    stroke="#00898F"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                  <path
                                    d="M7 7.58301C7.9665 7.58301 8.75 6.79951 8.75 5.83301C8.75 4.86651 7.9665 4.08301 7 4.08301C6.0335 4.08301 5.25 4.86651 5.25 5.83301C5.25 6.79951 6.0335 7.58301 7 7.58301Z"
                                    stroke="#00898F"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                </svg>
                              </div>
                              <div className="font-inter text-sm font-normal text-secondary">
                                Online Appointment
                              </div>
                            </div>
                          </div>

                          <div className="self-end">
                            <Button
                              onClick={() => {
                                setRebookExpertId(item.professionalUser.id),
                                  setRebookAppointmentId(item.id),
                                  setRebookPatientId(item.patient.id),
                                  setRebookPatientEmail(item.patient.email),
                                  setRebookPatientFirstName(
                                    item.patient.firstName,
                                  ),
                                  setRebookPatientPhoneNumber(
                                    item.patient.phoneNumber,
                                  ),
                                  setRebookPatientMessage(
                                    item.patient.message!,
                                  );
                                setRebookAdditionalPatients(
                                  item.patient.additionalPatients,
                                );

                                setRebookIsCouple(
                                  item.patient.additionalPatients.length > 0
                                    ? true
                                    : false,
                                );

                                const slotDuration = differenceInMinutes(
                                  new Date(item.endingTime!),
                                  new Date(item.startingTime!),
                                );
                                setRebookDefaultDuration(slotDuration);
                                handleDialogRebook();
                              }}
                              className="self-end rounded-md bg-secondary px-4 py-2 font-inter text-[14px] font-medium leading-6 hover:bg-secondary xl:px-[53.5px] "
                            >
                              Rebook
                            </Button>
                          </div>

                          {item.professionalRating?.rating &&
                            item.professionalRating.review && (
                              <div className="flex items-center gap-2">
                                <Rating
                                  style={{ maxWidth: 150 }}
                                  // value={
                                  //   rating! || item.professionalRating?.rating!
                                  // }
                                  value={item.professionalRating.rating}
                                  // onChange={handleChangeRating}
                                  itemStyles={customStyles}
                                  readOnly
                                />

                                <div>{item.professionalRating.review}</div>
                              </div>
                            )}

                          {item.status === BookAppointmentStatus.COMPLETED &&
                            !item.professionalRating?.rating &&
                            !item.professionalRating?.review && (
                              <PastForm
                                reviewExist={
                                  item.professionalRating?.rating ? true : false
                                }
                                bookAppointmentId={item.id}
                                professionalUserId={item.professionalUser.id}
                              />
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        </div>
      ) : (
        "There are no Past appointments"
      )}

      {/* rebook-dialogue */}
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
    </>
  );
};
export default Past;
