"use client";
import { Button } from "@repo/ui/src/@/components/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@repo/ui/src/@/components/hover-card";
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
          <div className="flex-1 flex items-center justify-between sm:justify-start gap-3 h-12 px-4 bg-[#eff4ff] border border-[#c0c8cc]/30 rounded-xl w-full sm:w-auto">
            <span className="text-[#40484b] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Starting from</span>
            <span className="text-[#006879] font-bold text-xl sm:text-2xl leading-none">
              ₹{priceInCents ? (priceInCents / 100).toLocaleString("en-IN") : "---"}
            </span>
          </div>

          {/* booking button */}
          <div className="w-full sm:flex-[2]">
            {timeSlot ? (
              <div onClick={() => handleOpenDialogOnlineAppointment()} className="w-full">
                <Button className="w-full h-12 bg-[#00898F] text-white hover:bg-[#00767a] rounded-xl flex items-center justify-center gap-2 font-semibold transition-all duration-200">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span className="sm:hidden">Book Now</span>
                  <span className="hidden sm:block">Book Online Appointment</span>
                </Button>
              </div>
            ) : (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    disabled
                    className="w-full h-12 bg-[#006879]/10 text-[#40484b]/70 border border-[#006879]/10 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-not-allowed"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span className="sm:hidden">Book Now</span>
                    <span className="hidden sm:block">Book Online Appointment</span>
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
