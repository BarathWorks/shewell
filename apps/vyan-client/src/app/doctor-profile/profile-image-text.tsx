"use client";
import { Check, Clock } from "lucide-react";
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
    inactiveFillColor: "#B5B5B5",
  };

  return (
    <div className="surface-card p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
        {/* Identity */}
        {doctorProfile && (
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left lg:gap-7">
            {/* The portrait sat on a `/images/bg.png` decorative plate at a fixed
                225px square, which cropped on small screens. A plain ring reads
                cleaner and scales. */}
            <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-full border border-hairline bg-slate-50 sm:size-40 lg:size-44">
              {cardImage}
            </div>

            <div className="flex flex-col items-center gap-2.5 sm:items-start">
              <h1 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl lg:text-4xl">
                Dr. {doctorProfile.firstName || ""}
              </h1>

              <p className="text-base font-medium text-primary-700 sm:text-lg">
                {doctorProfile.displayQualification}
              </p>

              <p className="flex items-center gap-2 text-sm text-muted">
                <Clock aria-hidden="true" className="size-4 shrink-0" />
                Active from{" "}
                {differenceInYears(new Date(), doctorProfile.createdAt)} year{" "}
                {differenceInMonths(new Date(), doctorProfile.createdAt)} month
              </p>

              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <Rating
                    className="inline"
                    readOnly={true}
                    style={{ maxWidth: 88 }}
                    value={parseFloat(doctorProfile.avgRating || "0")}
                    itemStyles={customStyles}
                  />
                  <span className="text-sm font-semibold text-ink">
                    {parseFloat(doctorProfile.avgRating || "0").toFixed(1)}
                  </span>
                </span>

                <span aria-hidden="true" className="text-hairline-strong">
                  |
                </span>

                <span className="text-sm text-muted">
                  {doctorProfile?.totalConsultations
                    ? doctorProfile?.totalConsultations
                    : 0}{" "}
                  consultations
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Specialities */}
        {specialization.length > 0 && (
          <div className="w-full border-t border-hairline pt-6 lg:w-auto lg:max-w-md lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <h2 className="text-2xs font-semibold uppercase tracking-[0.09em] text-muted">
              Specialization
            </h2>

            {/*
              Each item was wrapped in a redundant fragment holding a single div,
              and the `key` sat on the div inside it rather than on the outermost
              element of the iteration — React warns about that and cannot reorder
              the list efficiently. The inline check SVG also used `stroke-linecap`
              / `stroke-linejoin`, which are DOM attribute names React does not
              recognise in JSX and drops.
            */}
            <ul className="mt-4 flex flex-wrap gap-2">
              {specialization.map((item, index) => (
                <li
                  key={index}
                  className="inline-flex items-center gap-1.5 rounded-md border border-primary-100 bg-primary-50 px-2.5 py-1.5 text-xs font-medium text-primary-800"
                >
                  <Check
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-secondary-600"
                  />
                  {item.specialization}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProfileImageText;
