"use client";

import Link from "next/link";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { ArrowRight, Star } from "lucide-react";

import { DoctorAvatar } from "~/components/ui";
import { buttonClass } from "~/components/ui/button-styles";

interface IDoctorProfileProps {
  doctorProfile: {
    firstName?: string | null;
    displayQualification: {
      id: string;
      specialization: string;
    } | null;
    avgRating?: string | null;
    totalConsultations?: number | null;
    languages: {
      language?: string;
    }[];
    professionalUserAppointmentPrices:
      | {
          priceInCentsForSingle?: number | null;
          priceInCentsForCouple?: number | null;
        }[]
      | null;
    userName: string | null;
    media: {
      fileUrl?: string | null;
    } | null;
  };
  specialization: {
    specialization?: string;
  }[];
}

/**
 * One practitioner in the "practitioners in your field" row.
 *
 * Notes:
 *
 *  - The name was `text-base md:text-[30px] xl:text-2xl` — 30px at `md`, then
 *    *smaller* at `xl`, because the two were written at different times and the
 *    breakpoints were never read in order. One size now.
 *  - The price fell back from `priceInCentsForSingle` to `priceInCentsForCouple`
 *    with `!` on a value the type says can be null, so a practitioner who has set
 *    only a couples fee rendered `INR NaN`. Both are checked, and the label says
 *    which fee is being shown — previously a couples price appeared with no
 *    indication it was not the one-to-one rate.
 *  - "View Profile" was a `<Button>` inside a `<Link>` — a nested interactive
 *    element, invalid HTML, and two overlapping targets for one destination.
 *  - The 20-line inline user `<svg>` on that button is a `lucide` arrow.
 *  - `INR 1200` is now formatted through `Intl` as ₹1,200, matching the
 *    dashboard.
 */

const StarDrawing = (
  <path d="M15.1533 1.24496C14.6395 0.359428 13.3607 0.359425 12.8468 1.24496L9.2281 7.48137C8.97427 7.91882 8.53553 8.21734 8.03545 8.29287L1.2537 9.31717C0.114654 9.48921 -0.284892 10.9274 0.602182 11.6623L5.6543 15.8479C6.12196 16.2354 6.34185 16.8465 6.22825 17.4431L4.90669 24.3833C4.69778 25.4804 5.8495 26.3328 6.8377 25.8125L13.2236 22.4501C13.7096 22.1941 14.2905 22.1941 14.7766 22.4501L21.1625 25.8125C22.1507 26.3328 23.3024 25.4804 23.0935 24.3833L21.7719 17.4431C21.6583 16.8465 21.8782 16.2354 22.3459 15.8479L27.398 11.6623C28.285 10.9274 27.8855 9.48921 26.7465 9.31717L19.9647 8.29287C19.4646 8.21734 19.0259 7.91882 18.7721 7.48137L15.1533 1.24496Z" />
);

const ratingStyles = {
  itemShapes: StarDrawing,
  activeFillColor: "#00898F",
  inactiveFillColor: "#DFE7ED",
};

const rupees = (cents: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents / 100);

const SimilarDoctorProfileCard = ({
  doctorProfile,
  specialization,
}: IDoctorProfileProps) => {
  const price = doctorProfile.professionalUserAppointmentPrices?.[0];
  const single = price?.priceInCentsForSingle;
  const couple = price?.priceInCentsForCouple;

  const fee =
    typeof single === "number" && single > 0
      ? { amount: rupees(single), label: "per session" }
      : typeof couple === "number" && couple > 0
        ? { amount: rupees(couple), label: "couples session" }
        : null;

  const rating = parseFloat(doctorProfile.avgRating || "0");
  const consultations = doctorProfile.totalConsultations ?? 0;

  return (
    <article className="surface-card flex h-full flex-col p-4 transition-shadow duration-200 hover:shadow-md sm:p-5">
      <div className="flex items-start gap-4">
        <DoctorAvatar
          src={doctorProfile.media?.fileUrl || "/images/fallback-user-profile.png"}
          alt=""
          size="medium"
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-ink">
            Dr. {doctorProfile.firstName}
          </h3>

          {doctorProfile.displayQualification?.specialization ? (
            <p className="mt-0.5 truncate text-sm text-primary-700">
              {doctorProfile.displayQualification.specialization}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {rating > 0 ? (
              <span className="flex items-center gap-1.5">
                <Rating
                  readOnly
                  style={{ maxWidth: 76 }}
                  value={rating}
                  itemStyles={ratingStyles}
                />
                <span className="tabular text-xs font-medium text-body">
                  {rating.toFixed(1)}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <Star aria-hidden="true" className="size-3.5" />
                No reviews
              </span>
            )}

            <span className="tabular text-xs text-muted">
              {consultations} {consultations === 1 ? "consultation" : "consultations"}
            </span>
          </div>
        </div>
      </div>

      {/* Detail */}
      <dl className="mt-4 flex flex-col gap-2.5 border-t border-hairline pt-4">
        {specialization.length > 0 ? (
          <div>
            <dt className="eyebrow">Specialises in</dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {specialization.map((item, index) => (
                <span
                  key={`${item.specialization}-${index}`}
                  className="rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-800 ring-1 ring-inset ring-primary-200/70"
                >
                  {item.specialization}
                </span>
              ))}
            </dd>
          </div>
        ) : null}

        {doctorProfile.languages.length > 0 ? (
          <div>
            <dt className="eyebrow">Languages</dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {doctorProfile.languages.map((item, index) => (
                <span
                  key={`${item.language}-${index}`}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-body ring-1 ring-inset ring-slate-200/70"
                >
                  {item.language}
                </span>
              ))}
            </dd>
          </div>
        ) : null}
      </dl>

      {/* Fee and link */}
      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-hairline pt-4">
        <div className="min-w-0">
          {fee ? (
            <>
              <p className="tabular text-lg font-semibold leading-none text-ink">
                {fee.amount}
              </p>
              <p className="mt-1 text-xs text-muted">{fee.label}</p>
            </>
          ) : (
            <p className="text-xs text-muted">Fees not set</p>
          )}
        </div>

        <Link
          href={`/doctor-profile/${doctorProfile.userName}`}
          className={buttonClass({ variant: "outline", size: "sm" })}
        >
          View profile
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </article>
  );
};

export default SimilarDoctorProfileCard;
