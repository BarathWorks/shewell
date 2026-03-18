import { FilterBar } from "@/components/FilterBar";
import { SessionCard } from "@/components/SessionCard";
import { api } from "~/trpc/server";
import { format } from "date-fns";
import { SessionStatus } from "@repo/database";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="mx-auto w-full max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-16 md:py-20">
        <h1 className="font-outfit text-3xl font-bold tracking-tight text-[#1a1a1a] sm:text-4xl md:text-5xl lg:text-6xl">
          Courses That <span className="text-[#1B8A8E]">Support You</span> <br className="hidden sm:block" /> Every Step of the Way
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-inter text-base text-gray-500 sm:mt-6 sm:text-lg">
          From fertility to first steps. Evidence-based, heart-lead,
          and expert-designed just for you.
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar categories={categories} />

      {/* Sessions List */}
      <div className="mx-auto w-full max-w-7xl px-3 xs:px-4 sm:px-6 py-4 xs:py-6 sm:py-10">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 xs:py-16 sm:py-24 text-center">
            <div className="relative mb-6 xs:mb-8 h-32 xs:h-40 sm:h-48 md:h-64 w-32 xs:w-40 sm:w-48 md:w-64">
              <img 
                src="/no_sessions_illustration_clean.svg" 
                alt="No sessions found" 
                className="h-full w-full object-contain opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
            </div>
            <h3 className="mb-2 xs:mb-3 text-xl xs:text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              No sessions found
            </h3>
            <p className="mx-auto max-w-md px-2 text-sm xs:text-base sm:text-lg text-gray-500">
              We couldn't find any sessions matching your current filters. 
              Try adjusting your search or checking back later.
            </p>
            
          </div>
        ) : (
          cassifiedSessions.map((group) => (
            <div key={group.month} className="mb-4 xs:mb-5 sm:mb-6 md:mb-8">
              <h2 className="mb-2 xs:mb-3 sm:mb-4 font-inter text-lg xs:text-xl sm:text-2xl font-medium text-[#333333]">
                {group.month}
              </h2>
              
              {/* Mobile & Tablet View: Vertical Stack Layout (Homepage Style Cards) */}
              <div className="flex flex-col gap-3 xs:gap-3.5 sm:gap-4 md:hidden">
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
                      <div className="relative h-40 xs:h-44 sm:h-48 w-full overflow-hidden bg-gray-100">
                        {session?.thumbnailMedia?.fileUrl ? (
                          <img
                            src={session.thumbnailMedia.fileUrl}
                            alt={session.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                            <Calendar className="h-10 xs:h-11 sm:h-12 w-10 xs:w-11 sm:w-12 opacity-50" />
                          </div>
                        )}

                        {/* Date Ribbon */}
                        <div className="absolute right-3 xs:right-4 top-0 flex h-[60px] xs:h-[65px] sm:h-[70px] w-[45px] xs:w-[48px] sm:w-[50px] flex-col items-center justify-start rounded-b-lg bg-[#1B8A8E] pt-1.5 xs:pt-2 text-white shadow-md">
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-90">
                              {month}
                            </span>
                            <span className="text-base xs:text-lg sm:text-xl font-bold leading-none">
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
                      <div className="flex flex-1 flex-col p-3 xs:p-4 sm:p-5">
                        {/* Tags */}
                        <div className="mb-2 xs:mb-3 flex flex-wrap items-center gap-1.5 xs:gap-2">
                          <span className="rounded bg-[#E3F6F5] px-2 xs:px-2.5 py-0.5 xs:py-1 text-[11px] xs:text-xs font-semibold text-[#1B8A8E]">
                            {session.language || "English"}
                          </span>
                          {session.type === "ONLINE" && (
                            <span className="flex items-center gap-1 xs:gap-1.5 rounded bg-green-50 px-2 xs:px-2.5 py-0.5 xs:py-1 text-[11px] xs:text-xs font-semibold text-green-600">
                              <span className="h-1 xs:h-1.5 w-1 xs:w-1.5 rounded-full bg-green-500"></span>
                              Online
                            </span>
                          )}
                          {session.type === "RECORDING" && (
                            <span className="flex items-center gap-1 xs:gap-1.5 rounded bg-blue-50 px-2 xs:px-2.5 py-0.5 xs:py-1 text-[11px] xs:text-xs font-semibold text-blue-600">
                              <span className="h-1 xs:h-1.5 w-1 xs:w-1.5 rounded-full bg-blue-500"></span>
                              Recording
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="mb-1.5 xs:mb-2 line-clamp-2 text-base xs:text-lg sm:text-xl font-extrabold leading-tight text-gray-900">
                          {session.title}
                        </h3>

                        {/* Description placeholder */}
                        <p className="mb-3 xs:mb-4 line-clamp-3 text-xs xs:text-sm leading-relaxed text-gray-500">
                          A comprehensive session focusing on health and wellness. Join
                          us to learn from the best experts in the field.
                        </p>

                        {/* Spacer to push footer down */}
                        <div className="flex-1"></div>

                        {/* Footer: Price & Action */}
                        <div className="mt-3 xs:mt-4 flex items-center justify-between gap-2 xs:gap-3">
                          <div className="flex h-[36px] xs:h-[40px] sm:h-[42px] min-w-[80px] xs:min-w-[85px] sm:min-w-[90px] items-center justify-center rounded-lg border border-[#1B8A8E] bg-white text-xs xs:text-sm sm:text-base font-bold text-[#1B8A8E]">
                            ₹ {Number(session.price).toLocaleString()}
                          </div>

                          <Link href={`/session/${session.slug}`} className="flex-1">
                            <button className="flex h-[36px] xs:h-[40px] sm:h-[42px] w-full items-center justify-center rounded-lg bg-[#1B8A8E] px-3 xs:px-4 text-xs xs:text-sm sm:text-sm font-bold text-white transition-colors hover:bg-[#156f73] active:scale-[0.98]">
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
