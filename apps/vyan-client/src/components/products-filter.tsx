"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import { Checkbox } from "@repo/ui/src/@/components/checkbox";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface ITrigger {
  placeholder: string;
}
interface IProductsProps {
  name: ITrigger;
  categories: {
    id: string;
    name: string;
    childCategories: {
      id: string;
      name: string;
      childCategories: {
        id: string;
        name: string;
        checked: boolean;
      }[];
    }[];
  }[];
}

const ProductsFilter = ({ categories, name }: IProductsProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  

  const categoriesArray = searchParams.get("category")?.split(',') ?? []
  


  const toggleCategorySelection = (
    checkedState: string | boolean,
    id: string,
  ) => {
    if (checkedState) {
        const newArray = [...categoriesArray, id];
        updateURL(newArray);
    } else {
        const newArray = categoriesArray.filter((item) => item !== id);
        updateURL(newArray);
    }
  };

  const updateURL = (categories: string[]) => {
    const params = new URLSearchParams(searchParams);
    if (categories.length > 0) {
      params.set("category", categories.join(","));
    } else {
      params.delete("category");
    }
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
  };

  return (
    <>
      <Select>
        <SelectTrigger className="border-inactive font-inter text-sm font-normal text-inactive md:w-[150px] lg:w-[180px] xl:w-[204px] 2xl:text-base">
          <SelectValue className="" placeholder={name.placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectGroup>
            {categories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                {category.childCategories?.length > 0 &&
                  category.childCategories.map((item, index) => (
                    <div key={index}>
                      <div>{item.name}</div>
                      {item.childCategories.length > 0 &&
                        item.childCategories.map((childCategory, childCategoryIndex) => (
                          <div key={childCategoryIndex} className="flex items-center gap-2 px-2 py-1">
                            <Checkbox
                              checked={categoriesArray.includes(childCategory.id)}
                              onCheckedChange={(checkedState: boolean | "indeterminate") => {
                                toggleCategorySelection(
                                  checkedState,
                                  childCategory.id,
                                );
                              }}
                            />
                            <span>{childCategory.name}</span>
                          </div>
                        ))}
                    </div>
                  ))}
              </div>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
};

export default ProductsFilter;