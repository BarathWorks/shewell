"use client";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Filter } from "lucide-react";

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
  categories = [],
}: FilterBarProps): JSX.Element => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isFreeSessions, setIsFreeSessions] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTrimester, setSelectedTrimester] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filterObjects, setFilterObjects] = useState<{ key: string; label: string; value?: string }[]>([]);

  const updateURLParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else if (Array.isArray(value)) {
          if (value.length) {
            params.set(key, value.join(","));
          } else {
            params.delete(key);
          }
        } else {
          params.set(key, value);
        }
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, searchParams, router],
  );

  const removeFilter = (key: string, value?: string) => {
    if (key === "categoryId" && value) {
      const next = selectedCategories.filter((id) => id !== value);
      updateURLParams({ categoryId: next });
    } else if (key === "trimester") {
      updateURLParams({ trimester: null });
    } else if (key === "price") {
      updateURLParams({ minPrice: null, maxPrice: null });
    } else if (key === "date") {
      updateURLParams({ startDate: null, endDate: null });
    } else if (key === "sort") {
      updateURLParams({ sortBy: null });
    }
  };

  useEffect(() => {
    const filters: { key: string; label: string; value?: string }[] = [];
    const categoryIds = searchParams.get("categoryId")?.split(",").filter(Boolean) || [];
    const trimester = searchParams.get("trimester") || "";
    const min = searchParams.get("minPrice") || "";
    const max = searchParams.get("maxPrice") || "";
    const sort = searchParams.get("sortBy") || "";

    setSelectedCategories(categoryIds);
    setSelectedTrimester(trimester);
    setMinPrice(min);
    setMaxPrice(max);
    setSortBy(sort);

    categoryIds.forEach((id) => {
      const cat = categories.find((c) => c.id === id);
      if (cat) {
        filters.push({ key: "categoryId", label: cat.name, value: id });
      }
    });

    if (trimester) filters.push({ key: "trimester", label: `Tri: ${trimester}` });
    if (min || max) {
      const label =
        min && max
          ? `₹${min} - ₹${max}`
          : min
            ? `Above ₹${min}`
            : `Below ₹${max}`;
      filters.push({ key: "price", label });
    }
    if (sort)
      filters.push({
        key: "sort",
        label: sort === "price-asc" ? "Price: Low-High" : "Price: High-Low",
      });

    const filterLabels = filters.map((f) =>
      typeof f === "string" ? f : f.label,
    );
    // Keeping selectedFilters as string[] for compatibility with existing badge map if needed, 
    // but better to use object array for logic
    setFilterObjects(filters);
    setSelectedFilters(filterLabels);
    setIsFreeSessions(max === "0");
  }, [searchParams, categories]);

  const handleClearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="w-full space-y-3 xs:space-y-4 font-inter">
      {/* Mobile & Tablet Toggle (below md) */}
      <div className="flex w-full justify-end px-3 xs:px-4 sm:px-6 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-1.5 xs:gap-2 rounded-full border-gray-200 bg-white px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-6 text-xs xs:text-sm font-bold text-[#1a1a1a] shadow-lg shadow-black/5 hover:bg-gray-50 transition-all active:scale-95"
            >
              <Filter size={16} className="xs:size-[18px] text-[#1B8A8E]" strokeWidth={2.5} />
              Filters
              {filterObjects.length > 0 && (
                <span className="ml-0.5 xs:ml-1 flex h-5 xs:h-6 w-5 xs:w-6 items-center justify-center rounded-full bg-[#1B8A8E] text-[10px] xs:text-[11px] font-bold text-white shadow-md shadow-[#1B8A8E]/20">
                  {filterObjects.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col p-0 w-[90vw] xs:w-[320px] sm:w-[380px] md:w-[400px] bg-white border-l shadow-2xl">
            <SheetHeader className="px-4 xs:px-5 sm:px-6 pt-4 xs:pt-5 sm:pt-6 pb-3 xs:pb-4 border-b flex flex-row items-center justify-between gap-2">
              <SheetTitle className="text-lg xs:text-xl font-bold text-[#1a1a1a] truncate">Filters</SheetTitle>
              <SheetClose className="rounded-full p-1.5 xs:p-2 hover:bg-gray-100 transition-colors flex-shrink-0">
                <X size={18} className="xs:size-5 text-gray-500" />
              </SheetClose>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 xs:px-5 sm:px-6 py-6 xs:py-7 sm:py-8 space-y-8 xs:space-y-9 sm:space-y-10">
              {/* Active Filters (Mobile Only) */}
              {filterObjects.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-[#1B8A8E]">
                      Active Filters
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filterObjects.map((filter) => (
                      <Badge
                        key={`mob-badge-${filter.key}-${filter.value || ""}`}
                        variant="secondary"
                        className="flex items-center gap-1.5 border-none bg-[#1B8A8E]/10 px-3 py-1.5 text-[11px] font-semibold text-[#1B8A8E]"
                      >
                        {filter.label}
                        <X
                          size={12}
                          className="cursor-pointer hover:text-red-500 transition-colors"
                          onClick={() => removeFilter(filter.key, filter.value)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Category */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#555555]">
                  Categories
                </h3>
                <div className="flex flex-col gap-1">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-all active:scale-[0.98] hover:bg-gray-50"
                    >
                      <Checkbox
                        id={`mob-cat-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => {
                          const next = selectedCategories.includes(category.id)
                            ? selectedCategories.filter((id) => id !== category.id)
                            : [...selectedCategories, category.id];
                          updateURLParams({ categoryId: next });
                        }}
                      />
                      <label 
                        htmlFor={`mob-cat-${category.id}`}
                        className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trimester */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#555555]">
                  Trimester
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {["FIRST", "SECOND", "THIRD"].map((tri) => (
                    <Button
                      key={tri}
                      variant={selectedTrimester === tri ? "default" : "outline"}
                      size="small"
                      className={cn(
                        "rounded-full px-5 py-2 h-auto text-xs font-semibold transition-all active:scale-95",
                        selectedTrimester === tri 
                          ? "bg-[#1B8A8E] text-white shadow-md shadow-[#1B8A8E]/20" 
                          : "border-gray-200 text-gray-600 bg-white"
                      )}
                      onClick={() =>
                        updateURLParams({
                          trimester: tri === selectedTrimester ? null : tri,
                        })
                      }
                    >
                      {tri}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#555555]">
                  Price Range
                </h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                    <Input
                      placeholder="Min"
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="h-11 pl-7 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-[#1B8A8E]"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                    <Input
                      placeholder="Max"
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="h-11 pl-7 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-[#1B8A8E]"
                    />
                  </div>
                </div>
                <Button
                  size="small"
                  className="w-full bg-[#1B8A8E] h-11 rounded-xl font-bold shadow-lg shadow-[#1B8A8E]/10 transition-all active:scale-[0.98]"
                  onClick={() => updateURLParams({ minPrice, maxPrice })}
                >
                  Apply Price
                </Button>
              </div>

              {/* Date */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#555555]">
                  Session Date
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 ml-1">START DATE</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-11 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-[#1B8A8E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 ml-1">END DATE</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-11 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-[#1B8A8E]"
                    />
                  </div>
                  <Button
                    size="small"
                    className="w-full bg-[#1B8A8E] h-11 rounded-xl font-bold mt-2 shadow-lg shadow-[#1B8A8E]/10 transition-all active:scale-[0.98]"
                    onClick={() => updateURLParams({ startDate, endDate })}
                  >
                    Set Date Range
                  </Button>
                </div>
              </div>

              {/* Sort */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-[#888888]">
                  Sort By
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { v: "price-asc", l: "Price: Low to High" },
                    { v: "price-desc", l: "Price: High to Low" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-4 py-3.5 transition-all active:scale-[0.98]",
                        sortBy === opt.v 
                          ? "bg-[#1B8A8E]/5 border-[#1B8A8E] border ring-1 ring-[#1B8A8E]" 
                          : "bg-gray-50 border-transparent border hover:bg-gray-100"
                      )}
                      onClick={() => updateURLParams({ sortBy: opt.v })}
                    >
                      <span className={cn(
                        "text-sm font-semibold",
                        sortBy === opt.v ? "text-[#1B8A8E]" : "text-gray-700"
                      )}>{opt.l}</span>
                      {sortBy === opt.v && (
                        <div className="h-5 w-5 rounded-full bg-[#1B8A8E] flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Free Toggle */}
              <div className="flex items-center justify-between rounded-2xl bg-[#1B8A8E]/5 p-5 border border-[#1B8A8E]/10">
                <div>
                  <h3 className="text-sm font-bold text-[#1B8A8E]">Free Sessions Only</h3>
                  <p className="text-xs text-gray-500/80 mt-0.5">Show only free courses</p>
                </div>
                <FilterToggle
                  label=""
                  enabled={isFreeSessions}
                  onClick={() =>
                    updateURLParams({
                      maxPrice: isFreeSessions ? null : "0",
                      minPrice: null,
                    })
                  }
                />
              </div>
            </div>

            <div className="px-4 xs:px-5 sm:px-6 py-4 xs:py-5 sm:py-6 border-t bg-white shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-red-100 text-red-500 font-bold hover:bg-red-50 hover:text-red-600 transition-all active:scale-[0.98]"
                onClick={() => {
                  handleClearFilters();
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop/Tablet Bar (md and above) */}
      <div className="hidden w-full justify-center px-4 md:flex">
        <div
          className="
          flex flex-wrap items-center justify-center shadow-sm
          md:max-w-fit
          bg-[#EEEEEE] 
          rounded-3xl md:rounded-full 
          px-[clamp(1rem,3vw,1.75rem)] py-[clamp(0.6rem,1.5vw,1rem)] 
          gap-x-[clamp(1rem,4vw,2rem)] gap-y-3 sm:gap-y-4
        "
        >
          {/* Category Dropdown */}
          <div className="flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 text-xs sm:text-sm font-medium text-black hover:text-gray-600">
                  Category {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                  <ChevronDown size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-white p-4">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => {
                          const next = selectedCategories.includes(category.id)
                            ? selectedCategories.filter(id => id !== category.id)
                            : [...selectedCategories, category.id];
                          updateURLParams({ categoryId: next });
                        }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Trimester Dropdown */}
          <div className="flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 text-xs font-medium text-black hover:text-gray-600 sm:text-sm">
                  Trimester
                  <ChevronDown size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 bg-white p-2">
                {["FIRST", "SECOND", "THIRD"].map((tri) => (
                  <div 
                    key={tri} 
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => updateURLParams({ trimester: tri === selectedTrimester ? null : tri })}
                  >
                    <Checkbox checked={selectedTrimester === tri} />
                    <span className="text-sm">{tri}</span>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          {/* Price Range */}
          <div className="flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 text-xs font-medium text-black hover:text-gray-600 sm:text-sm">
                  Price
                  <ChevronDown size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-white p-4">
                <div className="flex gap-2 mb-4">
                  <Input placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                  <Input placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                </div>
                <Button className="w-full" onClick={() => updateURLParams({ minPrice, maxPrice })}>Apply</Button>
              </PopoverContent>
            </Popover>
          </div>

          {/* Date Range */}
          <div className="flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 text-xs font-medium text-black hover:text-gray-600 sm:text-sm">
                  Date
                  <ChevronDown size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-white p-4 space-y-3">
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <Button className="w-full" onClick={() => updateURLParams({ startDate, endDate })}>Apply</Button>
              </PopoverContent>
            </Popover>
          </div>

          {/* Sort By */}
          <div className="flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 text-xs font-medium text-black hover:text-gray-600 sm:text-sm">
                  Sort
                  <ChevronDown size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 bg-white p-2">
                {[{v: "price-asc", l: "Low to High"}, {v: "price-desc", l: "High to Low"}].map((opt) => (
                  <div 
                    key={opt.v} 
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer text-sm"
                    onClick={() => updateURLParams({ sortBy: opt.v })}
                  >
                    <Checkbox checked={sortBy === opt.v} />
                    {opt.l}
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          {/* Free Sessions Toggle */}
          <div className="flex items-center">
            <FilterToggle
              label="Free"
              enabled={isFreeSessions}
              onClick={() =>
                updateURLParams({
                  maxPrice: isFreeSessions ? null : "0",
                  minPrice: null,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* FILTERS APPLIED SECTION (Desktop/Tablet only) */}
      {filterObjects.length > 0 && (
        <div className="hidden md:block mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-12">
          <div className="rounded-xl border border-gray-100 bg-white p-[clamp(1rem,2vw,1.5rem)] shadow-sm md:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="flex flex-wrap gap-2">
                {filterObjects.map((filter) => (
                  <Badge
                    key={`${filter.key}-${filter.value || ""}`}
                    variant="secondary"
                    className="flex items-center gap-1 border-none bg-gray-50 px-3 py-1 text-xs text-gray-700"
                  >
                    {filter.label}
                    <X
                      size={12}
                      className="cursor-pointer hover:text-black"
                      onClick={() => removeFilter(filter.key, filter.value)}
                    />
                  </Badge>
                ))}
              </div>
              <Button
                variant="ghost"
                size="small"
                onClick={handleClearFilters}
                className="w-fit text-red-500 hover:bg-red-50 hover:text-red-700"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Divider = ({ className }: { className?: string }) => (
  <span className={`mx-4 h-6 w-px bg-gray-300 ${className}`} />
);

const FilterToggle = ({ label, enabled, onClick }: { label: string; enabled: boolean; onClick: () => void }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs sm:text-sm font-medium text-black">{label}</span>
    <button
      onClick={onClick}
      className={`relative h-5 w-9 rounded-full transition-colors ${enabled ? "bg-green-600" : "bg-gray-400"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${enabled ? "left-4" : "left-1"}`} />
    </button>
  </div>
);