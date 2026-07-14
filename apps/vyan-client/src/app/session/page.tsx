import { FilterBar } from "@/components/FilterBar";
import { SessionCard } from "@/components/SessionCard";
import { api } from "~/trpc/server";
import { format } from "date-fns";
import { SessionStatus } from "@repo/database";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
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
              
              {/* Mobile & Tablet: enhanced vertical card */}
              <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:hidden">
                {group.sessions.map((session: any) => {
                  const startDate = new Date(session.startAt);
                  const endDate = session.endAt
                    ? new Date(session.endAt)
                    : new Date(startDate.getTime() + 60 * 60 * 1000);
                  const month = startDate
                    .toLocaleString("default", { month: "short" })
                    .toUpperCase();
                  const day = startDate.getDate();
                  const formatTime = (d: Date) =>
                    d.toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    });
                  const isFree = Number(session.price) === 0;

                  return (
                    <Link key={session.id} href={`/session/${session.slug}`} className="block">
                      <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-[#00898F]/20 hover:shadow-lg">

                        {/* Thumbnail */}
                        <div className="relative h-40 w-full flex-shrink-0 overflow-hidden xs:h-44">
                          {session?.thumbnailMedia?.fileUrl ? (
                            <img
                              src={session.thumbnailMedia.fileUrl}
                              alt={session.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-50 to-gray-100">
                              <Calendar className="h-10 w-10 text-gray-300" />
                              <span className="text-[10px] font-medium uppercase tracking-widest text-gray-300">
                                Session
                              </span>
                            </div>
                          )}

                          {/* Date ribbon */}
                          <div className="absolute right-3 top-0 flex w-11 flex-col items-center overflow-hidden rounded-b-xl bg-[#00898F] pb-3 pt-2 text-white shadow-md">
                            <span className="text-[8px] font-bold uppercase tracking-widest leading-none opacity-70">
                              {month}
                            </span>
                            <span className="text-xl font-black leading-tight">
                              {day}
                            </span>
                          </div>

                          {/* Type badge — top left */}
                          {session.type === "ONLINE" && (
                            <div className="absolute left-3 top-3">
                              <span className="flex items-center gap-1 rounded-full bg-green-500/90 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                                Live
                              </span>
                            </div>
                          )}
                          {session.type === "RECORDING" && (
                            <div className="absolute left-3 top-3">
                              <span className="flex items-center gap-1 rounded-full bg-orange-500/90 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                Rec
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex flex-1 flex-col p-3 xs:p-4">

                          {/* Language tag */}
                          {session.language && (
                            <span className="mb-2 inline-block w-fit rounded border border-[#00898F]/20 bg-[#E8F7F7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#00898F]">
                              {session.language}
                            </span>
                          )}

                          {/* Title */}
                          <h3 className="mb-1.5 line-clamp-2 text-sm font-extrabold leading-snug text-gray-900 xs:text-base">
                            {session.title}
                          </h3>

                          {/* Time row */}
                          <div className="mb-3 flex items-center gap-1 text-[10px] text-gray-400 xs:text-xs">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="line-clamp-1">
                              {formatTime(startDate)} – {formatTime(endDate)} IST
                            </span>
                          </div>

                          <div className="mt-auto flex items-center gap-2">
                            {/* Price */}
                            <span className={`text-sm font-extrabold ${isFree ? "text-[#00898F]" : "text-[#114668]"}`}>
                              {isFree ? "Free" : `₹${Number(session.price).toLocaleString("en-IN")}`}
                            </span>

                            {/* Register */}
                            <button className="ml-auto rounded-xl bg-[#00898F] px-4 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-[#007a80] active:scale-95">
                              Register →
                            </button>
                          </div>
                        </div>

                      </div>
                    </Link>
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
