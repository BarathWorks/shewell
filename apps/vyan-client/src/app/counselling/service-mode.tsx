"use client";

import { Button } from "@repo/ui/src/@/components/button";
import {
  RadioGroup,
  RadioGroupItem,
} from "@repo/ui/src/@/components/radio-group";
import { useState } from "react";
import { AppointmentType } from "@repo/database";

interface IServiceModeProps {
  onOptionSelect: (value: IServiceModeDetails) => void;
  isActive: boolean;
  onNextStep: () => void;
  priceInCentsForSingle: number;
}

interface IServiceModeDetails {
  type: AppointmentType;
  price: number;
  description: string;
  planName: string;
}

const ServiceMode = ({
  onOptionSelect,
  isActive,
  onNextStep,
  priceInCentsForSingle,
}: IServiceModeProps) => {
  const serviceModeDetailsMap = [
    {
      type: AppointmentType.ONLINE,
      price: priceInCentsForSingle,
      description:
        "Online (Virtual appointment) with doctor through Google Meet or Zoom.",
      planName: "Basic Plan",
    },
    {
      type: AppointmentType.OFFLINE,
      price: 5000,
      description:
        "User can access to offline appointment for counseling at the doctor clinic.",
      planName: "Basic Plan",
    },
  ];
  const [selectedOption, setSelectedOption] = useState<AppointmentType>(
    AppointmentType.ONLINE,
  );

  const handleChange = (value: AppointmentType) => {
    setSelectedOption(value);
    const serviceModeDetails = serviceModeDetailsMap.find(
      (details) => details.type === value,
    );
    if (serviceModeDetails) {
      onOptionSelect(serviceModeDetails);
    }
    // const serviceModeDetails = serviceModeDetailsMap[value];
    // onOptionSelect(serviceModeDetails!);
  };

  return (
    <>
      <RadioGroup
        onValueChange={handleChange}
        className="flex flex-col gap-8 sm:gap-10 md:gap-12 px-2 sm:px-3 md:px-[10px]"
      >
        {serviceModeDetailsMap.map((details, index) => (
          <div
            key={details.type}
            className="flex w-full flex-col rounded-lg sm:rounded-lg md:rounded-[8px] border"
          >
            <div
              className={`border-b ${selectedOption === details.type ? "bg-[#EBF8F9]" : ""}`}
            >
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-[26px] py-3 sm:py-4 md:py-[22px]">
                <RadioGroupItem
                  value={details.type}
                  // value={selectedOption}
                  checked={selectedOption === details.type}
                  // checked={selectedOption === AppointmentType.ONLINE}
                  id={`radio-${details.type}`}
                  disabled={details.type === AppointmentType.OFFLINE} // Disable the offline appointment
                />
                <div className="font-inter text-xs sm:text-sm md:text-base font-medium text-[#344054]">
                  {details.type === AppointmentType.ONLINE
                    ? "Online Appointment"
                    : "Offline Appointment"}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-center gap-3 sm:gap-4 md:gap-3 p-3 sm:p-4 md:p-4 lg:flex-row lg:justify-between">
              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2">
                    <div className="block bg-secondary-50 p-1.5 sm:p-2 font-inter text-sm sm:text-lg md:text-xl font-medium text-secondary lg:hidden">
                      {details.planName}
                    </div>
                    <div
                      className={`font-inter text-lg sm:text-2xl md:text-[30px] font-semibold leading-tight sm:leading-[38px] ${selectedOption === details.type ? "text-primary" : "text-[#656D78]"}`}
                    >
                      INR {details.price}
                      <span
                        className={`text-xs sm:text-sm font-normal ${selectedOption === details.type ? "text-black" : "text-muted"}`}
                      >
                        {" "}
                        per user
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`text-xs sm:text-sm font-normal ${selectedOption === details.type ? "text-black" : "text-muted"}`}
                >
                  {details.description}
                </div>
              </div>
              <div className="hidden min-w-[120px] sm:min-w-[134px] bg-secondary-50 p-1.5 sm:p-2 font-inter text-lg md:text-xl font-medium text-secondary lg:block">
                {details.planName}
              </div>
            </div>
          </div>
        ))}
      </RadioGroup>
      <div className="mr-2 sm:mr-3 md:mr-[10px] mt-4 sm:mt-5 flex justify-end">
        <Button
          className="self-end rounded-md bg-secondary px-5 sm:px-6 md:px-[30px] py-1.5 sm:py-2 font-inter text-xs sm:text-sm md:text-base font-medium hover:bg-secondary"
          onClick={onNextStep}
          disabled={!isActive}
        >
          Next
        </Button>
      </div>
    </>
  );
};

export default ServiceMode;
