import { FooterSection } from "@/components/FooterSection";
import { NavigationHeaderSection } from "@/components/NavigationHeaderSection";
import { FilterBar } from "@/components/FilterBar";
import { SessionCard } from "@/components/SessionCard";
import { api } from "~/trpc/server";
import { format } from "date-fns";
import { SessionStatus } from "@repo/database";

type SessionPageProps = {
  searchParams: {
    categoryId?: string | string[];
    trimester?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: "price-asc" | "price-desc";
    status?: string;
    startDate?: string;
    endDate?: string;
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
  const status = searchParams.status as SessionStatus | undefined;
  const trimester = searchParams.trimester as any;
  const startDate = searchParams.startDate;
  const endDate = searchParams.endDate;

  console.log("Filter params:", {
    categoryId,
    trimester,
    minPrice,
    maxPrice,
    sortBy,
    status,
    startDate,
    endDate,
  });

  // Fetch sessions using the filter endpoint
  const result = await api.session.filterSessions({
    categoryId,
    trimester,
    minPrice,
    maxPrice,
    sortBy,
    status,
    startDate,
    endDate,
  });

  const sessions = result.sessions || [];

  // Fetch categories for filter dropdown
  const categories = await api.session.getAllCategories({});

  console.log("Fetched sessions:", sessions.length, "sessions", sessions);

  return (
    <main className="flex w-full flex-col items-center bg-white">
      {/* <NavigationHeaderSection /> */}

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h1 className="font-inter text-[48px] font-medium leading-[48px] text-gray-800">
          Courses That Support You – Every Step of the Way
        </h1>
        <p className="mt-3 text-base text-gray-500">
          From fertility to first steps – evidence-based, heart-led,
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
          sessions.map((session) => {
            const sessionDate = format(
              new Date(session.startAt),
              "dd MMM yyyy",
            );
            const sessionTime = `${format(new Date(session.startAt), "h:mm a")} to ${format(new Date(session.endAt), "h:mm a")} IST`;

            return (
              <SessionCard
                key={session.id}
                language="English"
                isOnline={true}
                hasRecording={true}
                sessionDate={sessionDate}
                sessionTime={sessionTime}
                title={session.title}
                description={session.category?.name || ""}
                date={sessionDate}
                price={Number(session.price)}
                timeSlot={sessionTime}
                detailPath={`/session/${session.slug}`}
              />
            );
          })
        )}
      </div>
    </main>
  );
}
