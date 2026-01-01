"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { Badge } from "../components/ui/badge";

interface FilterBarProps {
  onlyOnlineCourses?: boolean;
  freeSessions?: boolean;
}

export const FilterBar = ({
  onlyOnlineCourses = false,
  freeSessions = false,
}: FilterBarProps): JSX.Element => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOnlineCourses, setIsOnlineCourses] = useState(onlyOnlineCourses);
  const [isFreeSessions, setIsFreeSessions] = useState(freeSessions);

  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Initialize filters from URL params
  useEffect(() => {
    const filters: string[] = [];
    if (searchParams.get("categoryId")) {
      filters.push(`Category: ${searchParams.get("categoryId")}`);
    }
    if (searchParams.get("trimester")) {
      filters.push(`Trimester: ${searchParams.get("trimester")}`);
    }
    if (searchParams.get("minPrice")) {
      filters.push(`Min Price: $${searchParams.get("minPrice")}`);
    }
    if (searchParams.get("maxPrice")) {
      filters.push(`Max Price: $${searchParams.get("maxPrice")}`);
    }
    if (searchParams.get("sortBy")) {
      filters.push(`Sort: ${searchParams.get("sortBy")}`);
    }
    setSelectedFilters(filters);

    // Set free sessions toggle based on price filter
    if (searchParams.get("maxPrice") === "0") {
      setIsFreeSessions(true);
    }
  }, [searchParams]);

  const handleRemoveFilter = (index: number) => {
    const filterToRemove = selectedFilters[index];
    const newFilters = selectedFilters.filter((_, i) => i !== index);
    setSelectedFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams(searchParams.toString());

    if (filterToRemove?.startsWith("Category:")) {
      params.delete("categoryId");
    } else if (filterToRemove?.startsWith("Trimester:")) {
      params.delete("trimester");
    } else if (filterToRemove?.startsWith("Min Price:")) {
      params.delete("minPrice");
    } else if (filterToRemove?.startsWith("Max Price:")) {
      params.delete("maxPrice");
    } else if (filterToRemove?.startsWith("Sort:")) {
      params.delete("sortBy");
    }

    router.push(`/session?${params.toString()}`);
  };

  const handleFreeSessionsToggle = () => {
    const newValue = !isFreeSessions;
    setIsFreeSessions(newValue);

    const params = new URLSearchParams(searchParams.toString());
    if (newValue) {
      params.set("maxPrice", "0");
    } else {
      params.delete("maxPrice");
    }
    router.push(`/session?${params.toString()}`);
  };

  const handleSortByPrice = (direction: "asc" | "desc") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", `price-${direction}`);
    router.push(`/session?${params.toString()}`);
  };

  return (
    <div className="w-full space-y-6">
      {/* CENTERED FILTER BAR */}
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-2xl bg-gray-300 px-6 py-3 text-sm">
          <FilterToggle
            label="Only Online Courses"
            enabled={isOnlineCourses}
            onClick={() => setIsOnlineCourses(!isOnlineCourses)}
          />

          <Divider />

          <FilterItem label="Category" />
          <Divider />
          <FilterItem label="Trimester" />
          <Divider />
          <FilterItem label="Time" />
          <Divider />
          <FilterItem label="Date" />

          <Divider />

          <FilterToggle
            label="Free sessions"
            enabled={isFreeSessions}
            onClick={handleFreeSessionsToggle}
          />
        </div>
      </div>

      {/* FILTERS APPLIED */}
      {selectedFilters.length > 0 && (
        <div className="m-24 rounded-xl border bg-white px-6 py-4">
          <div className="mb-3 text-xs font-medium text-black">
            Filters Applied
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {selectedFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="rounded-md px-3 py-1 text-sm text-black"
                >
                  {filter}
                  <button
                    onClick={() => handleRemoveFilter(index)}
                    className="ml-2 text-black hover:text-gray-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------ Helpers ------------------ */

const Divider = () => <span className="mx-4 h-6 w-px bg-gray-300" />;

const FilterItem = ({ label }: { label: string }) => (
  <button className="flex items-center gap-1 text-black  hover:text-gray-600">
    {label}
    <ChevronUp size={14} />
  </button>
);

const FilterToggle = ({
  label,
  enabled,
  onClick,
}: {
  label: string;
  enabled: boolean;
  onClick: () => void;
}) => (
  <div className="flex items-center gap-3">
    <span className="text-black">{label}</span>
    <button
      onClick={onClick}
      className={`relative h-5 w-9 rounded-full transition ${
        enabled ? "bg-green-600" : "bg-gray-600"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
          enabled ? "left-4" : "left-1"
        }`}
      />
    </button>
  </div>
);
