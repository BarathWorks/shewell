"use client";

import { Button } from "@repo/ui/src/@/components/button";
import { Checkbox } from "@repo/ui/src/@/components/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

interface IFilterProps {
  Filter: {
    value: string;
    title: string;
  }[];
  onSelectSpecialization: (selectedValue: string) => void;
  defaultValue: string;
  onSelectLanguage: (selectedValue: string[]) => void;
}
const SelectFilter = ({
  Filter,
  onSelectSpecialization,
  onSelectLanguage,
  defaultValue,
}: IFilterProps) => {
  const [languageIdsArray, setLanguageIdsArray] = useState<string[]>([]);

  const handleItemClick = (selectedValue: string) => {
    onSelectSpecialization(selectedValue);
  };

  const handleLanguageChange = (checked: boolean, id: string) => {
    setLanguageIdsArray((prevArray) =>
      checked ? [...prevArray, id] : prevArray.filter((item) => item !== id),
    );
    onSelectLanguage(languageIdsArray);
  };
  useEffect(() => {
   
    onSelectLanguage(languageIdsArray);
  }, [languageIdsArray]);
  const { data } = api.searchLanguages.searchLanguage.useQuery();
  const defaultTitle =
    Filter.find((item) => item.value === defaultValue)?.title ||
    "Select Specialization";

  const handleClearFilters = () => {
    onSelectSpecialization("");
    onSelectLanguage([]);
  };
  return (
    <>
      <div className="flex flex-col items-center gap-4  lg:flex-row ">
        <div className=" flex w-full flex-col gap-[6px]">
          <div className="w-full font-inter font-normal text-active xs:text-sm sm:text-base">
            Select Specialization
          </div>
          <Select defaultValue={defaultValue} onValueChange={handleItemClick}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="Select Languages">{defaultTitle}</SelectValue>
            </SelectTrigger>
            <SelectContent className="w-full bg-white">
              {Filter &&
                Filter.map((item, index) => {
                  return (
                    <>
                      <SelectItem
                        key={index}
                        value={item.value}
                        // onChange={() => handleItemClick(item.value)}
                      >
                        {item.title}
                      </SelectItem>
                    </>
                  );
                })}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-full flex-col gap-[6px]">
          <div className="w-full font-inter font-normal text-active xs:text-sm md:text-base">
            Select Languages
          </div>

          <Select>
            <SelectTrigger className=" w-full lg:w-[180px]">
              <SelectValue placeholder="Select Languages" />
              <SelectContent className="w-full bg-white">
                <SelectGroup>
                  {data?.languages.map((language) => (
                    <div key={language.id}>
                      <Checkbox
                        checked={languageIdsArray.includes(language.id)}
                        onCheckedChange={(checked: boolean | "indeterminate") =>
                          handleLanguageChange(Boolean(checked), language.id)
                        }
                      />{" "}
                      {language.language}
                    </div>
                  ))}
                </SelectGroup>
              </SelectContent>
            </SelectTrigger>
          </Select>
        </div>
        <div className="self-end">
          <Button
            onClick={() => handleClearFilters()}
            className="bg-primary hover:bg-secondary"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </>
  );
};
export default SelectFilter;
