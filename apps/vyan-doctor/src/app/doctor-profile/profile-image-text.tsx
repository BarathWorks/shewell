"use client";

import Image from "next/image";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { differenceInMonths, differenceInYears } from "date-fns";
import { CalendarClock, MessagesSquare, Star } from "lucide-react";

interface IProfileImageTextProps {
  doctorProfile: {
    firstName?: string | null;
    displayQualification: string | null | undefined;
    avgRating?: string | null;
    totalConsultations?: number | null;
    createdAt: Date;
    media?: { fileUrl: string | null } | null;
  };
  specialization: {
    specialization: string;
  }[];
}

/**
 * The identity block at the top of the practitioner's own profile.
 *
 * Rebuilt as a single card. Points worth naming:
 *
 *  - The portrait was three nested absolutely-positioned rings — a
 *    `border-primary-600/10` circle, a `ring-4 ring-white` circle, and a
 *    `<div className="w-[225px]">` passed in from the parent as a `cardImage`
 *    prop, which is why the avatar was a fixed 225px at every breakpoint and
 *    overflowed its own frame on a phone. One element now, sized responsively.
 *  - "Active from 2 year 25 month" — the previous line printed
 *    `differenceInYears` and `differenceInMonths` side by side, but the second is
 *    the *total* months, not the remainder. Someone two years in read "2 year 25
 *    month". It is one figure now, and it is pluralised.
 *  - Rating showed `0.0` and five grey stars for a practitioner who simply has no
 *    reviews yet, which reads as a bad score rather than no score. No reviews now
 *    says so.
 */
const ProfileImageText = ({
  doctorProfile,
  specialization,
}: IProfileImageTextProps) => {
  const StarDrawing = (
    <path d="M15.1533 1.24496C14.6395 0.359428 13.3607 0.359425 12.8468 1.24496L9.2281 7.48137C8.97427 7.91882 8.53553 8.21734 8.03545 8.29287L1.2537 9.31717C0.114654 9.48921 -0.284892 10.9274 0.602182 11.6623L5.6543 15.8479C6.12196 16.2354 6.34185 16.8465 6.22825 17.4431L4.90669 24.3833C4.69778 25.4804 5.8495 26.3328 6.8377 25.8125L13.2236 22.4501C13.7096 22.1941 14.2905 22.1941 14.7766 22.4501L21.1625 25.8125C22.1507 26.3328 23.3024 25.4804 23.0935 24.3833L21.7719 17.4431C21.6583 16.8465 21.8782 16.2354 22.3459 15.8479L27.398 11.6623C28.285 10.9274 27.8855 9.48921 26.7465 9.31717L19.9647 8.29287C19.4646 8.21734 19.0259 7.91882 18.7721 7.48137L15.1533 1.24496Z" />
  );

  const ratingStyles = {
    itemShapes: StarDrawing,
    activeFillColor: "#00898F",
    inactiveFillColor: "#DFE7ED",
  };

  const rating = parseFloat(doctorProfile.avgRating || "0");
  const hasRating = rating > 0;
  const consultations = doctorProfile.totalConsultations ?? 0;

  // One figure, correctly derived: `differenceInMonths` counts from the start,
  // not from the last whole year, so it has to have the years taken back out.
  const years = differenceInYears(new Date(), doctorProfile.createdAt);
  const months = differenceInMonths(new Date(), doctorProfile.createdAt) - years * 12;
  const tenure =
    years > 0
      ? `${years} ${years === 1 ? "year" : "years"}${months > 0 ? ` ${months} ${months === 1 ? "month" : "months"}` : ""}`
      : months > 0
        ? `${months} ${months === 1 ? "month" : "months"}`
        : "less than a month";

  return (
    <section className="surface-card overflow-hidden">
      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-start sm:gap-7 sm:p-6">
        {/* Portrait */}
        <div className="relative mx-auto size-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-hairline sm:mx-0 sm:size-32 lg:size-36">
          <Image
            src={doctorProfile.media?.fileUrl || "/images/fallback-user-profile.png"}
            alt=""
            fill
            sizes="144px"
            className="object-cover"
          />
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Dr. {doctorProfile.firstName || "—"}
          </h2>

          {doctorProfile.displayQualification ? (
            <p className="mt-1 text-sm font-medium text-primary-700">
              {doctorProfile.displayQualification}
            </p>
          ) : null}

          {/* Three figures on one rule, rather than scattered rows of icons. */}
          <dl className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-3 sm:justify-start">
            <div className="min-w-0">
              <dt className="eyebrow">Rating</dt>
              <dd className="mt-1 flex items-center gap-2">
                {hasRating ? (
                  <>
                    <Rating
                      readOnly
                      style={{ maxWidth: 84 }}
                      value={rating}
                      itemStyles={ratingStyles}
                    />
                    <span className="tabular text-sm font-semibold text-ink">
                      {rating.toFixed(1)}
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                    <Star aria-hidden="true" className="size-4" />
                    No reviews yet
                  </span>
                )}
              </dd>
            </div>

            <div className="min-w-0">
              <dt className="eyebrow">Consultations</dt>
              <dd className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                <MessagesSquare aria-hidden="true" className="size-4 text-muted" />
                <span className="tabular">{consultations.toLocaleString("en-IN")}</span>
              </dd>
            </div>

            <div className="min-w-0">
              <dt className="eyebrow">On Shewell</dt>
              <dd className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                <CalendarClock aria-hidden="true" className="size-4 text-muted" />
                {tenure}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Specialisations */}
      {specialization.length > 0 ? (
        <div className="border-t border-hairline bg-canvas px-5 py-4 sm:px-6">
          <h3 className="eyebrow">Specialisations</h3>
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {specialization.map((item, index) => (
              <li
                key={`${item.specialization}-${index}`}
                className="rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800 ring-1 ring-inset ring-primary-200/70"
              >
                {item.specialization}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
};

export default ProfileImageText;
