"use client";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@repo/ui/src/@/components/hover-card";
import { InteractiveButton } from "~/components/ui/interactive-button";
import OnlineAppointment from "./online-appointment";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CounsellingAppointment = ({
  duration,
  professionalUserId,
  firstName,
  date,
  timeSlots,
  priceInCents,
}: {
  duration: number;
  professionalUserId: string;
  firstName: string;
  date: Date;
  timeSlots: {
    startTime: Date;
    endTime: Date;
  };
  priceInCents: number;
}) => {
  const session = useSession();
  const [timeSlot, setTimeSlot] = useState<{
    startTime: Date;
    endTime: Date;
  } | null>(null);

  useEffect(() => {
    if (timeSlots) {
      setTimeSlot(timeSlots);
    }
  }, [timeSlots]);

  const router = useRouter();
  const [openDialogOnlineAppointment, setOpenDialogOnlineAppointment] =
    useState<boolean>();

  const handleOpenDialogOnlineAppointment = () => {
    if (session.status === "unauthenticated") {
      const currentRoute = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentRoute)}`);
      return;
    }

    if (timeSlot && session.status === "authenticated") {
      setOpenDialogOnlineAppointment(true);
    }
  };

  useEffect(() => {
    setTimeSlot(null);
  }, [duration]);

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
          {/* price */}
          <div className="flex-1 flex items-center justify-center h-12 px-6 bg-[#E1EBED]/60 border border-[#00898F]/15 hover:bg-[#E1EBED] transition-all duration-300 rounded-xl w-full sm:w-auto">
            <span className="text-[20px] sm:text-[22px] font-bold text-[#00898F]">
              {priceInCents !== null && priceInCents !== undefined ? (
                priceInCents === 0 ? "Free" : `₹ ${(priceInCents / 100).toLocaleString("en-IN")}`
              ) : "---"}
            </span>
          </div>

          {/* booking button */}
          <div className="w-full sm:flex-[2]">
            {timeSlot ? (
              <div onClick={() => handleOpenDialogOnlineAppointment()} className="w-full">
                <button className="group flex w-full h-12 cursor-pointer items-center justify-between rounded-xl bg-[#00898F] px-5 py-2 transition-all duration-300 hover:bg-[#006e72] active:bg-[#005a5e] shadow-md hover:shadow-lg">
                  <span className="text-sm font-semibold text-white transition-colors duration-300 md:text-base">
                    <span className="sm:hidden">Book Now</span>
                    <span className="hidden sm:block">Book Online Appointment</span>
                  </span>
                  <InteractiveButton as="span" size="medium" variant="reverse" />
                </button>
              </div>
            ) : (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    disabled
                    className="group flex w-full h-12 items-center justify-between rounded-xl bg-[#006879]/5 border border-[#006879]/10 px-5 py-2 cursor-not-allowed opacity-60"
                  >
                    <span className="text-sm font-semibold text-[#40484b]/70 md:text-base">
                      <span className="sm:hidden">Book Now</span>
                      <span className="hidden sm:block">Book Online Appointment</span>
                    </span>
                    <InteractiveButton as="span" size="medium" className="opacity-45" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-full rounded-2xl border border-gray-100 bg-white p-0 shadow-xl xs:max-w-[300px] sm:max-w-[375px]">
                  <div className="flex items-center gap-3 p-5">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00898F]">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span className="font-poppins text-sm font-medium text-[#333333]">
                      Please select a time slot first
                    </span>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
            <OnlineAppointment
              open={openDialogOnlineAppointment!}
              onOpenChange={setOpenDialogOnlineAppointment}
              duration={duration}
              date={date}
              currentStep={4}
              expertId={professionalUserId}
              firstName={firstName}
              timeSlots={timeSlot!}
              priceInCents={priceInCents}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CounsellingAppointment;
