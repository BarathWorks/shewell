"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/src/@/components/dialog";

import { Button } from "@repo/ui/src/@/components/button";

import PatientInformation from "./patient-information";

import AppointmentApproval from "./appointment-approval";
import { useCallback, useEffect, useState } from "react";
import Stepper from "./stepper";
import { AppointmentType } from "@repo/database";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { createTimeDate } from "~/lib/utils";
import { endOfDay, getHours, getMinutes } from "date-fns";
import CheckoutAction from "../actions/checkout-action";
import { makePayment } from "~/lib/razorpay-payment";
import { startOfDay } from "date-fns";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { env } from "~/env";

interface IExpertDetails {
  id: string;
  firstName: string;
}

interface IServiceModeDetails {
  // title: string;
  type: AppointmentType;
  price: number;
  description: string;
  planName: string;
}

interface IPatientProps {
  id: string;
  message?: string | null | undefined;
  firstName: string;
  lastName?: string | null | undefined;
  phoneNumber: string;
  email: string;
  additionalPatients: {
    firstName: string;
    lastName?: string | null | undefined;
    phoneNumber: string;
    message?: string | null | undefined;
    email: string;
    id: string;
    patientId: string | null;
  }[];
}
interface IAppointmentState {
  selectedExpert: IExpertDetails | null;
  selectedServiceMode: IServiceModeDetails | null;
  // selectedPatient: IPatientInformation | null;
  selectedPatient: IPatientProps | null;
  selectedDefaultDuration: number | null;
  selectedDuration: number | null;
  selectedSpecialisation: string | null;
  selectedCouple: boolean | null;
  selectedDateTime: {
    date: Date;
    // timeSlots: { startTime: Date; endTime: Date }[];
    timeSlots: { startTime: Date; endTime: Date };
  } | null;
  selectedPrice: { priceInCents: number } | null;
}

interface IPatientInformation {
  id: string;
  firstName: string;
  phoneNumber: string;
  email: string;
}
const OnlineAppointment = ({
  currentStep,
  expertId,
  firstName,
  date,
  timeSlots,
  priceInCents,
  duration,
  open,
  onOpenChange,
}: {
  currentStep: number;
  expertId: string;
  firstName: string;
  date: Date;
  duration: number;
  // timeSlots: { startTime: Date; endTime: Date }[];
  timeSlots: { startTime: Date; endTime: Date };
  priceInCents: number;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) => {
  const [step, setStep] = useState<number>(currentStep);
  const { toast } = useToast();
  const [close, setClose] = useState<boolean>();
  const router = useRouter();
  const trpcContext = api.useUtils();

  // state saving all data for booking the appointment
  const [appointmentState, setAppointmentState] = useState<IAppointmentState>({
    selectedExpert: null,
    selectedServiceMode: null,
    selectedPatient: null,
    selectedDefaultDuration: null,
    selectedDuration: null,
    selectedSpecialisation: null,
    selectedCouple: null,
    selectedDateTime: null,
    selectedPrice: null,
  });

  const handleExpertSelection = (expertDetails: IExpertDetails) => {
    setAppointmentState((prevState) => ({
      ...prevState,
      selectedExpert: expertDetails,
    }));
  };

  const handleDurationSelection = (value: number) => {
    setAppointmentState((prevState) => ({
      ...prevState,
      selectedDuration: value,
    }));
  };

  // callback function passed IN service-mode component (child-component)
  const handleServiceMode = useCallback(
    (serviceModeDetails: IServiceModeDetails) => {
      setAppointmentState((prevState) => ({
        ...prevState,
        selectedServiceMode: serviceModeDetails,
      }));
    },
    [],
  );

  const handlePatientInformation = useCallback(
    (patientDetails: IPatientProps) => {
      setAppointmentState((prevState) => ({
        ...prevState,
        selectedPatient: patientDetails,
      }));
    },
    [],
  );

  const handleDateTimeSelection = useCallback(
    (
      date: Date,
      // timeSlots: { startTime: Date; endTime: Date }[]
      timeSlots: { startTime: Date; endTime: Date },
    ) => {
      setAppointmentState((prevState) => ({
        ...prevState,
        selectedDateTime: { date, timeSlots },
      }));
    },
    [],
  );

  const handleSelectedSpecialisation = useCallback((value: string) => {
    setAppointmentState((prevState) => ({
      ...prevState,
      selectedSpecialisation: value,
    }));
  }, []);

  useEffect(() => {
    setAppointmentState((prevState) => ({
      ...prevState,
      selectedDateTime: { date, timeSlots },
    }));
  }, [date, timeSlots]);

  useEffect(() => {
    setAppointmentState((prevState) => ({
      ...prevState,
      selectedDefaultDuration: duration,
    }));
  }, [duration]);

  useEffect(() => {
    setAppointmentState((prevState) => ({
      ...prevState,
      selectedDuration: duration,
    }));
  }, [duration]);

  useEffect(() => {
    setAppointmentState((prevState) => ({
      ...prevState,
      selectedPrice: { priceInCents },
    }));
  }, [priceInCents]);

  useEffect(() => {
    setAppointmentState((prevState) => ({
      ...prevState,
      selectedServiceMode: {
        description:
          "Online (Virtual appointment) with doctor through Google Meet or Zoom.",
        planName: "Basic Plan",
        type: AppointmentType.ONLINE,
        price: priceInCents,
      },
    }));
  }, [priceInCents]);

  const handlePrice = useCallback((priceInCents: number) => {
    setAppointmentState((prevState) => ({
      ...prevState,
      selectedPrice: { priceInCents },
    }));
  }, []);

  const handleCoupleInformation = useCallback((value: boolean) => {
    setAppointmentState((prevState) => ({
      ...prevState,
      selectedCouple: value,
    }));
  }, []);

  const handleFinalPrice = useCallback((priceInCents: number) => {
    setAppointmentState((prevState) => ({
      ...prevState,
      selectedPrice: { priceInCents },
    }));
  }, []);

  const handleSubmit = async () => {
    const {
      selectedExpert,
      selectedServiceMode,
      selectedPatient,
      selectedDateTime,
      selectedPrice,
    } = appointmentState;

    // doing this object is possibly null error will removed
    if (
      !selectedExpert ||
      !selectedServiceMode ||
      !selectedPatient ||
      !selectedDateTime ||
      !selectedPrice
    ) {
      return;
    }
    const { date } = selectedDateTime;

    const startingTime = createTimeDate(
      // extract hour from startTime
      // getHours(new Date(selectedDateTime.timeSlots[0]?.startTime!)),
      getHours(new Date(selectedDateTime.timeSlots.startTime)),

      // Extract minute from startTime
      // getMinutes(new Date(selectedDateTime.timeSlots[0]?.startTime!)),
      getMinutes(new Date(selectedDateTime.timeSlots.startTime)),
      new Date(date),
    );

    const endingTime = createTimeDate(
      // Extract hour from endTime
      // getHours(new Date(selectedDateTime.timeSlots[0]?.endTime!)),
      getHours(new Date(selectedDateTime.timeSlots.endTime)),
      // Extract minute from endTime
      // getMinutes(new Date(selectedDateTime.timeSlots[0]?.endTime!)),
      getMinutes(new Date(selectedDateTime.timeSlots.endTime)),
      new Date(date),
    );

    const taxedAmount =
      (parseInt(env.NEXT_PUBLIC_GST) / 100) * selectedPrice.priceInCents;
    const totalPriceInCents =
      selectedPrice.priceInCents +
      (parseInt(env.NEXT_PUBLIC_GST) / 100) * selectedPrice.priceInCents;

    const transformedData = {
      serviceMode: {
        serviceType: selectedServiceMode.type,
        priceInCents: selectedPrice.priceInCents,
        taxedAmount: taxedAmount,
        totalPriceInCents: totalPriceInCents,
        description: selectedServiceMode.description,
        planName: selectedServiceMode.planName,
      },
      professionalUser: {
        professionalUserId: selectedExpert.id,
      },
      patient: {
        id: selectedPatient.id,
        firstName: selectedPatient.firstName,
        email: selectedPatient.email,
        phoneNumber: selectedPatient.phoneNumber,
        message: selectedPatient.message!,
        additionalPatients: selectedPatient.additionalPatients.map((item) => ({
          firstName: item.firstName,
          email: item.email,
          phoneNumber: item.phoneNumber,
        })),
      },
      startingTime: startingTime,
      endingTime: endingTime,
    };

    const data = await trpcContext.searchTimeSlots.searchTimeSlots.fetch({
      date: endOfDay(new Date(date)),
      expertId: selectedExpert.id,
    });

    const parsedBookedSlots =
      data?.bookedSlots?.map((slot) => ({
        startingTime: new Date(slot.startingTime),
        endingTime: new Date(slot.endingTime),
      })) ?? [];

    const hasOverlap = parsedBookedSlots.some((bookedSlot) => {
      return (
        startingTime < bookedSlot.endingTime &&
        endingTime > bookedSlot.startingTime
      );
    });

    if (hasOverlap) {
      toast({
        variant: "destructive",
        title:
          "This timeslot is already booked. Please select a different time.",
      });
      return;
    }

    try {
      const resp = await makePayment(transformedData);
      
      if (resp.success) {
        toast({
          title: "Appointment Booked",
          description: resp.message,
        });
        
        // Reset states only on success
        setClose(false);
        setStep(1);
        onOpenChange(false);
        
        // Clear appointment state for next time
        setAppointmentState({
          selectedExpert: null,
          selectedServiceMode: null,
          selectedPatient: null,
          selectedDefaultDuration: null,
          selectedDuration: null,
          selectedSpecialisation: null,
          selectedCouple: null,
          selectedDateTime: null,
          selectedPrice: null,
        });
      }
    } catch (err: any) {
      console.error("Payment flow error:", err);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: err.message || "Something went wrong during the booking process.",
      });
    }
    // console.log("payment");
  };

  const steps = [
    // { title: "Already a Customer" },
    // { title: "Select Service Mode" },
    // { title: "Select Expert" },
    // { title: "Select Time & Date" },
    { title: "Patient Information" },
    { title: "Appointment Approval" },
  ];
  if (!appointmentState) {
    return;
  }
  // console.log(
  //   "appointmentStateselectedDateTime",
  //   appointmentState.selectedDateTime?.timeSlots[0]?.startTime,
  // );
  useEffect(() => {
    if (!close) {
      setAppointmentState((prevState) => ({
        ...prevState,
        selectedDateTime: { date, timeSlots },
        selectedExpert: { id: expertId, firstName: firstName },
        selectedPrice: { priceInCents },
        selectedServiceMode: {
          description:
            "Online (Virtual appointment) with doctor through Google Meet or Zoom.",
          planName: "Basic Plan",
          type: AppointmentType.ONLINE,
          price: priceInCents,
        },
      }));
      setStep(1);
    }
  }, [timeSlots]);

  // const {data : priceInCentsForCouple} = api.timeDurationAndPriceForCouple.timeDurationAndPriceForCouple.useQuery({
  //   professionalUserId : selectedExpert.id
  // })
  // console.log("priceInCentsForCoup;e", priceInCentsForCouple)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className=" h-[90vh] w-full overflow-y-auto p-0 xs:max-w-[300px] sm:max-w-[393px] lg:max-w-[904px] xl:max-w-[1100px] 2xl:max-w-[1280px]">
          {/* heading */}
          <div className=" border-b border-border-color">
            <div className="flex justify-between px-3  pb-2 pt-[30px] lg:px-[30px]">
              <div className="flex items-center gap-4">
                {step > 1 && (
                  <div className="hidden bg-[#F5F5F5] p-[10px] font-inter text-sm font-medium lg:block">
                    <div className="flex items-center gap-[3px]">
                      <div>
                        <svg
                          width="8"
                          height="14"
                          viewBox="0 0 8 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7 13L1 7L7 1"
                            stroke="#121212"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </div>
                      <div
                        className="cursor-pointer"
                        onClick={() => setStep(step - 1)}
                      >
                        Back
                      </div>
                    </div>
                  </div>
                )}

                <div className="font-inter text-[20px] font-semibold leading-[30px]">
                  Register for appointment
                </div>
              </div>
            </div>
          </div>
          {/* main-content */}
          <div className="flex flex-col pb-[100px] lg:flex-row  lg:gap-[76px] lg:px-[60px] xl:gap-[100px] 2xl:gap-[144px]">
            {/* left-options */}
            <div className="lg:basis-[231px]">
              <Stepper currentStep={step - 1} steps={steps} setStep={setStep} />
            </div>
            {/* right-options */}
            <div className="w-full lg:basis-[477px] xl:basis-[657px]">
              {/* <Button onClick={handleSubmit}>Submit</Button> */}
              {/* {step === 1 && <AlreadyCustomer />} */}
              {/* passing callback function to child */}
              {/* {step === 1 && (
                <ServiceMode
                  isActive={step === 1}
                  onNextStep={() => setStep(step + 1)}
                  onOptionSelect={handleServiceMode}
                  priceInCentsForSingle={
                    appointmentState.selectedPrice?.priceInCents! / 100
                  }
                  // initialSelectOption={
                  //   appointmentState.selectedServiceMode?.title!
                  // }
                />
              )} */}
              {/* {step === 2 && (
                <SelectExpert
                  defaultDoctorId={appointmentState.selectedExpert?.id!}
                  defaultSpecialisation={
                    appointmentState.selectedSpecialisation!
                  }
                  isActive={step === 2}
                  onNextStep={() => setStep(step + 1)}
                  onSelectDoctor={handleExpertSelection}
                  onSelectSpecialisation={handleSelectedSpecialisation}
                />
              )} */}
              {/* {step === 3 && (
                <SelectDateTime
                  defaultDate={appointmentState.selectedDateTime?.date!}
                  defaultTimeSlots={
                    appointmentState.selectedDateTime?.timeSlots!
                  }
                  defaultDuration={appointmentState.selectedDuration!}
                  defaultCouple={appointmentState.selectedCouple!}
                  onPrice={handlePrice}
                  isActive={step === 3}
                  onNextStep={() => setStep(step + 1)}
                  expertId={appointmentState?.selectedExpert?.id!}
                  onSelectDateTime={handleDateTimeSelection}
                  onSelectDuration={handleDurationSelection}
                />
              )} */}
              {step === 1 && (
                <PatientInformation
                  expertId={expertId}
                  defaultDuration={appointmentState.selectedDefaultDuration!}
                  timeDuration={appointmentState.selectedDuration!}
                  defaultSelectedPatient={appointmentState.selectedPatient!}
                  defaultCouple={appointmentState.selectedCouple!}
                  isActive={step === 1}
                  onNextStep={() => setStep(step + 1)}
                  onSelectPatient={handlePatientInformation}
                  onSelectFinalPrice={handleFinalPrice}
                  onSelectCouple={handleCoupleInformation}
                />
              )}

              {step === 2 && (
                <AppointmentApproval
                  isCouple={appointmentState.selectedCouple!}
                  professionalUserName={
                    appointmentState.selectedExpert?.firstName!
                  }
                  appointmentDate={appointmentState.selectedDateTime?.date!}
                  appointmentTime={
                    // appointmentState.selectedDateTime?.timeSlots[0]?.startTime!
                    appointmentState.selectedDateTime?.timeSlots.startTime!
                  }
                  patientName={appointmentState.selectedPatient?.firstName!}
                  // professionalUserName={appointmentState.selectedExpert.}
                  where={appointmentState.selectedServiceMode?.type!}
                  priceInCents={
                    appointmentState.selectedPrice?.priceInCents! / 100
                  }
                />
              )}
              {step === 2 && (
                <div className="mr-3 flex justify-end">
                  <Button
                    className="self-end rounded-md bg-secondary px-[30px] py-2 font-inter text-base font-medium hover:bg-secondary"
                    onClick={handleSubmit}
                  >
                    CheckOut
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default OnlineAppointment;
