/**
 * Loading placeholder for `SimilarDoctorProfileCard`.
 *
 * Rebuilt to match the card it stands in for. The previous version described the
 * *old* card — a 135px square portrait beside a two-column block, `w-fit` so it
 * did not fill its grid cell — so the row visibly reflowed the moment real data
 * arrived. Same outer shape and same regions as the real card now, which is the
 * only thing that makes a skeleton better than an empty box.
 *
 * It also used `animate-pulse` on `bg-gray-300`, while every other placeholder in
 * this app uses the `.skeleton` shimmer defined in `globals.css`.
 */
const SimilarDoctorCardSkeleton = () => {
  return (
    <div
      aria-hidden="true"
      className="surface-card flex h-full flex-col p-4 sm:p-5"
    >
      <div className="flex items-start gap-4">
        <div className="skeleton size-16 shrink-0 rounded-full" />

        <div className="min-w-0 flex-1">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton mt-2 h-3.5 w-40" />
          <div className="skeleton mt-3 h-3 w-28" />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-hairline pt-4">
        <div>
          <div className="skeleton h-2.5 w-20" />
          <div className="mt-2 flex gap-1.5">
            <div className="skeleton h-5 w-20 rounded-md" />
            <div className="skeleton h-5 w-16 rounded-md" />
          </div>
        </div>

        <div>
          <div className="skeleton h-2.5 w-16" />
          <div className="mt-2 flex gap-1.5">
            <div className="skeleton h-5 w-14 rounded-md" />
            <div className="skeleton h-5 w-18 rounded-md" />
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 border-t border-hairline pt-4">
        <div>
          <div className="skeleton h-5 w-16" />
          <div className="skeleton mt-1.5 h-3 w-20" />
        </div>
        <div className="skeleton h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
};

export default SimilarDoctorCardSkeleton;
