"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/src/@/components/popover";
import { Checkbox } from "@repo/ui/src/@/components/checkbox";
import { Button } from "@repo/ui/src/@/components/button";
import { Input } from "@repo/ui/src/@/components/input";

interface Category {
  id: string;
  name: string;
  trimester: string;
}

interface FilterBarProps {
  onlyOnlineCourses?: boolean;
  freeSessions?: boolean;
  categories?: Category[];
}

export const FilterBar = ({
  onlyOnlineCourses = false,
  freeSessions = false,
  categories = [],
}: FilterBarProps): JSX.Element => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOnlineCourses, setIsOnlineCourses] = useState(onlyOnlineCourses);
  const [isFreeSessions, setIsFreeSessions] = useState(freeSessions);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Dropdown states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTrimester, setSelectedTrimester] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Update URL params helper
  const updateURLParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else if (Array.isArray(value)) {
          value.length ? params.set(key, value.join(",")) : params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, searchParams, router],
  );

  // Initialize filters from URL params
  useEffect(() => {
    const filters: string[] = [];
    const categoryIds =
      searchParams.get("categoryId")?.split(",").filter(Boolean) || [];
    const trimester = searchParams.get("trimester") || "";
    const min = searchParams.get("minPrice") || "";
    const max = searchParams.get("maxPrice") || "";
    const sort = searchParams.get("sortBy") || "";
    const start = searchParams.get("startDate") || "";
    const end = searchParams.get("endDate") || "";

    setSelectedCategories(categoryIds);
    setSelectedTrimester(trimester);
    setMinPrice(min);
    setMaxPrice(max);
    setSortBy(sort);
    setStartDate(start);
    setEndDate(end);

    if (categoryIds.length > 0) {
      filters.push(`Categories: ${categoryIds.length} selected`);
    }
    if (trimester) {
      filters.push(`Trimester: ${trimester}`);
    }
    if (min) {
      filters.push(`Min Price: $${min}`);
    }
    if (max && max !== "0") {
      filters.push(`Max Price: $${max}`);
    }
    if (sort) {
      filters.push(`Sort: ${sort.replace("-", " ")}`);
    }
    if (start) {
      filters.push(`From: ${new Date(start).toLocaleDateString()}`);
    }
    if (end) {
      filters.push(`To: ${new Date(end).toLocaleDateString()}`);
    }
    setSelectedFilters(filters);

    // Set free sessions toggle based on price filter
    if (max === "0") {
      setIsFreeSessions(true);
    } else {
      setIsFreeSessions(false);
    }
  }, [searchParams]);

  const handleRemoveFilter = (index: number) => {
    const filterToRemove = selectedFilters[index];
    const newFilters = selectedFilters.filter((_, i) => i !== index);
    setSelectedFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams(searchParams.toString());

    if (filterToRemove?.startsWith("Categories:")) {
      console.log("Removing category filter");
      params.delete("categoryId");
    } else if (filterToRemove?.startsWith("Trimester:")) {
      console.log("Removing trimester filter");
      params.delete("trimester");
    } else if (filterToRemove?.startsWith("Min Price:")) {
      params.delete("minPrice");
    } else if (filterToRemove?.startsWith("Max Price:")) {
      params.delete("maxPrice");
    } else if (filterToRemove?.startsWith("Sort:")) {
      params.delete("sortBy");
    } else if (filterToRemove?.startsWith("From:")) {
      params.delete("startDate");
    } else if (filterToRemove?.startsWith("To:")) {
      params.delete("endDate");
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

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(newCategories);
    updateURLParams({ categoryId: newCategories });
  };

  // Handle trimester selection
  const handleTrimesterChange = (value: string) => {
    setSelectedTrimester(value);
    updateURLParams({ trimester: value || null });
  };

  // Handle price range
  const handlePriceChange = () => {
    updateURLParams({
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
    });
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateURLParams({ sortBy: value || null });
  };

  // Handle date range
  const handleDateChange = () => {
    updateURLParams({
      startDate: startDate || null,
      endDate: endDate || null,
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedTrimester("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("");
    setStartDate("");
    setEndDate("");
    setIsFreeSessions(false);
    router.push(pathname);
  };

  return (
    <div className="w-full space-y-3 font-inter">
      {/* CENTERED FILTER BAR */}
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-full bg-[#EEEEEE] px-6 py-3 text-sm">
          <FilterToggle
            label="Only Online Courses"
            enabled={isOnlineCourses}
            onClick={() => setIsOnlineCourses(!isOnlineCourses)}
          />

          <Divider />

          {/* Category Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 text-black hover:text-gray-600">
                Category{" "}
                {selectedCategories.length > 0 &&
                  `(${selectedCategories.length})`}
                <ChevronDown size={14} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-white">
              <div className="space-y-2">
                <div className="text-sm font-medium">Select Categories</div>
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <span className="text-sm">{category.name}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Divider />

          {/* Trimester Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 text-black hover:text-gray-600">
                Trimester {selectedTrimester && `(${selectedTrimester})`}
                <ChevronDown size={14} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 bg-white">
              <div className="space-y-2">
                <div className="text-sm font-medium">Select Trimester</div>
                {["FIRST", "SECOND", "THIRD"].map((tri) => (
                  <div
                    key={tri}
                    className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-gray-100"
                    onClick={() =>
                      handleTrimesterChange(
                        tri === selectedTrimester ? "" : tri,
                      )
                    }
                  >
                    <Checkbox checked={selectedTrimester === tri} />
                    <span className="text-sm">{tri}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Divider />

          {/* Price Range Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 text-black hover:text-gray-600">
                Price {(minPrice || maxPrice) && "(Set)"}
                <ChevronDown size={14} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-white">
              <div className="space-y-3">
                <div className="text-sm font-medium">Price Range</div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinPrice(e.target.value)}
                    className="w-24"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxPrice(e.target.value)}
                    className="w-24"
                  />
                </div>
                <Button
                  onClick={handlePriceChange}
                  size="small"
                  className="w-full"
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Divider />

          {/* Date Range Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 text-black hover:text-gray-600">
                Date {(startDate || endDate) && "(Set)"}
                <ChevronDown size={14} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-white">
              <div className="space-y-3">
                <div className="text-sm font-medium">Date Range</div>
                <div className="space-y-2">
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">
                      From
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">
                      To
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleDateChange}
                  size="small"
                  className="w-full"
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Divider />

          {/* Sort By Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 text-black hover:text-gray-600">
                Sort {sortBy && "(Set)"}
                <ChevronDown size={14} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 bg-white">
              <div className="space-y-2">
                <div className="text-sm font-medium">Sort By</div>
                {[
                  { value: "price-asc", label: "Price: Low to High" },
                  { value: "price-desc", label: "Price: High to Low" },
                ].map((option) => (
                  <div
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-gray-100"
                    onClick={() =>
                      handleSortChange(
                        option.value === sortBy ? "" : option.value,
                      )
                    }
                  >
                    <Checkbox checked={sortBy === option.value} />
                    <span className="text-sm">{option.label}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

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
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-xl border bg-white px-6 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-medium text-black">
                Filters Applied
              </div>
              <Button
                variant="outline"
                size="small"
                onClick={handleClearFilters}
              >
                Clear All
              </Button>
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
        </div>
      )}
    </div>
  );
};

/* ------------------ Helpers ------------------ */

const Divider = () => <span className="mx-4 h-6 w-px bg-gray-300" />;

const FilterItem = ({ label }: { label: string }) => (
  <button
    className="flex items-center gap-1 text-black  hover:text-gray-600"
    onClick={() => {}}
  >
    {label}
    <ChevronDown size={14} />
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
