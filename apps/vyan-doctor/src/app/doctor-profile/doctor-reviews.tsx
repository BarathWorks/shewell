"use client";

import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { format } from "date-fns";
import { BadgeCheck, MessageSquareOff } from "lucide-react";

import { EmptyState } from "~/components/ui/page";

interface IdoctorReviews {
  doctorReview: {
    rating: number;
    review: string;
    createdAt: Date;
    bookAppointment: {
      user: {
        name: string;
      };
    };
  }[];
}

/**
 * The Reviews tab.
 *
 * The distribution bars were ten near-identical blocks — one `filter().length`,
 * one percentage, one hand-drawn star `<svg>` and one bar per rating value, all
 * written out longhand. They are derived in a loop now, which also fixes the
 * division: with no reviews, `count / 0` is `NaN`, and `width: NaN%` renders as
 * a full-width bar, so an unrated practitioner briefly showed five bars at 100%.
 * (The empty case short-circuits before that, but the arithmetic was wrong
 * regardless and the guard was doing all the work.)
 *
 * The verified tick was `{true ? <svg/> : ""}` — a conditional with a constant
 * condition, so every review displayed a green verified badge whether or not
 * anything had been verified. Every review here comes from a completed, paid
 * booking, which *is* the verification, so the badge stays and now says what it
 * means rather than being decoration with a fake condition.
 *
 * Also: a `console.log` of every review — these are client-written comments
 * about a named practitioner — and an average that was computed and never used.
 */
const StarDrawing = (
  <path d="M15.1533 1.24496C14.6395 0.359428 13.3607 0.359425 12.8468 1.24496L9.2281 7.48137C8.97427 7.91882 8.53553 8.21734 8.03545 8.29287L1.2537 9.31717C0.114654 9.48921 -0.284892 10.9274 0.602182 11.6623L5.6543 15.8479C6.12196 16.2354 6.34185 16.8465 6.22825 17.4431L4.90669 24.3833C4.69778 25.4804 5.8495 26.3328 6.8377 25.8125L13.2236 22.4501C13.7096 22.1941 14.2905 22.1941 14.7766 22.4501L21.1625 25.8125C22.1507 26.3328 23.3024 25.4804 23.0935 24.3833L21.7719 17.4431C21.6583 16.8465 21.8782 16.2354 22.3459 15.8479L27.398 11.6623C28.285 10.9274 27.8855 9.48921 26.7465 9.31717L19.9647 8.29287C19.4646 8.21734 19.0259 7.91882 18.7721 7.48137L15.1533 1.24496Z" />
);

const ratingStyles = {
  itemShapes: StarDrawing,
  activeFillColor: "#00898F",
  inactiveFillColor: "#DFE7ED",
};

const DoctorReview = ({ doctorReview }: IdoctorReviews) => {
  const total = doctorReview.length;

  if (total === 0) {
    return (
      <EmptyState
        icon={MessageSquareOff}
        title="No reviews yet"
        description="Clients can leave a review after a completed consultation. They will appear here."
      />
    );
  }

  const average =
    doctorReview.reduce((sum, item) => sum + item.rating, 0) / total;

  // Five to one, so the bars read top-down in the order people expect.
  const distribution = [5, 4, 3, 2, 1].map((score) => {
    const count = doctorReview.filter((item) => item.rating === score).length;
    return { score, count, percent: (count / total) * 100 };
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
        <div className="shrink-0 text-center sm:text-left">
          <p className="tabular text-4xl font-semibold leading-none text-ink">
            {average.toFixed(1)}
          </p>
          <div className="mt-2 flex justify-center sm:justify-start">
            <Rating
              readOnly
              style={{ maxWidth: 96 }}
              value={average}
              itemStyles={ratingStyles}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {total} {total === 1 ? "review" : "reviews"}
          </p>
        </div>

        <ul className="min-w-0 flex-1 space-y-1.5">
          {distribution.map(({ score, count, percent }) => (
            <li key={score} className="flex items-center gap-3">
              <span className="tabular w-3 shrink-0 text-xs font-medium text-body">
                {score}
              </span>

              <div
                className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200"
                role="img"
                aria-label={`${count} ${count === 1 ? "review" : "reviews"} at ${score} stars`}
              >
                <div
                  className="h-full rounded-full bg-primary-500"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <span className="tabular w-6 shrink-0 text-right text-xs text-muted">
                {count}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Reviews */}
      <ul className="flex flex-col gap-3 border-t border-hairline pt-5">
        {doctorReview.map((item, index) => (
          <li
            key={`${item.createdAt.toString()}-${index}`}
            className="rounded-lg border border-hairline p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-ink">
                <span className="truncate">
                  {item.bookAppointment.user.name}
                </span>
                <BadgeCheck
                  aria-label="Verified — this client completed a paid consultation"
                  className="size-4 shrink-0 text-secondary-500"
                />
              </p>

              <div className="flex shrink-0 items-center gap-2">
                <Rating
                  readOnly
                  style={{ maxWidth: 72 }}
                  value={Number(item.rating)}
                  itemStyles={ratingStyles}
                />
                <span className="tabular text-xs font-medium text-body">
                  {item.rating}
                </span>
              </div>
            </div>

            {item.review ? (
              <p className="mt-2.5 text-sm leading-relaxed text-body">
                {item.review}
              </p>
            ) : null}

            <time
              dateTime={new Date(item.createdAt).toISOString()}
              className="mt-2.5 block text-xs text-muted"
            >
              {format(new Date(item.createdAt), "d MMMM yyyy")}
            </time>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorReview;
