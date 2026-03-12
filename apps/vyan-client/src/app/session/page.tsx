import { FilterBar } from "@/components/FilterBar";
import { SessionCard } from "@/components/SessionCard";
import { api } from "~/trpc/server";
import { format } from "date-fns";
import { SessionStatus } from "@repo/database";
import Link from "next/link";
import { Calendar } from "lucide-react";

type SessionPageProps = {
  searchParams: {
    categoryId?: string | string[];
    trimester?: "FIRST" | "SECOND" | "THIRD";
    minPrice?: string;
    maxPrice?: string;
    sortBy?: "price-asc" | "price-desc";
    status?: "CANCELLED" | "COMPLETED" | "DRAFT" | "PUBLISHED";
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
      : [searchParams.categoryId]
    : undefined;

  const minPrice = searchParams.minPrice
    ? parseFloat(searchParams.minPrice)
    : undefined;
  const maxPrice = searchParams.maxPrice
    ? parseFloat(searchParams.maxPrice)
    : undefined;

  const sortBy = searchParams.sortBy;
  const status = searchParams.status || undefined;
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
      status,
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
    <main className="flex w-full flex-col items-center bg-white">
      {/* Hero Section */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 text-center sm:px-6 sm:py-12 md:py-16">
        <h1 className="font-inter text-2xl font-medium leading-tight text-[#333333] sm:text-3xl md:text-4xl lg:text-[48px] lg:leading-[48px]">
          Courses That Support You Every Step of the Way
        </h1>
        <p className="mt-2 font-inter text-sm text-gray-500 sm:mt-3 sm:text-base">
          From fertility to first steps. evidence based, heart led,
          expert-designed just for you.
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar categories={categories} />

      {/* Sessions List */}
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {sessions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-2 text-xl text-gray-600">
              No sessions available at the moment.
            </p>
            <p className="text-sm text-gray-400">
              Please check back later or contact support if you believe this is
              an error.
            </p>
          </div>
        ) : (
          cassifiedSessions.map((group) => (
            <div key={group.month} className="mb-6 sm:mb-8">
              <h2 className="mb-3 font-inter text-xl font-medium text-[#333333] sm:mb-4 sm:text-2xl">
                {group.month}
              </h2>
              
              {/* Mobile & Tablet View: Vertical Stack Layout (Homepage Style Cards) */}
              <div className="flex flex-col gap-4 md:hidden">
                {group.sessions.map((session: any) => {
                  const startDate = new Date(session.startAt);
                  const month = startDate.toLocaleString("default", { month: "short" });
                  const day = startDate.getDate();

                  return (
                    <div
                      key={session.id}
                      className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
                    >
                      {/* Header Image Area */}
                      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                        {session?.thumbnailMedia?.fileUrl ? (
                          <img
                            src={session.thumbnailMedia.fileUrl}
                            alt={session.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                            <Calendar className="h-12 w-12 opacity-50" />
                          </div>
                        )}

                        {/* Date Ribbon */}
                        <div className="absolute right-4 top-0 flex h-[70px] w-[50px] flex-col items-center justify-start rounded-b-lg bg-[#1B8A8E] pt-2 text-white shadow-md">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                              {month}
                            </span>
                            <span className="text-xl font-bold leading-none">
                              {day}
                            </span>
                          </div>
                          {/* Triangle bottom for ribbon effect */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: "-10px",
                              left: 0,
                              width: "100%",
                              height: "20px",
                              backgroundColor: "#1B8A8E",
                              clipPath: "polygon(0 0, 50% 50%, 100% 0)",
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex flex-1 flex-col p-5">
                        {/* Tags */}
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded bg-[#E3F6F5] px-2.5 py-1 text-xs font-semibold text-[#1B8A8E]">
                            {session.language || "English"}
                          </span>
                          {session.type === "ONLINE" && (
                            <span className="flex items-center gap-1.5 rounded bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                              Online
                            </span>
                          )}
                          {session.type === "RECORDING" && (
                            <span className="flex items-center gap-1.5 rounded bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                              Recording
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="mb-2 line-clamp-2 text-xl font-extrabold leading-tight text-gray-900">
                          {session.title}
                        </h3>

                        {/* Description placeholder */}
                        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-500">
                          A comprehensive session focusing on health and wellness. Join
                          us to learn from the best experts in the field.
                        </p>

                        {/* Spacer to push footer down */}
                        <div className="flex-1"></div>

                        {/* Footer: Price & Action */}
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="flex h-[42px] min-w-[90px] items-center justify-center rounded-lg border border-[#1B8A8E] bg-white text-base font-bold text-[#1B8A8E]">
                            ₹ {Number(session.price).toLocaleString()}
                          </div>

                          <Link href={`/session/${session.slug}`} className="flex-1">
                            <button className="flex h-[42px] w-full items-center justify-center rounded-lg bg-[#1B8A8E] px-4 text-sm font-bold text-white transition-colors hover:bg-[#156f73]">
                              Register
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View: List Layout (Original SessionCard) */}
              <div className="hidden space-y-4 md:block">
                {group.sessions.map((session: any) => {
                  const sessionDate = format(
                    new Date(session.startAt),
                    "dd MMM yyyy",
                  );
                  const sessionTime = `${format(new Date(session.startAt), "h:mm a")} to ${format(new Date(session.endAt), "h:mm a")} IST`;

                  return (
                    <SessionCard
                      key={session.id}
                      imageUrl={session.thumbnailMedia?.fileUrl ?? undefined}
                      language={session.language || "English"}
                      isOnline={session.type === "ONLINE"}
                      hasRecording={session.type === "RECORDING"}
                      sessionDate={sessionDate}
                      sessionTime={sessionTime}
                      title={session.title}
                      description={"Session"}
                      date={sessionDate}
                      price={Number(session.price)}
                      timeSlot={sessionTime}
                      detailPath={`/session/${session.slug}`}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
