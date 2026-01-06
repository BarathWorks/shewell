"use client";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/src/@/components/dialog";
import { Calendar } from "@repo/ui/src/@/components/calendar";
import Multiselect from "multiselect-react-dropdown";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@repo/ui/src/@/components/checkbox";
import { format } from "date-fns";
import { Button } from "@repo/ui/src/@/components/button";
interface ILanguageProps {
  id: string;
  language: string;
}
const CounsellingFilter = ({
  onSelectSpecialisation,
  onSelectDate,
}: {
  onSelectSpecialisation: (value: string) => void;
  onSelectDate: (value: Date) => void;
}) => {
  const [languageDialog, setLanguageDialog] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const router = useRouter();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);

  const handleSpecialisationChange = (value: string) => {
    params.set("specialisationId", value);
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
    onSelectSpecialisation(value);
  };

  const handleDateSelect = (value: Date) => {
    params.set("selectedDate", value.toDateString());
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
    onSelectDate(value);
  };

  const handleTimeChange = (value: string) => {
    params.set("time", value);
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
  };
  // state to store selected specialisation
  // const [selectedSpecialisation, setSelectedSpecialisation] =
  //   useState<string>();

  const time = searchParams.get("time") as string;
  const getLanguageIds = searchParams.get("languageId") as string;
  const [languageIdArray, setLanguageIdArray] = useState<string[]>(
    getLanguageIds ? getLanguageIds.split(",") : [],
  );

  const handleLanguageChange = (checked: boolean, id: string) => {
    setLanguageIdArray((prevArray) =>
      checked ? [...prevArray, id] : prevArray.filter((item) => item !== id),
    );
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (languageIdArray.length) {
      params.set("languageId", languageIdArray.join(","));
    } else {
      params.delete("languageId");
    }
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
  }, [languageIdArray]);

  const getSpecialisationId = searchParams.get("specialisationId") as string;
  // state to store selected date
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchTherapist, setSearchTherapist] = useState<string>("");

  const handleSearch = () => {
    if (searchTherapist.trim()) {
      params.set("therapistSearch", searchTherapist.trim());
    } else {
      params.delete("therapistSearch");
    }
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
  };

 

  // getting today's date
  const today = new Date();
  // set time to start of the day so that time will not create issue because we only want to compare the days
  today.setHours(0, 0, 0, 0);
  // setting matcher , before comes from react daypicker library which gives all the day before the particular date
  const disabledDays = { before: today };
  // fetch specialisations
  const { data: specialisations } =
    api.searchSpecialization.searchSpecialization.useQuery();

  // converting specialisation from {id, specialisation} to {value, label}
  const formatSpecialisation = specialisations?.specializations.map((a) => ({
    value: a.id,
    label: a.specialization,
  }));

  const { data: languages } = api.searchLanguages.searchLanguage.useQuery();
  // router.push(`?specialisationId=${}&date=${}`)

  const handleClearFilters = () => {
    // Clear the specific parameters
    params.delete("languageId"), params.delete("specialisationId");
    params.delete("selectedDate");
    params.delete("therapistSearch");

    // Update the URL with the cleared query params
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
   

    setLanguageIdArray([]);
    setSelectedDate(undefined);
    onSelectSpecialisation("");
    setSearchTherapist("");
  };
  return (
    <>
      <div className="flex flex-col gap-[30px] md:gap-8 xl:gap-[40px] 2xl:gap-[45px]">
        <div className="flex flex-col  gap-6  md:flex-row md:gap-[186px] xl:gap-[332px] 2xl:gap-[772px]">
          {/* search by therapist */}
          <div className="w-full">
            <label
              className="mb-[6px] block w-full font-inter text-sm font-medium"
              htmlFor="therapist"
            >
              Search
            </label>
            <div className="flex w-full  gap-2">
              <input
                value={searchTherapist}
                onChange={(e) => setSearchTherapist(e.target.value)}
                className="w-full rounded-md border border-border-400 px-3 py-2 font-inter text-sm font-medium outline-none placeholder:font-inter placeholder:text-sm placeholder:font-medium hover:border-primary   hover:placeholder:content-none"
                placeholder="Search by therapist"
                type="text"
                name="therapist"
              />

              <Button variant="search" size="small" onClick={handleSearch}>
                <svg
                  className="mr-[2px] xl:mr-2"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <ellipse
                    cx="8.70434"
                    cy="8.64155"
                    rx="7.59325"
                    ry="7.53022"
                    stroke="white"
                    stroke-width="1.20637"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M13.9958 15.1387L17.7772 18.8887"
                    stroke="white"
                    stroke-width="1.20637"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                Search
              </Button>
            </div>
          </div>

          {/* sort by price */}
          <div className="w-full md:basis-1/3">
            <div className="flex items-end gap-5 xl:gap-6">
              <svg
                className="inline"
                width="38"
                height="39"
                viewBox="0 0 38 39"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M29.0798 1.80357H8.92019C4.979 1.80357 1.78404 4.99853 1.78404 8.93972V29.0993C1.78404 33.0406 4.979 36.2355 8.92019 36.2355H29.0798C33.021 36.2355 36.216 33.0406 36.216 29.0993V8.93972C36.216 4.99853 33.021 1.80357 29.0798 1.80357ZM8.92019 0.0195312C3.9937 0.0195312 0 4.01323 0 8.93972V29.0993C0 34.0258 3.9937 38.0195 8.92019 38.0195H29.0798C34.0063 38.0195 38 34.0258 38 29.0993V8.93972C38 4.01323 34.0063 0.0195312 29.0798 0.0195312H8.92019Z"
                  fill="#181818"
                />
                <path
                  d="M11.5962 10.1889C11.5962 9.69623 11.9955 9.29688 12.4882 9.29688H30.1502C30.6428 9.29688 31.0422 9.69623 31.0422 10.1889C31.0422 10.6816 30.6428 11.0809 30.1502 11.0809H12.4882C11.9955 11.0809 11.5962 10.6816 11.5962 10.1889Z"
                  fill="#181818"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M10.1693 11.616C10.9576 11.616 11.5965 10.9771 11.5965 10.1888C11.5965 9.40053 10.9576 8.76158 10.1693 8.76158C9.381 8.76158 8.74205 9.40053 8.74205 10.1888C8.74205 10.9771 9.381 11.616 10.1693 11.616ZM10.1693 13.4001C11.9428 13.4001 13.3805 11.9623 13.3805 10.1888C13.3805 8.4153 11.9428 6.97754 10.1693 6.97754C8.39576 6.97754 6.95801 8.4153 6.95801 10.1888C6.95801 11.9623 8.39576 13.4001 10.1693 13.4001Z"
                  fill="#181818"
                />
                <path
                  d="M6.95801 19.0199C6.95801 18.5273 7.35736 18.1279 7.85003 18.1279H21.4979C21.9906 18.1279 22.3899 18.5273 22.3899 19.0199C22.3899 19.5126 21.9906 19.912 21.4979 19.912H7.85003C7.35736 19.912 6.95801 19.5126 6.95801 19.0199Z"
                  fill="#181818"
                />
                <path
                  d="M26.4927 19.0199C26.4927 18.5273 26.892 18.1279 27.3847 18.1279H30.15C30.6426 18.1279 31.042 18.5273 31.042 19.0199C31.042 19.5126 30.6426 19.912 30.15 19.912H27.3847C26.892 19.912 26.4927 19.5126 26.4927 19.0199Z"
                  fill="#181818"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M24.5306 20.4471C25.3189 20.4471 25.9578 19.8081 25.9578 19.0199C25.9578 18.2316 25.3189 17.5926 24.5306 17.5926C23.7423 17.5926 23.1034 18.2316 23.1034 19.0199C23.1034 19.8081 23.7423 20.4471 24.5306 20.4471ZM24.5306 22.2311C26.3041 22.2311 27.7419 20.7934 27.7419 19.0199C27.7419 17.2463 26.3041 15.8086 24.5306 15.8086C22.7571 15.8086 21.3193 17.2463 21.3193 19.0199C21.3193 20.7934 22.7571 22.2311 24.5306 22.2311Z"
                  fill="#181818"
                />
                <path
                  d="M17.0376 27.85C17.0376 27.3574 17.437 26.958 17.9296 26.958H30.1503C30.6429 26.958 31.0423 27.3574 31.0423 27.85C31.0423 28.3427 30.6429 28.742 30.1503 28.742H17.9296C17.437 28.742 17.0376 28.3427 17.0376 27.85Z"
                  fill="#181818"
                />
                <path
                  d="M6.95801 27.85C6.95801 27.3574 7.35736 26.958 7.85003 26.958H11.8641C12.3568 26.958 12.7561 27.3574 12.7561 27.85C12.7561 28.3427 12.3568 28.742 11.8641 28.742H7.85003C7.35736 28.742 6.95801 28.3427 6.95801 27.85Z"
                  fill="#181818"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M14.8075 29.2781C15.5957 29.2781 16.2347 28.6392 16.2347 27.8509C16.2347 27.0626 15.5957 26.4237 14.8075 26.4237C14.0192 26.4237 13.3802 27.0626 13.3802 27.8509C13.3802 28.6392 14.0192 29.2781 14.8075 29.2781ZM14.8075 31.0622C16.581 31.0622 18.0187 29.6244 18.0187 27.8509C18.0187 26.0774 16.581 24.6396 14.8075 24.6396C13.0339 24.6396 11.5962 26.0774 11.5962 27.8509C11.5962 29.6244 13.0339 31.0622 14.8075 31.0622Z"
                  fill="#181818"
                />
              </svg>

              <div className=" w-full">
                <div className="mb-[6px] block w-full font-inter text-sm font-medium">
                  Sort
                </div>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem className="" value="asc">
                      Low to High
                    </SelectItem>
                    <SelectItem value="desc">High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 md:flex-row   md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {/* <div>
          <Multiselect
            showCheckbox
            options={languages?.languages} // Options to display in the dropdown
            selectedValues={formattedGetLanguageIds} // Preselected value to persist in dropdown
            onSelect={handleLanguageSelect} // Function will trigger on select event
            onRemove={(removedList) =>
              handleLanguageRemove(removedList, formattedGetLanguageIds)
            } // Pass current selected languages
            displayValue="language" // Property name to display in the dropdown options
          />
        </div> */}

            {/* <div>
          <Select
            value={time || ""}
            onValueChange={(e) => {
              handleTimeChange(e);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Time" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="Morning">Morning</SelectItem>
              <SelectItem value="Afternoon">Afternoon</SelectItem>
              <SelectItem value="Evening">Evening</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Languages" />
                <SelectContent className="bg-white">
                  <SelectGroup>
                    {languages?.languages.map((language) => (
                      <div key={language.id}>
                        <Checkbox
                          checked={languageIdArray.includes(language.id)}
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
            {/* <div className="font-inter text-base font-medium">Select Languages</div> */}
            {/* {languages?.languages.map((language) => (
          <div key={language.id}>
            <Checkbox
              checked={languageIdArray.includes(language.id)}
              onCheckedChange={(checked) =>
                handleLanguageChange(Boolean(checked), language.id)
              }
            />
            {language.language}
          </div>
        ))} */}
            <div>
              <Select
                // value={selectedSpecialisation}
                value={getSpecialisationId || ""}
                onValueChange={(e) => {
                  // setSelectedSpecialisation(e),
                  handleSpecialisationChange(e);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Specialization" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {formatSpecialisation &&
                    formatSpecialisation.map((item) => {
                      return (
                        <>
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        </>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Dialog open={languageDialog} onOpenChange={setLanguageDialog}>
                <DialogTrigger className="flex items-center  gap-5 rounded-md border px-3 py-2 font-inter text-sm font-normal   text-black">
                  <div>
                    {" "}
                    {selectedDate ? format(selectedDate, "	PPP") : "Select Date"}
                  </div>
                  <div>
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1L5 5L9 1"
                        stroke="#4D4D4D"
                        stroke-width="1.33333"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <Calendar
                    disabled={disabledDays}
                    mode="single"
                    selected={date}
                    onSelect={(e) => {
                      setDate(e), handleDateSelect(e!);
                      setLanguageDialog(false);
                      setSelectedDate(e);
                    }}
                    className="rounded-md border"
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div>
            <div className="block md:hidden">
            <Button
              className="bg-primary hover:bg-secondary "
              onClick={() => handleClearFilters()}
            >
              Clear Filters
            </Button>
          </div>
            </div>
          </div>

          <div className="hidden md:block self-end">
            <Button
              className="bg-primary hover:bg-secondary"
              onClick={() => handleClearFilters()}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
export default CounsellingFilter;
