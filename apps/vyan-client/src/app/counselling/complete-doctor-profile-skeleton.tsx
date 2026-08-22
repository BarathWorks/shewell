/**
 * Placeholder for one expert card.
 *
 * Rebuilt to mirror the real card's structure so the layout does not jump when
 * results arrive. The old version was a different shape entirely — a `md:flex-row`
 * split with a "Specialized In:" / "Languages:" / "Available Time Slots" label
 * scaffold that the loaded card does not have — so the page visibly reflowed on
 * every search.
 */
const CompleteDoctorProfileSkeleton = () => {
  return (
    <div
      className="surface-card flex h-full w-full flex-col gap-6 p-5 sm:p-6"
      aria-hidden="true"
    >
      <div className="flex gap-4 sm:gap-5">
        <div className="skeleton size-20 shrink-0 rounded-full sm:size-24" />

        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="skeleton h-6 w-40" />
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-4 w-44" />
          <div className="flex gap-1.5">
            <div className="skeleton h-6 w-16" />
            <div className="skeleton h-6 w-20" />
            <div className="skeleton h-6 w-14" />
          </div>
        </div>
      </div>

      <div className="border-t border-hairline pt-5">
        <div className="skeleton h-10 w-full" />
        <div className="mt-3 flex gap-2">
          <div className="skeleton h-9 w-20" />
          <div className="skeleton h-9 w-20" />
          <div className="skeleton h-9 w-20" />
        </div>
      </div>

      <div className="mt-auto">
        <div className="skeleton h-11 w-full sm:w-48" />
      </div>
    </div>
  );
};
export default CompleteDoctorProfileSkeleton;
