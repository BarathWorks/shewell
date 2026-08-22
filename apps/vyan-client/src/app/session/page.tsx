import { FilterBar } from "@/components/FilterBar";
import { SessionCard } from "@/components/SessionCard";
import { api } from "~/trpc/server";
import { format } from "date-fns";

type SessionPageProps = {
  searchParams: {
    categoryId?: string | string[];
    trimester?: "FIRST" | "SECOND" | "THIRD";
    minPrice?: string;
    maxPrice?: string;
    sortBy?: "price-asc" | "price-desc";
    // `status` is no longer accepted. It was read from the query string and
    // forwarded to the router, so `/session?status=DRAFT` listed unpublished
    // sessions to anyone who typed it. The listing shows published sessions.
    startDate?: string;
    endDate?: string;
    isOnlyOnline?: string;
  };
};

// Make the page dynamic to ensure searchParams are processed on each request
export const dynamic = "force-dynamic";

export default async function SessionsPage({ searchParams }: SessionPageProps) {
  // Parse search params for filtering
  const categoryId = searchParams.categoryId
    ? Array.isArray(searchParams.categoryId)
      ? searchParams.categoryId
      : searchParams.categoryId.includes(",")
        ? searchParams.categoryId.split(",")
        : [searchParams.categoryId]
    : undefined;

  const minPrice = searchParams.minPrice
    ? parseFloat(searchParams.minPrice)
    : undefined;
  const maxPrice = searchParams.maxPrice
    ? parseFloat(searchParams.maxPrice)
    : undefined;

  const sortBy = searchParams.sortBy;
  const trimester = searchParams.trimester || undefined;
  const startDate = searchParams.startDate;
  const endDate = searchParams.endDate;
  const isOnlyOnline = searchParams.isOnlyOnline || undefined;

  // Fetch sessions and categories in parallel
  const [result, categories] = await Promise.all([
    api.session.filterSessions({
      categoryId,
      trimester,
      minPrice,
      maxPrice,
      sortBy,
      startDate,
      endDate,
      isOnlyOnline,
    }),
    api.session.getAllCategories({}),
  ]);

  const sessions = result.sessions ?? [];

  // DB already returns sessions ordered by startAt asc — no JS sort needed
  // Group sessions by month
  const groups = new Map<string, typeof sessions>();
  sessions.forEach((session) => {
    const month = format(new Date(session.startAt), "MMMM");
    if (!groups.has(month)) groups.set(month, []);
    groups.get(month)!.push(session);
  });

  const cassifiedSessions = Array.from(groups.entries()).map(
    ([month, sessions]) => ({
      month,
      sessions,
    }),
  );

  return (
    <div className="bg-canvas">
      {/* Page header */}
      <div className="border-b border-hairline bg-surface">
        <div className="container-page py-12 text-center md:py-16 lg:py-20">
          <p className="eyebrow">Expert-led programmes</p>
          <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl lg:text-6xl">
            Courses That <span className="text-primary-600">Support You</span>
            <br className="hidden sm:block" /> Every Step of the Way
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-body sm:text-lg">
            From fertility to first steps. Evidence-based, heart-led, and
            expert-designed just for you.
          </p>
        </div>
      </div>

      {/* Filters */}
      <FilterBar categories={categories} />

      {/* Listing */}
      <div className="container-page py-10 md:py-14">
        {sessions.length === 0 ? (
          <div className="surface-card mx-auto flex max-w-2xl flex-col items-center px-6 py-14 text-center sm:px-10">
            <div className="relative size-32 sm:size-40">
              <img
                src="/no_sessions_illustration_clean.svg"
                alt=""
                aria-hidden="true"
                className="h-full w-full object-contain opacity-90"
              />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-ink sm:text-2xl">
              No sessions found
            </h2>
            <p className="mt-2.5 max-w-md text-sm leading-relaxed text-body">
              We couldn&apos;t find any sessions matching your current filters.
              Try adjusting your search or checking back later.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-10 md:gap-14">
            {cassifiedSessions.map((group) => (
              <section key={group.month}>
                {/* Month rule. The label sits on the line rather than floating
                    above an unbounded stack of cards, so long lists stay easy to
                    scan. */}
                <div className="flex items-center gap-4">
                  <h2 className="shrink-0 text-lg font-semibold text-ink sm:text-xl">
                    {group.month}
                  </h2>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-hairline"
                  />
                  <span className="shrink-0 text-sm text-muted">
                    {group.sessions.length}{" "}
                    {group.sessions.length === 1 ? "session" : "sessions"}
                  </span>
                </div>

                {/* One card, every width. The mobile-only duplicate that used to
                    live here is gone — see the note in SessionCard. */}
                <ul className="mt-5 flex flex-col gap-4">
                  {group.sessions.map((session: any) => {
                    const sessionDate = format(
                      new Date(session.startAt),
                      "dd MMM yyyy",
                    );
                    const sessionTime = `${format(new Date(session.startAt), "h:mm a")} to ${format(new Date(session.endAt), "h:mm a")} IST`;

                    return (
                      <li key={session.id} className="flex">
                        <SessionCard
                          imageUrl={session.thumbnailMedia?.fileUrl ?? undefined}
                          language={session.language || "English"}
                          isOnline={session.type === "ONLINE"}
                          hasRecording={session.type === "RECORDING"}
                          sessionDate={sessionDate}
                          sessionTime={sessionTime}
                          title={session.title}
                          description={
                            "A comprehensive session focusing on health and wellness."
                          }
                          date={sessionDate}
                          price={Number(session.price)}
                          timeSlot={sessionTime}
                          detailPath={`/session/${session.slug}`}
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
