"use client";
import React, { useEffect, useState } from "react";

import { Button } from "@repo/ui/src/@/components/button";

import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";

import CounsellingAppointment from "./counselling-appointment";
import Link from "next/link";
import DayNavigatorWithTimeSlots from "./dateWithTimeSlots";
import Image from "next/image";
interface IDoctorProfileProps {
  // doctorProfile: IProfessionalUser;
  doctorProfile: {
    id?: string;
    firstName?: string | null;
    displayQualification?: {
      specialization?: string | null;
    } | null;
    avgRating?: string | null | undefined;
    totalConsultations?: number | null;
    userName?: string | null;
    languages?: {
      language?: string;
    }[];
    media?: {
      fileUrl?: string | null;
    } | null;
  };

  // cardImage: React.ReactNode;
  specialization?: {
    specialization?: string;
  }[];
  isCouple: boolean;
}

const CompleteDoctorProfile = ({
  doctorProfile,
  // cardImage,
  specialization,
  isCouple,
}: IDoctorProfileProps) => {
  const [selectedDateTime, setSelectedDateTime] = useState<{
    date: Date | null;
    // timeSlots: { startTime: Date; endTime: Date }[];
    timeSlots: { startTime: Date; endTime: Date } | null;
    priceInCents: number | null;
  } | null>(null);
  const [price, setPrice] = useState<number>();
  const [duration, setDuration] = useState<number>();
  const handleDuration = (value: number) => {
    setDuration(value);
  };

  const handleDateTimeSelect = (dateTime: {
    date: Date;
    // timeSlots: { startTime: Date; endTime: Date }[];
    timeSlots: { startTime: Date; endTime: Date } | null;
    priceInCents: number | null;
  }) => {
    setSelectedDateTime(dateTime);
  };

  // const handleReselectTimeSlot = () => {
  //   setSelectedDateTime(null);
  // };
  const handlePrice = (price: number) => {
    setPrice(price);
  };
  // console.log("component", price);

  useEffect(() => {
    setSelectedDateTime(null);
  }, [duration]);
  // console.log("parentComponent", selectedDateTime);
  const StarDrawing = (
    <path d="M15.1533 1.24496C14.6395 0.359428 13.3607 0.359425 12.8468 1.24496L9.2281 7.48137C8.97427 7.91882 8.53553 8.21734 8.03545 8.29287L1.2537 9.31717C0.114654 9.48921 -0.284892 10.9274 0.602182 11.6623L5.6543 15.8479C6.12196 16.2354 6.34185 16.8465 6.22825 17.4431L4.90669 24.3833C4.69778 25.4804 5.8495 26.3328 6.8377 25.8125L13.2236 22.4501C13.7096 22.1941 14.2905 22.1941 14.7766 22.4501L21.1625 25.8125C22.1507 26.3328 23.3024 25.4804 23.0935 24.3833L21.7719 17.4431C21.6583 16.8465 21.8782 16.2354 22.3459 15.8479L27.398 11.6623C28.285 10.9274 27.8855 9.48921 26.7465 9.31717L19.9647 8.29287C19.4646 8.21734 19.0259 7.91882 18.7721 7.48137L15.1533 1.24496Z" />
  );
  const customStyles = {
    itemShapes: StarDrawing,
    activeFillColor: "#00898F",
    inactiveFillColor: "#E0E0E0",
  };

  return (
    <div className="group w-full">
      <div className="flex flex-col flex-col gap-4 rounded-2xl border border-gray-100 bg-white/80 px-3 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-300 ease-in-out hover:border-gray-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] sm:gap-5 sm:rounded-2xl sm:px-4 sm:py-5 md:flex-col md:justify-between md:gap-6 md:rounded-3xl md:px-8 md:py-8">
        <div className="flex flex-col gap-4 sm:gap-4 md:gap-[18px]">
          {/* image + text */}
          <div className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-6 2xl:gap-8">
            {/* image */}
            <div className="relative flex aspect-square w-24 items-center justify-center sm:w-28 md:w-32 lg:w-40">
              {/* Decorative ring */}
              <div className="absolute inset-0 h-28 w-28 rounded-full bg-gradient-to-br from-[#00898F]/20 to-[#51AF5A]/20 p-0.5 sm:h-32 sm:w-32 sm:p-1 md:h-36 md:w-36 md:p-2 lg:h-44 lg:w-44">
                {/* <div className="h-[140px] w-[140px] rounded-full bg-white"></div> */}
                <div className="relative aspect-square overflow-hidden rounded-full bg-white shadow-lg ring-2 ring-white">
                  <Image
                    src={
                      doctorProfile.media?.fileUrl ||
                      "/images/fallback-user-profile.png"
                    }
                    alt="feature-card"
                    className="rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
                    fill={true}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2">
              <h3 className="font-poppins text-base font-semibold leading-tight text-[#333333] sm:text-lg md:text-xl lg:text-2xl">
                {doctorProfile.firstName}
              </h3>
              <div className="font-poppins text-xs font-medium text-[#00898F] sm:text-sm md:text-base">
                {doctorProfile.displayQualification?.specialization}
              </div>

              <div className="mt-0.5 flex w-full flex-wrap items-center gap-2 md:justify-start">
                <div className="flex items-center gap-2 rounded-full bg-[#F8F8F8] px-2.5 py-1 sm:px-3">
                  <Rating
                    className="inline"
                    readOnly={true}
                    style={{ maxWidth: 70 }}
                    value={parseFloat(doctorProfile.avgRating || "0")}
                    itemStyles={customStyles}
                  />
                  <div className="font-poppins text-xs font-semibold text-[#00898F] sm:text-sm">
                    {parseFloat(doctorProfile.avgRating || "0").toFixed(1)}
                  </div>
                </div>
                <div className="font-poppins text-xs font-normal text-[#666666] sm:text-sm">
                  {doctorProfile?.totalConsultations
                    ? doctorProfile?.totalConsultations
                    : 0}{" "}
                  Consultations
                </div>
              </div>

              <Link href={`counselling/${doctorProfile.userName}`}>
                <Button className="mt-2.5 w-fit rounded-lg bg-[#00898F] px-3 py-1.5 text-xs shadow-md transition-all duration-300 hover:bg-[#007a80] hover:shadow-lg sm:mt-3 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm md:mt-4 md:px-5 md:py-2.5">
                  <svg
                    className="mr-1.5 sm:mr-2"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_3406_5779)">
                      <path
                        d="M11.8286 11.5609C13.4169 11.5609 14.792 10.9913 15.9159 9.86735C17.0394 8.74364 17.6093 7.3687 17.6093 5.78026C17.6093 4.19237 17.0396 2.81726 15.9157 1.69317C14.7918 0.56964 13.4167 0 11.8286 0C10.2402 0 8.86523 0.56964 7.74152 1.69336C6.6178 2.81707 6.04797 4.19219 6.04797 5.78026C6.04797 7.3687 6.6178 8.74382 7.74152 9.86753C8.8656 10.9911 10.2407 11.5609 11.8286 11.5609ZM8.73615 2.6878C9.59839 1.82556 10.6099 1.40643 11.8286 1.40643C13.0472 1.40643 14.0588 1.82556 14.9213 2.6878C15.7835 3.55023 16.2028 4.56188 16.2028 5.78026C16.2028 6.99901 15.7835 8.01048 14.9213 8.87291C14.0588 9.73533 13.0472 10.1545 11.8286 10.1545C10.6102 10.1545 9.59875 9.73515 8.73615 8.87291C7.87372 8.01067 7.45441 6.99901 7.45441 5.78026C7.45441 4.56188 7.87372 3.55023 8.73615 2.6878Z"
                        fill="#ffffff"
                      />
                      <path
                        d="M21.9434 18.4549C21.911 17.9873 21.8455 17.4772 21.749 16.9385C21.6515 16.3957 21.5261 15.8827 21.376 15.4137C21.2207 14.9291 21.0099 14.4504 20.749 13.9918C20.4786 13.5157 20.1607 13.1011 19.804 12.76C19.431 12.4031 18.9744 12.1162 18.4463 11.9069C17.92 11.6987 17.3369 11.5933 16.713 11.5933C16.468 11.5933 16.2311 11.6938 15.7735 11.9917C15.4919 12.1754 15.1625 12.3878 14.7948 12.6227C14.4804 12.823 14.0545 13.0107 13.5284 13.1806C13.0152 13.3467 12.4941 13.4309 11.9796 13.4309C11.4654 13.4309 10.9443 13.3467 10.4307 13.1806C9.90515 13.0109 9.47906 12.8232 9.16522 12.6229C8.80102 12.3901 8.47144 12.1777 8.18561 11.9915C7.72839 11.6936 7.49145 11.5931 7.24646 11.5931C6.62244 11.5931 6.03943 11.6987 5.51337 11.9071C4.98566 12.116 4.52881 12.403 4.15546 12.7602C3.79877 13.1015 3.4809 13.5159 3.21063 13.9918C2.95007 14.4504 2.73914 14.9289 2.58386 15.4139C2.4339 15.8829 2.30847 16.3957 2.21106 16.9385C2.11438 17.4764 2.04901 17.9867 2.0166 18.4555C1.98474 18.9138 1.96863 19.3908 1.96863 19.8727C1.96863 21.1255 2.36688 22.1397 3.15222 22.8877C3.92786 23.6258 4.95398 24.0001 6.20221 24.0001H17.7584C19.0062 24.0001 20.0323 23.6258 20.8082 22.8877C21.5937 22.1403 21.9919 21.1257 21.9919 19.8725C21.9918 19.389 21.9755 18.912 21.9434 18.4549ZM19.8384 21.8688C19.3259 22.3565 18.6455 22.5937 17.7582 22.5937H6.20221C5.3147 22.5937 4.63428 22.3565 4.12195 21.8689C3.61932 21.3905 3.37506 20.7373 3.37506 19.8727C3.37506 19.423 3.38989 18.979 3.41956 18.5527C3.44849 18.1345 3.50763 17.6751 3.59534 17.1869C3.68195 16.7048 3.79218 16.2524 3.92328 15.8428C4.04907 15.45 4.22064 15.0611 4.43341 14.6865C4.63647 14.3294 4.87012 14.0231 5.12793 13.7762C5.36908 13.5453 5.67303 13.3564 6.03119 13.2147C6.36243 13.0836 6.73468 13.0118 7.13879 13.001C7.18805 13.0272 7.27576 13.0771 7.41785 13.1698C7.70697 13.3582 8.04022 13.5732 8.40863 13.8085C8.82391 14.0732 9.35895 14.3124 9.99817 14.5187C10.6517 14.73 11.3182 14.8373 11.9797 14.8373C12.6413 14.8373 13.308 14.73 13.9611 14.5189C14.6009 14.3122 15.1357 14.0732 15.5516 13.8081C15.9286 13.5671 16.2525 13.3584 16.5416 13.1698C16.6837 13.0773 16.7714 13.0272 16.8207 13.001C17.225 13.0118 17.5972 13.0836 17.9286 13.2147C18.2866 13.3564 18.5906 13.5455 18.8317 13.7762C19.0895 14.0229 19.3232 14.3292 19.5262 14.6866C19.7392 15.0611 19.9109 15.4502 20.0366 15.8426C20.1678 16.2527 20.2783 16.705 20.3647 17.1868C20.4522 17.6758 20.5115 18.1354 20.5405 18.5529V18.5533C20.5703 18.9779 20.5853 19.4217 20.5855 19.8727C20.5853 20.7375 20.3411 21.3905 19.8384 21.8688Z"
                        fill="#ffffff"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_3406_5779">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
          {/* specialized-in */}
          <div className="flex flex-wrap items-center gap-1.5 font-poppins text-xs font-normal text-[#666666] sm:gap-2 sm:text-sm">
            <span className="font-semibold text-[#333333]">
              Specialized In:
            </span>

            {specialization &&
              specialization.map((item, index) => {
                return (
                  <div
                    className="rounded-full border border-[#00898F]/20 bg-gradient-to-r from-[#00898F]/10 to-[#51AF5A]/10 px-2 py-1 font-poppins text-xs font-medium text-[#00898F] sm:px-3"
                    key={index}
                  >
                    {item.specialization}
                  </div>
                );
              })}
          </div>

          {/* languages */}
          <div className="flex flex-wrap items-center gap-1.5 font-poppins text-xs font-normal text-[#666666] sm:gap-2 sm:text-sm">
            <span className="font-semibold text-[#333333]">Languages:</span>

            {doctorProfile.languages?.map((item, index) => {
              return (
                <div
                  className="rounded-full border border-gray-200 bg-[#F5F5F5] px-2 py-1 font-poppins text-xs font-medium text-[#666666] sm:px-3"
                  key={index}
                >
                  {item.language}
                </div>
              );
            })}
          </div>

          {/* Available time slots */}
          <div className="mb-4 mt-4 sm:mb-5 sm:mt-5 md:mb-8 md:mt-6">
            <div className="mt-2 sm:mt-3 md:mt-4">
              <DayNavigatorWithTimeSlots
                onSelectDuration={handleDuration}
                // reSelectTimeSlot={}
                onSelectDateTime={handleDateTimeSelect}
                professionalUserId={doctorProfile.id}
              />
            </div>
          </div>
        </div>
        {/* Appointment-buttons */}
        <div className="md:self-center xl:self-start">
          <CounsellingAppointment
            duration={duration!}
            firstName={doctorProfile.firstName!}
            professionalUserId={doctorProfile.id}
            date={selectedDateTime?.date!}
            timeSlots={selectedDateTime?.timeSlots!}
            priceInCents={selectedDateTime?.priceInCents!}
          />
        </div>
      </div>
    </div>
  );
};

export default CompleteDoctorProfile;
