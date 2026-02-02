"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
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

  const updateURLParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") params.delete(key);
        else if (Array.isArray(value)) value.length ? params.set(key, value.join(",")) : params.delete(key);
        else params.set(key, value);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, searchParams, router]
  );

  useEffect(() => {
    const filters: string[] = [];
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

    if (categoryIds.length > 0) filters.push(`Categories: ${categoryIds.length}`);
    if (trimester) filters.push(`Tri: ${trimester}`);
    if (min || max) filters.push(`Price Range`);
    if (sort) filters.push(`Sorted`);
    
    setSelectedFilters(filters);
    setIsFreeSessions(max === "0");
  }, [searchParams]);

  const handleClearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="w-full space-y-4 font-inter">
      {/* Breakpoints strategy:
          - Default: mobile stack
          - min-[425px]: 2-column grid layout
          - lg (1024px): Single line horizontal bar
          - 2xl (1440px+): Wider padding and capped width
      */}
      <div className="flex justify-center w-full px-4">
        <div className="
          w-full max-w-full lg:max-w-fit
          bg-[#EEEEEE] 
          rounded-2xl lg:rounded-full 
          px-4 py-4 lg:px-8 lg:py-3 
          grid grid-cols-2 min-[425px]:grid-cols-3 lg:flex lg:items-center 
          gap-4 lg:gap-0 
          shadow-sm
        ">
          
          {/* Category Dropdown */}
          <div className="flex justify-center lg:block">
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

          <Divider className="hidden lg:block" />

          {/* Trimester Dropdown */}
          <div className="flex justify-center lg:block">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 text-xs sm:text-sm font-medium text-black hover:text-gray-600">
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

          <Divider className="hidden lg:block" />

          {/* Price Range */}
          <div className="flex justify-center lg:block">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 text-xs sm:text-sm font-medium text-black hover:text-gray-600">
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

          <Divider className="hidden lg:block" />

          {/* Date Range */}
          <div className="flex justify-center lg:block">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 text-xs sm:text-sm font-medium text-black hover:text-gray-600">
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

          <Divider className="hidden lg:block" />

          {/* Sort By */}
          <div className="flex justify-center lg:block">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 text-xs sm:text-sm font-medium text-black hover:text-gray-600">
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

          <Divider className="hidden lg:block" />

          {/* Free Sessions Toggle */}
          <div className="flex justify-center lg:block col-span-full min-[425px]:col-auto mt-2 min-[425px]:mt-0">
            <FilterToggle
              label="Free"
              enabled={isFreeSessions}
              onClick={() => updateURLParams({ maxPrice: isFreeSessions ? null : "0", minPrice: null })}
            />
          </div>
        </div>
      </div>

      {/* FILTERS APPLIED SECTION */}
      {selectedFilters.length > 0 && (
        <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-12">
          <div className="rounded-xl border border-gray-100 bg-white p-4 md:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {selectedFilters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1 text-xs flex items-center gap-1 bg-gray-50 text-gray-700 border-none">
                    {filter}
                    <X size={12} className="cursor-pointer hover:text-black" />
                  </Badge>
                ))}
              </div>
              <Button variant="ghost" size="small" onClick={handleClearFilters} className="text-red-500 hover:text-red-700 hover:bg-red-50 w-fit">
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