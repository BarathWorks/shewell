import { Button } from "~/components/ui/button";
import AppointmentData from "./appointment-data";
import Link from "next/link";
import Image from "next/image";
import { api } from "~/trpc/react";
import { differenceInMinutes, format } from "date-fns";
import CancelAppointment from "~/app/actions/cancel-appointment";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@repo/ui/src/@/components/dialog";

import { use, useEffect, useState } from "react";
import Reschedule from "./reschedulte";
import { BookAppointmentStatus } from "@repo/database";
import AppointmentSkeleton from "./appointment-skeleton";

const currentDate = new Date();
const Ongoing = () => {
  const { data, isLoading } =
    api.searchOngoingAppointments.searchOngoingAppointments.useQuery({
      date: currentDate,
    });
  console.log("ongoingData", data);

  const { toast } = useToast();

  const [rescheduleAppointmentId, setRescheduleAppointmentId] =
    useState<string>();
  const [rescheduleExpertId, setRescheduleExpertId] = useState<string>();
  const [rescheduleAppointmentDate, setRescheduleAppointmentDate] =
    useState<Date>();
  const [rescheduleEventId, setRescheduleEventId] = useState<string>();
  const [rescheduleDuration, setRescheduleDuration] = useState<number>()

  const [cancelAppointmentId, setCancelAppointmentId] = useState<string>();
  const [cancelExpertId, setCancelExpertId] = useState<string>();
  const [cancelEventId, setCancelEventId] = useState<string>();
  const [cancelAppointmentStartingTime, setCancelAppointmentStartingTime] =
    useState<Date>();
useEffect(() => {
  setRescheduleDuration(rescheduleDuration)
},[rescheduleDuration])

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
       
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: err.message,
        });
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
  // calculate time between booking time and current time
  const currentTime = new Date();
  const handleCancelDialog = () => {
    setClose(true);
  };
  return (
    <>
      {isLoading ? (
       <AppointmentSkeleton/>
      ) : data?.typedAppointments.length! > 0 ? (
        <div className={`flex  flex-col gap-[14px]  ${data?.typedAppointments.length! > 2 ? "h-[400px] overflow-y-scroll" : ""}`}>
          {/* <AppointmentData appointmentData={data?.onGoingAppointments} /> */}
          {data?.typedAppointments.map((item, index) => {
            // console.log("appointmentId", item.id);
            return (
              <>
                <div
                  key={item.id}
                  className="flex w-full flex-col gap-[14px] rounded-[8px] px-2  py-2 border md:p-3 lg:p-4 xl:p-5 2xl:p-6"
                >
                  {item.status === BookAppointmentStatus.PAYMENT_SUCCESSFUL && (
                    <div className="self-end rounded-lg bg-[#E6F4EE] px-2 py-1 font-inter text-xs font-medium text-red-500">
                      Pending..
                    </div>
                  )}
                  {item.status === BookAppointmentStatus.CANCELLED && (
                    <div className="self-end rounded-lg bg-[#E6F4EE] px-2 py-1 font-inter text-xs font-medium text-red-500">
                      Session Cancelled
                    </div>
                  )}
                  {item.status === BookAppointmentStatus.COMPLETED && (
                    <div className="self-end rounded-lg bg-[#E6F4EE] px-2 py-1 font-inter text-xs font-medium text-secondary">
                      Session Completed
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
                          <div className="flex items-center gap-[2px] 2xl:gap-[6px] ">
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
                              {item.patient.firstName}
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
                            <div className="font-inter text-xs font-normal text-[#898989] xl:text-sm">
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
                            }{" "}
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
                            <div className="font-inter text-[12px] md:text-sm font-semibold text-secondary">
                              Online Appointment
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* cancel and reschedule */}
                  {item.status === BookAppointmentStatus.CANCELLED ||
                  item.status === BookAppointmentStatus.CANCELLED_WITH_REFUND
                    ? " "
                    : new Date(item.endingTime) > currentTime && (
                        <div className="flex flex-col gap-[10px] lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex justify-between lg:gap-8">

                            {new Date(item.startingTime) > currentTime && (
                              <Button
                                onClick={() => {
                                  
                                  setCancelAppointmentId(item.id),
                                    setCancelExpertId(item.professionalUser.id),
                                    setCancelEventId(item.meeting?.id),
                                    setCancelAppointmentStartingTime(
                                      new Date(item.startingTime),
                                    );
                                  handleCancelDialog();
                                }}
                                className="bg-white px-4 py-2 font-inter text-sm font-medium text-[#CA0000] hover:bg-white"
                              >
                                Cancel{" "}
                              </Button>
                            )}
                            <div>
                              {new Date(item.startingTime) > currentTime && (
                                <>
                                  <Button
                                    onClick={() => {
                                      
                                      setRescheduleAppointmentDate(
                                        new Date(item.startingTime),
                                      ),
                                        setRescheduleAppointmentId(item.id);
                                      setRescheduleExpertId(
                                        item.professionalUser.id,
                                      );
                                      setRescheduleEventId(item.meeting?.id);
                                      const slotDuration = differenceInMinutes(
                                        new Date(item.endingTime!),
                                        new Date(item.startingTime!),
                                      )
                                      setRescheduleDuration(slotDuration)
                                      handleDialogReschedule();
                                    }}
                                    className="rounded-md bg-secondary px-4 py-2 font-inter text-sm font-medium hover:bg-secondary"
                                  >
                                    Reschedule
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          {new Date(item.startingTime) > currentTime && (
                            <div className="font-inter text-[10px] font-medium leading-[12px] text-[#CA0000] md:text-xs lg:order-first ">
                              *Cancellation of appointment can be done before 2
                              hrs of booked time
                            </div>
                          )}
                        </div>
                      )}

                  {/* meet-link */}
                  {item.status === BookAppointmentStatus.CANCELLED ||
                  item.status === BookAppointmentStatus.CANCELLED_WITH_REFUND
                    ? ""
                    : new Date(item.endingTime) > currentTime   && (
                        <Link
                          className="flex items-center justify-center gap-2 rounded-md border-2 border-primary py-1 text-primary "
                          href={item.meeting?.hangoutLink || ""}
                        >
                          {/* logo */}
                          <div className="w-8">
                            <div className="relative aspect-square w-full ">
                              <Image
                                className="object-cover"
                                alt=""
                                src="/images/meet.png"
                                fill={true}
                              />
                            </div>
                          </div>
                          <div className="font-inter text-xs font-medium text-active md:text-sm xl:text-base">
                            Go to meet link
                          </div>
                        </Link>
                      )}
                </div>
              </>
            );
          })}
        </div>
      ) : (
        "There are no appointemnts for today"
      )}

      {/* Reschedule-dialog */}
      <Reschedule
        open={openDialogReschedule!}
        onOpenChange={setOpenDialogReschedule}
        // appointmentId={item.id}
        appointmentId={rescheduleAppointmentId!}
        // expertId={item.professionalUser.id}
        expertId={rescheduleExpertId!}
        // appointmentDate={item.startingTime}
        appointmentDate={rescheduleAppointmentDate!}
        // eventId={item.meeting?.id}
        eventId={rescheduleEventId!}
        duration={rescheduleDuration!}
      />

      {/* Cancel-dialog */}

      <Dialog open={close} onOpenChange={setClose}>
        <DialogContent className="pt-10 sm:max-w-[425px] ">
          Are you sure you want to cancel the appointment ?
          {Math.abs(
            differenceInMinutes(cancelAppointmentStartingTime!, currentTime),
          ) > 120 ? (
            <div className="font-inter text-[#CA0000]">
              You wil get full refund
            </div>
          ) : (
            <div className="font-inter text-[#CA0000]">
              You will not get any refund
            </div>
          )}
          <div className="flex items-center justify-center gap-6 ">
            <Button
            className="bg-primary"
              onClick={() => {
                cancelAppointment({
                  appointmentId: cancelAppointmentId!,
                  eventId: cancelEventId!,
                  professionalUserId: cancelExpertId!,
                });
                handleDialogClose(false);
              }}
            >
              Yes
            </Button>
            <DialogClose>
              <Button className="bg-gray-500">No</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Ongoing;
