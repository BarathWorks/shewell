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
    <path d="M15.1533 1.24496C14.6395 0.359428 13.3607 0.359425 12.8468 1.24496L9.2281 7.48137C8.97427 7.91882 8.53553 8.21734 8.03545 8.29287L1.2537 9.31717C0.114654 9.48921 -0.284892 10.9274 0.602182 11.6623L5.6543 15.8479C6.12196 16.2354 6.34185 16.8465 6.22825 17.4431L4.90669 24.3833C4.69778 25.4804 5.8495 26.3328 6.8377 25.8125L13.2236 22.4501C13.7096 22.1941 14.2905 22.1941 14.7766 22.4501L21.1625 25.8125C22.1507 26.3328 23.3024 25.4804 23.0935 24.3833L21.7719 17.4431C21.6583 16.8465 21.8782 16.2354 22.3459 15.8479L27.398 11.6623C28.285 10.9274 27.8855 9.48921 26.7465 9.31717L19.9647 8.29287C19.4646 8.21734 19.0259 7.91882 18.7721 7.48137L15.1533 1.24496Z" />
  );
  const customStyles = {
    itemShapes: StarDrawing,
    activeFillColor: "#00898F",
       inactiveFillColor:"#B5B5B5",
  };

  return (
    <>
      <div className="flex flex-col gap-8 lg:flex-row  lg:justify-between">
        {/* doctor-image and text */}
        <div className=" lg:self-center ">
          {doctorProfile && (
            <div className="flex flex-col items-center justify-center  gap-4 lg:flex-row lg:gap-6  2xl:gap-8">
              {/* image */}

              <div className="relative flex aspect-square items-center justify-center xs:w-[150px] sm:w-[225px]">
                {/* Decorative ring */}
                <div className="absolute inset-0 rounded-full border-2 border-[#00898F]/10 bg-[#F8FFFE] p-2">
                  <div className=" flex items-center justify-center relative h-full w-full overflow-hidden rounded-full bg-white shadow-lg ring-4 ring-white">
                    {cardImage}
                  </div>
                </div>
              </div>

              {/* text */}
              <div className=" flex flex-col items-center gap-2 lg:items-start ">
                <h2 className=" font-poppins text-[30px] font-bold leading-[48px] xl:text-[36px] ">
                  Dr. {doctorProfile.firstName || ""}
                </h2>
                <div className="font-inter text-[20px] font-normal leading-[30px] text-inactive xl:text-2xl">
                  {/* {doctorProfile.qualifications?[0]?.displayedQualification} */}
                  {/* {doctorProfile.qualifications &&
                    doctorProfile.qualifications[0]?.displayQualification} */}
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
                <div className="flex w-full items-center justify-center md:justify-start gap-2 ">
                  <div className="flex">
                    <Rating
                      className="inline"
                      readOnly={true}
                      style={{ maxWidth: 95 }}
                      value={parseFloat(doctorProfile.avgRating || "0")}
                      itemStyles={customStyles}
                    />

                    <div className="border-r border-primary pr-2 font-inter text-sm font-medium text-active 2xl:text-base">
                      {(parseFloat(doctorProfile.avgRating || "0")).toFixed(1)}
                    </div>
                  </div>
                  <div className="font-inter text-sm font-normal 2xl:text-base">
                   {doctorProfile?.totalConsultations ? doctorProfile?.totalConsultations : 0} Consultation
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Specialization */}
        {specialization.length > 0 && (
          <div className="lg:basis-[349px] xl:basis-[580px] 2xl:basis-[687px]">
            <h3 className="mb-3 font-inter text-base font-semibold md:text-lg  xl:text-[20px] xl:leading-[30px] 2xl:text-[28px] 2xl:leading-[38px]">
              Specialization
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-[14px] px-[60px] lg:justify-start md:px-0 2xl:gap-[18px]">
              {specialization &&
                specialization.map((item, index) => {
                  return (
                    <div
                      className="rounded-full border border-[#00898F]/20 bg-[#F8FFFE] px-4 py-1.5 font-poppins text-xs font-medium text-[#00898F] shadow-sm"
                      key={index}
                    >
                      {item.specialization}
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
