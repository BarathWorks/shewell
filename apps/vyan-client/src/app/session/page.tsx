import { FilterBar } from "@/components/FilterBar";
import { SessionCard } from "@/components/SessionCard";
import { api } from "~/trpc/server";
import { format } from "date-fns";
import { SessionStatus } from "@repo/database";
import { unstable_cache } from "next/cache";

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

type SessionFilters = {
  categoryId?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price-asc" | "price-desc";
  status?: "CANCELLED" | "COMPLETED" | "DRAFT" | "PUBLISHED";
  trimester?: "FIRST" | "SECOND" | "THIRD";
  startDate?: string;
  endDate?: string;
  isOnlyOnline?: string;
};

// Cache categories - they rarely change, so cache for 1 hour
const getCachedCategories = unstable_cache(
  async () => api.session.getAllCategories({}),
  ["session-categories"],
  { revalidate: 3600, tags: ["categories"] }
);

// Cache sessions based on filters - cache for 5 minutes
const getCachedSessions = (filters: SessionFilters) => {
  // Create cache key from filters
  const cacheKey = JSON.stringify(filters);
  
  return unstable_cache(
    async () => api.session.filterSessions(filters),
    ["session-list", cacheKey],
    { revalidate: 300, tags: ["sessions"] }
  )();
};

// Optimized grouping function
function groupSessionsByMonth(sessions: any[]) {
  const grouped: Record<string, any[]> = {};
  
  for (const session of sessions) {
    const month = format(new Date(session.startAt), "MMMM");
    if (!grouped[month]) {
      grouped[month] = [];
    }
    grouped[month].push(session);
  }
  
  return Object.entries(grouped).map(([month, sessions]) => ({
    month,
    sessions,
  }));
}

export default async function SessionsPage({ searchParams }: SessionPageProps) {
  // Parse search params for filtering
  const filters: SessionFilters = {
    categoryId: searchParams.categoryId
      ? Array.isArray(searchParams.categoryId)
        ? searchParams.categoryId
        : [searchParams.categoryId]
      : undefined,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
    sortBy: searchParams.sortBy,
    status: searchParams.status || undefined,
    trimester: searchParams.trimester || undefined,
    startDate: searchParams.startDate,
    endDate: searchParams.endDate,
    isOnlyOnline: searchParams.isOnlyOnline || undefined,
  };

  // Fetch both in parallel (cached)
  const [result, categories] = await Promise.all([
    getCachedSessions(filters),
    getCachedCategories(),
  ]);

  const sessions = result.sessions ?? [];
  const cassifiedSessions = groupSessionsByMonth(sessions);

  return (
    <main className="flex w-full flex-col items-center bg-white">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h1 className=" font-inter text-[48px] font-medium leading-[48px] text-[#333333]">
          Courses That Support You Every Step of the Way
        </h1>
        <p className="mt-3 font-inter text-base text-gray-500">
          From fertility to first steps. evidence based, heart led,
          expert-designed just for you.
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar categories={categories} />

      {/* Sessions List */}
      <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-10">
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
            <div key={group.month} className="mb-8">
              <h2 className="mb-4 font-inter text-2xl font-medium text-[#333333]">
                {group.month}
              </h2>
              <div className="space-y-6">
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
