"use client";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { Button } from "@repo/ui/src/@/components/button";
import { differenceInMonths, differenceInYears, format } from "date-fns";
interface IProfileImageTextProps {
  doctorProfile: {
    firstName?: string | null;
    // qualifications?: {
    //   displayQualification: string;
    // }[];
    displayQualification: string | null | undefined;
    avgRating?: string | null;
    totalConsultations?: number | null;
    createdAt: Date;
  };
  cardImage: React.ReactNode;
  specialization: {
    specialization: string;
  }[];
}
const ProfileImageText = ({
  doctorProfile,
  cardImage,
  specialization,
}: IProfileImageTextProps) => {
  const StarDrawing = (
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  );
  const customStyles = {
    itemShapes: StarDrawing,
    activeFillColor: "#006879",
    inactiveFillColor: "#c0c8cc",
  };

  return (
    <>
      <div className="flex flex-col gap-8 lg:flex-row lg:justify-between w-full">
        {/* doctor-image and text */}
        <div className="lg:self-center">
          {doctorProfile && (
            <div className="flex flex-col items-center md:items-start lg:flex-row gap-4 lg:gap-6 2xl:gap-8">
              {/* Profile Avatar */}
              <div className="relative shrink-0 w-28 h-28 md:w-32 md:h-32">
                <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-[#F4F4F4] flex items-center justify-center shadow-sm">
                  {cardImage}
                </div>
              </div>

              {/* text */}
              <div className="flex flex-col items-center gap-2 lg:items-start">
                <h2 className="font-poppins text-[30px] font-bold leading-[48px] xl:text-[36px]">
                  Dr. {doctorProfile.firstName || ""}
                </h2>
                <div className="font-inter text-[20px] font-normal leading-[30px] text-inactive xl:text-2xl">
                  {doctorProfile.displayQualification}
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="21"
                      viewBox="0 0 20 21"
                      fill="none"
                    >
                      <path
                        d="M9.99875 19.6663C1.86199 19.6582 -2.23078 9.7669 3.517 4.00258C6.92903 0.443413 13.0685 0.44284 16.4805 4.00272C22.2283 9.76755 18.135 19.6586 9.99875 19.6663ZM9.99875 2.74882C5.734 2.74882 2.26439 6.22182 2.26439 10.4907C2.68924 20.7614 17.3098 20.7585 17.7331 10.4907C17.7331 6.22186 14.2635 2.74882 9.99875 2.74882ZM13.3339 12.8154L11.0713 10.5506C11.0912 10.2161 10.9487 9.89644 10.7145 9.68898C10.7148 9.68149 10.7149 9.67396 10.7149 9.6664V5.47286C10.6771 4.52175 9.3201 4.52247 9.28261 5.47286V9.6664C9.28261 9.67396 9.28275 9.68149 9.28296 9.68898C8.53406 10.36 9.04209 11.6168 10.0585 11.5644L12.3211 13.8292C12.6008 14.1092 13.0542 14.1092 13.3339 13.8292C13.6136 13.5492 13.6136 13.0954 13.3339 12.8154Z"
                        fill="#4D4D4D"
                      />
                    </svg>
                  </div>
                  <div className="font-inter text-base font-normal leading-[24px] text-inactive">
                    Active from{" "}
                    {differenceInYears(new Date(), doctorProfile.createdAt)}{" "}
                    year{" "}
                    {differenceInMonths(new Date(), doctorProfile.createdAt)}{" "}
                    month
                  </div>
                </div>
                <div className="flex w-full items-center justify-center md:justify-start gap-2">
                  <div className="flex items-center gap-2">
                    <Rating
                      className="inline"
                      readOnly={true}
                      style={{ maxWidth: 75 }}
                      value={parseFloat(doctorProfile.avgRating || "0")}
                      itemStyles={customStyles}
                    />

                    <span className="font-bold text-[#0b1c30] text-sm">
                      {parseFloat(doctorProfile.avgRating || "0").toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-poppins font-medium">• {doctorProfile?.totalConsultations || 0} Consultations</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Specialization */}
        {specialization.length > 0 && (
          <div className="lg:basis-[349px] xl:basis-[580px] 2xl:basis-[687px]">
            <h3 className="mb-3 font-inter text-base font-semibold md:text-lg xl:text-[20px] xl:leading-[30px] 2xl:text-[28px] 2xl:leading-[38px]">
              Specialization
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start md:px-0">
              {specialization &&
                specialization.map((item, index) => {
                  return (
                    <div
                      className="bg-[#E1EBED]/60 border border-[#00898F]/15 px-4 py-1.5 rounded-full flex items-center"
                      key={index}
                    >
                      <span className="text-[14px] font-semibold text-[#00898F]">{item.specialization}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default ProfileImageText;
