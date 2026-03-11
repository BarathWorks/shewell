"use client";
import { Button } from "@repo/ui/src/@/components/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@repo/ui/src/@/components/hover-card";
import OnlineAppointment from "./online-appointment";
import { api } from "~/trpc/react";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useToast } from "@repo/ui/src/@/components/use-toast";
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
  const { toast } = useToast();

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
  const [openDialog, setOpenDialog] = useState<boolean>(false);

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

  const firstRenderRef = useRef(true);

  useEffect(() => {
    setTimeSlot(null);
  }, [duration]);
  return (
    <>
      <div className="w-full">
        <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 md:self-center xl:flex-row xl:justify-between xl:gap-4">
          {/* price */}
          <div className="flex items-center gap-2 self-center rounded-lg bg-gradient-to-r from-[#00898F]/10 to-[#51AF5A]/10 px-3 py-2 sm:rounded-xl sm:px-4 sm:py-2.5 md:rounded-2xl md:px-5 md:py-3">
            <span className="font-poppins text-xs font-medium text-[#666666] sm:text-sm">
              Starting from
            </span>
            <span className="font-poppins text-lg font-bold text-[#00898F] sm:text-xl md:text-2xl">
              ₹
              {priceInCents
                ? (priceInCents / 100).toLocaleString("en-IN")
                : "---"}
            </span>
          </div>
          {/* both-Buttons */}
          <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-4 xl:flex-row">
            {/* <HoverCard>
              <HoverCardTrigger>
                <Button variant="offlineAppointment">
                  Offline Appointment
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-full bg-white xs:max-w-[300px] sm:max-w-[375px]">
                <div className="flex flex-col gap-[9px]">
                  <ul className="flex flex-col gap-2">
                    <li className=" font-poppins text-base font-semibold">
                      {" "}
                      Get Access to Offline Appointment
                    </li>
                    <li className="flex items-start gap-[16px] font-inter text-sm font-normal">
                      <svg
                        className=""
                        width="17"
                        height="16"
                        viewBox="0 0 17 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.4999 4L5.16659 11.3333L1.83325 8"
                          stroke="#00898F"
                          stroke-width="1.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M15.1667 6.66699L10.1667 11.667L9.16675 10.667"
                          stroke="#00898F"
                          stroke-width="1.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      Enjoy offline experience by getting premium memebership
                    </li>
                    <li className="flex items-start gap-[16px] font-inter text-sm font-normal">
                      <svg
                        className=""
                        width="17"
                        height="16"
                        viewBox="0 0 17 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.4999 4L5.16659 11.3333L1.83325 8"
                          stroke="#00898F"
                          stroke-width="1.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M15.1667 6.66699L10.1667 11.667L9.16675 10.667"
                          stroke="#00898F"
                          stroke-width="1.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      Enjoy offline experience by getting premium memebership
                    </li>
                    <li className="flex items-start gap-[16px] font-inter text-sm font-normal">
                      <svg
                        className=""
                        width="17"
                        height="16"
                        viewBox="0 0 17 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.4999 4L5.16659 11.3333L1.83325 8"
                          stroke="#00898F"
                          stroke-width="1.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M15.1667 6.66699L10.1667 11.667L9.16675 10.667"
                          stroke="#00898F"
                          stroke-width="1.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      Enjoy offline experience by getting premium memebership
                    </li>
                  </ul>

                  <div className="flex flex-wrap gap-6 gap-y-4">
                    <Button className="w-fit rounded-md border bg-primary px-4 py-2 text-white shadow-[2px_2px_4px_0px_rgba(64,64,64,0.25)] hover:bg-primary ">
                      Upgrade Your Plan
                    </Button>
                    <Button className="w-fit rounded-md border border-black bg-white px-[26.5px] py-2  text-primary hover:bg-white">
                      Check Plan
                    </Button>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard> */}

            {timeSlot ? (
              <div onClick={() => handleOpenDialogOnlineAppointment()}>
                {" "}
                <Button className="group flex h-[56px] items-center gap-3 rounded-2xl bg-[#00898F] px-6 py-4 font-poppins text-base font-medium text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-[#007a80] hover:shadow-xl">
                  <svg
                    className="transition-transform duration-300 group-hover:scale-110"
                    width="22"
                    height="22"
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.0703 8.10547C14.4586 8.10547 14.7734 7.79067 14.7734 7.40234C14.7734 7.01402 14.4586 6.69922 14.0703 6.69922C13.682 6.69922 13.3672 7.01402 13.3672 7.40234C13.3672 7.79067 13.682 8.10547 14.0703 8.10547Z"
                      fill="white"
                    />
                    <path
                      d="M15.6875 1.42578H14.7734V0.722656C14.7734 0.33432 14.4586 0.0195312 14.0703 0.0195312C13.682 0.0195312 13.3672 0.33432 13.3672 0.722656V1.42578H10.168V0.722656C10.168 0.33432 9.85318 0.0195312 9.46484 0.0195312C9.07651 0.0195312 8.76172 0.33432 8.76172 0.722656V1.42578H5.59766V0.722656C5.59766 0.33432 5.28287 0.0195312 4.89453 0.0195312C4.5062 0.0195312 4.19141 0.33432 4.19141 0.722656V1.42578H3.3125C1.76169 1.42578 0.5 2.68747 0.5 4.23828V15.207C0.5 16.7578 1.76169 18.0195 3.3125 18.0195H8.69141C9.07974 18.0195 9.39453 17.7047 9.39453 17.3164C9.39453 16.9281 9.07974 16.6133 8.69141 16.6133H3.3125C2.53709 16.6133 1.90625 15.9824 1.90625 15.207V4.23828C1.90625 3.46287 2.53709 2.83203 3.3125 2.83203H4.19141V3.53516C4.19141 3.92349 4.5062 4.23828 4.89453 4.23828C5.28287 4.23828 5.59766 3.92349 5.59766 3.53516V2.83203H8.76172V3.53516C8.76172 3.92349 9.07651 4.23828 9.46484 4.23828C9.85318 4.23828 10.168 3.92349 10.168 3.53516V2.83203H13.3672V3.53516C13.3672 3.92349 13.682 4.23828 14.0703 4.23828C14.4586 4.23828 14.7734 3.92349 14.7734 3.53516V2.83203H15.6875C16.4629 2.83203 17.0938 3.46287 17.0938 4.23828V8.24609C17.0938 8.63443 17.4085 8.94922 17.7969 8.94922C18.1852 8.94922 18.5 8.63443 18.5 8.24609V4.23828C18.5 2.68747 17.2383 1.42578 15.6875 1.42578Z"
                      fill="white"
                    />
                    <path
                      d="M14.2461 9.51172C11.9005 9.51172 9.99219 11.42 9.99219 13.7656C9.99219 16.1112 11.9005 18.0195 14.2461 18.0195C16.5917 18.0195 18.5 16.1112 18.5 13.7656C18.5 11.42 16.5917 9.51172 14.2461 9.51172ZM14.2461 16.6133C12.6759 16.6133 11.3984 15.3358 11.3984 13.7656C11.3984 12.1954 12.6759 10.918 14.2461 10.918C15.8163 10.918 17.0938 12.1954 17.0938 13.7656C17.0938 15.3358 15.8163 16.6133 14.2461 16.6133Z"
                      fill="white"
                    />
                    <path
                      d="M15.2656 13.0625H14.9492V12.3242C14.9492 11.9359 14.6344 11.6211 14.2461 11.6211C13.8578 11.6211 13.543 11.9359 13.543 12.3242V13.7656C13.543 14.154 13.8578 14.4688 14.2461 14.4688H15.2656C15.654 14.4688 15.9688 14.154 15.9688 13.7656C15.9688 13.3773 15.654 13.0625 15.2656 13.0625Z"
                      fill="white"
                    />
                    <path
                      d="M11.0117 8.10547C11.4 8.10547 11.7148 7.79067 11.7148 7.40234C11.7148 7.01402 11.4 6.69922 11.0117 6.69922C10.6234 6.69922 10.3086 7.01402 10.3086 7.40234C10.3086 7.79067 10.6234 8.10547 11.0117 8.10547Z"
                      fill="white"
                    />
                    <path
                      d="M7.95312 11.1641C8.34145 11.1641 8.65625 10.8493 8.65625 10.4609C8.65625 10.0726 8.34145 9.75781 7.95312 9.75781C7.5648 9.75781 7.25 10.0726 7.25 10.4609C7.25 10.8493 7.5648 11.1641 7.95312 11.1641Z"
                      fill="white"
                    />
                    <path
                      d="M4.89453 8.10547C5.28286 8.10547 5.59766 7.79067 5.59766 7.40234C5.59766 7.01402 5.28286 6.69922 4.89453 6.69922C4.50621 6.69922 4.19141 7.01402 4.19141 7.40234C4.19141 7.79067 4.50621 8.10547 4.89453 8.10547Z"
                      fill="white"
                    />
                    <path
                      d="M4.89453 11.1641C5.28286 11.1641 5.59766 10.8493 5.59766 10.4609C5.59766 10.0726 5.28286 9.75781 4.89453 9.75781C4.50621 9.75781 4.19141 10.0726 4.19141 10.4609C4.19141 10.8493 4.50621 11.1641 4.89453 11.1641Z"
                      fill="white"
                    />
                    <path
                      d="M4.89453 14.2227C5.28286 14.2227 5.59766 13.9079 5.59766 13.5195C5.59766 13.1312 5.28286 12.8164 4.89453 12.8164C4.50621 12.8164 4.19141 13.1312 4.19141 13.5195C4.19141 13.9079 4.50621 14.2227 4.89453 14.2227Z"
                      fill="white"
                    />
                    <path
                      d="M7.95312 14.2227C8.34145 14.2227 8.65625 13.9079 8.65625 13.5195C8.65625 13.1312 8.34145 12.8164 7.95312 12.8164C7.5648 12.8164 7.25 13.1312 7.25 13.5195C7.25 13.9079 7.5648 14.2227 7.95312 14.2227Z"
                      fill="white"
                    />
                    <path
                      d="M7.95312 8.10547C8.34145 8.10547 8.65625 7.79067 8.65625 7.40234C8.65625 7.01402 8.34145 6.69922 7.95312 6.69922C7.5648 6.69922 7.25 7.01402 7.25 7.40234C7.25 7.79067 7.5648 8.10547 7.95312 8.10547Z"
                      fill="white"
                    />
                  </svg>
                  Book Online Appointment
                </Button>
              </div>
            ) : (
              <HoverCard>
                <HoverCardTrigger>
                  <Button className="group flex h-[56px] items-center gap-3 rounded-2xl bg-[#F2F2F2] px-6 py-4 font-poppins text-base font-medium text-[#00000066] shadow-sm transition-all duration-300 hover:bg-[#e5e5e5] hover:shadow-md">
                    <svg
                      className="transition-transform duration-300 group-hover:scale-110"
                      width="22"
                      height="22"
                      viewBox="0 0 19 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.0703 8.10547C14.4586 8.10547 14.7734 7.79067 14.7734 7.40234C14.7734 7.01402 14.4586 6.69922 14.0703 6.69922C13.682 6.69922 13.3672 7.01402 13.3672 7.40234C13.3672 7.79067 13.682 8.10547 14.0703 8.10547Z"
                        fill="#666666"
                      />
                      <path
                        d="M15.6875 1.42578H14.7734V0.722656C14.7734 0.33432 14.4586 0.0195312 14.0703 0.0195312C13.682 0.0195312 13.3672 0.33432 13.3672 0.722656V1.42578H10.168V0.722656C10.168 0.33432 9.85318 0.0195312 9.46484 0.0195312C9.07651 0.0195312 8.76172 0.33432 8.76172 0.722656V1.42578H5.59766V0.722656C5.59766 0.33432 5.28287 0.0195312 4.89453 0.0195312C4.5062 0.0195312 4.19141 0.33432 4.19141 0.722656V1.42578H3.3125C1.76169 1.42578 0.5 2.68747 0.5 4.23828V15.207C0.5 16.7578 1.76169 18.0195 3.3125 18.0195H8.69141C9.07974 18.0195 9.39453 17.7047 9.39453 17.3164C9.39453 16.9281 9.07974 16.6133 8.69141 16.6133H3.3125C2.53709 16.6133 1.90625 15.9824 1.90625 15.207V4.23828C1.90625 3.46287 2.53709 2.83203 3.3125 2.83203H4.19141V3.53516C4.19141 3.92349 4.5062 4.23828 4.89453 4.23828C5.28287 4.23828 5.59766 3.92349 5.59766 3.53516V2.83203H8.76172V3.53516C8.76172 3.92349 9.07651 4.23828 9.46484 4.23828C9.85318 4.23828 10.168 3.92349 10.168 3.53516V2.83203H13.3672V3.53516C13.3672 3.92349 13.682 4.23828 14.0703 4.23828C14.4586 4.23828 14.7734 3.92349 14.7734 3.53516V2.83203H15.6875C16.4629 2.83203 17.0938 3.46287 17.0938 4.23828V8.24609C17.0938 8.63443 17.4085 8.94922 17.7969 8.94922C18.1852 8.94922 18.5 8.63443 18.5 8.24609V4.23828C18.5 2.68747 17.2383 1.42578 15.6875 1.42578Z"
                        fill="#666666"
                      />
                      <path
                        d="M14.2461 9.51172C11.9005 9.51172 9.99219 11.42 9.99219 13.7656C9.99219 16.1112 11.9005 18.0195 14.2461 18.0195C16.5917 18.0195 18.5 16.1112 18.5 13.7656C18.5 11.42 16.5917 9.51172 14.2461 9.51172ZM14.2461 16.6133C12.6759 16.6133 11.3984 15.3358 11.3984 13.7656C11.3984 12.1954 12.6759 10.918 14.2461 10.918C15.8163 10.918 17.0938 12.1954 17.0938 13.7656C17.0938 15.3358 15.8163 16.6133 14.2461 16.6133Z"
                        fill="#666666"
                      />
                      <path
                        d="M15.2656 13.0625H14.9492V12.3242C14.9492 11.9359 14.6344 11.6211 14.2461 11.6211C13.8578 11.6211 13.543 11.9359 13.543 12.3242V13.7656C13.543 14.154 13.8578 14.4688 14.2461 14.4688H15.2656C15.654 14.4688 15.9688 14.154 15.9688 13.7656C15.9688 13.3773 15.654 13.0625 15.2656 13.0625Z"
                        fill="#666666"
                      />
                      <path
                        d="M11.0117 8.10547C11.4 8.10547 11.7148 7.79067 11.7148 7.40234C11.7148 7.01402 11.4 6.69922 11.0117 6.69922C10.6234 6.69922 10.3086 7.01402 10.3086 7.40234C10.3086 7.79067 10.6234 8.10547 11.0117 8.10547Z"
                        fill="#666666"
                      />
                      <path
                        d="M7.95312 11.1641C8.34145 11.1641 8.65625 10.8493 8.65625 10.4609C8.65625 10.0726 8.34145 9.75781 7.95312 9.75781C7.5648 9.75781 7.25 10.0726 7.25 10.4609C7.25 10.8493 7.5648 11.1641 7.95312 11.1641Z"
                        fill="#666666"
                      />
                      <path
                        d="M4.89453 8.10547C5.28286 8.10547 5.59766 7.79067 5.59766 7.40234C5.59766 7.01402 5.28286 6.69922 4.89453 6.69922C4.50621 6.69922 4.19141 7.01402 4.19141 7.40234C4.19141 7.79067 4.50621 8.10547 4.89453 8.10547Z"
                        fill="#666666"
                      />
                      <path
                        d="M4.89453 11.1641C5.28286 11.1641 5.59766 10.8493 5.59766 10.4609C5.59766 10.0726 5.28286 9.75781 4.89453 9.75781C4.50621 9.75781 4.19141 10.0726 4.19141 10.4609C4.19141 10.8493 4.50621 11.1641 4.89453 11.1641Z"
                        fill="#666666"
                      />
                      <path
                        d="M4.89453 14.2227C5.28286 14.2227 5.59766 13.9079 5.59766 13.5195C5.59766 13.1312 5.28286 12.8164 4.89453 12.8164C4.50621 12.8164 4.19141 13.1312 4.19141 13.5195C4.19141 13.9079 4.50621 14.2227 4.89453 14.2227Z"
                        fill="#666666"
                      />
                      <path
                        d="M7.95312 14.2227C8.34145 14.2227 8.65625 13.9079 8.65625 13.5195C8.65625 13.1312 8.34145 12.8164 7.95312 12.8164C7.5648 12.8164 7.25 13.1312 7.25 13.5195C7.25 13.9079 7.5648 14.2227 7.95312 14.2227Z"
                        fill="#666666"
                      />
                      <path
                        d="M7.95312 8.10547C8.34145 8.10547 8.65625 7.79067 8.65625 7.40234C8.65625 7.01402 8.34145 6.69922 7.95312 6.69922C7.5648 6.69922 7.25 7.01402 7.25 7.40234C7.25 7.79067 7.5648 8.10547 7.95312 8.10547Z"
                        fill="#666666"
                      />
                    </svg>
                    Book Online Appointment
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-full rounded-2xl border border-gray-100 bg-white p-0 shadow-xl xs:max-w-[300px] sm:max-w-[375px]">
                  <div className="flex items-center gap-3 p-5">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                        stroke="#00898F"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
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
