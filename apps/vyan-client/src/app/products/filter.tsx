"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import React, { useEffect, useState, useCallback } from "react";
import { Checkbox } from "@repo/ui/src/@/components/checkbox";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@repo/ui/src/@/components/button";

interface IProductsProps {
  categories: {
    id: string;
    name: string;
    childCategories: {
      id: string;
      name: string;
    }[];
  }[];
}

const Filter = ({ categories }: IProductsProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [categoriesArray, setCategoriesArray] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("");

  const updateURLParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) params.delete(key);
        else if (Array.isArray(value)) {
          value.length ? params.set(key, value.join(",")) : params.delete(key);
        } else params.set(key, value);
      });
      window.history.pushState(null, "", `${pathname}?${params.toString()}`);
    },
    [pathname, searchParams]
  );

  const toggleCategorySelection = (checkedState: boolean, id: string) => {
    const newCategories = checkedState
      ? [...categoriesArray, id]
      : categoriesArray.filter((item) => item !== id);
    setCategoriesArray(newCategories);
    updateURLParams({ category: newCategories });
  };

  const handlePriceChange = (type: "min" | "max", value: string) => {
    if (type === "min") {
      setMinValue(value);
      updateURLParams({ minValue: value || null });
    } else {
      setMaxValue(value);
      updateURLParams({ maxValue: value || null });
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateURLParams({ sortBy: value });
  };

  const handleClearFilters = () => {
    setMinValue("");
    setMaxValue("");
    setCategoriesArray([]);
    setSortBy("");
    window.history.pushState(null, "", pathname);
  };

  // Sync filter state with URL parameters
  useEffect(() => {
    setMinValue(searchParams.get("minValue") || "");
    setMaxValue(searchParams.get("maxValue") || "");
    setCategoriesArray(searchParams.get("category") ? searchParams.get("category")!.split(",") : []);
    setSortBy(searchParams.get("sortBy") || "");
  }, [searchParams]);

  const hasActiveFilters = minValue || maxValue || categoriesArray.length > 0 || sortBy;

  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6 w-full">
        {/* Select Categories */}
        <div>
          <div className="mb-[6px] font-inter text-base font-medium">
            Select Categories
          </div>
          <Select>
            <SelectTrigger className="border-[#4d4d4d66] py-2 px-4 font-inter text-base font-normal text-inactive md:w-[150px] lg:w-[180px] xl:w-[204px] 2xl:text-base">
              <SelectValue placeholder="Select Value" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectGroup>
                {categories.map((category) => (
                  <div key={category.id}>
                    <div className="px-2 py-1 font-medium">{category.name}</div>
                    {category.childCategories.map((childCategory) => (
                      <div
                        key={childCategory.id}
                        className="flex items-center gap-2 px-4 py-1"
                      >
                        <Checkbox
                          checked={categoriesArray.includes(childCategory.id)}
                          onCheckedChange={(checked: boolean | "indeterminate") =>
                            toggleCategorySelection(checked as boolean, childCategory.id)
                          }
                        />
                        <span>{childCategory.name}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="w-full">
          <div className="mb-[6px] font-inter text-base font-medium text-active">
            Price Range
          </div>
          <div className="flex xs:gap-1 sm:gap-2  gap-3 items-center flex-wrap w-full">
            <input
              className="border border-[#4d4d4d66] text-inactive rounded-md px-4 py-2 xs:w-[130px] sm:w-[150px] "
              placeholder="Min Value"
              type="number"
              value={minValue}
              onChange={(e) => handlePriceChange("min", e.target.value)}
            />
            <span>-</span>
            <input
              className="border border-[#4d4d4d66] text-inactive rounded-md px-4 py-2  xs:w-[130px] sm:w-[150px] "
              placeholder="Max Value"
              type="number"
              value={maxValue}
              onChange={(e) => handlePriceChange("max", e.target.value)}
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filter;
