'use client';

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface IStepperProps {
  steps: { title: string }[];
  setStep: (step: number) => void;
}

const Stepper = ({ steps, setStep }: IStepperProps) => {
  const stepPercentage = 100 / steps.length;
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initialize currentStep from URL or default to 1
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const stepFromUrl = parseInt(searchParams?.get("currentStep") || "1", 10);
    return stepFromUrl >= 1 && stepFromUrl <= steps.length ? stepFromUrl : 1;
  });

  // Update URL when currentStep changes
  const updateUrl = (step: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("currentStep", step.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSetStep = (step: number) => {
    setCurrentStep(step);
    setStep(step);
    updateUrl(step);
  };

  // Sync currentStep with the URL query parameter on load
  useEffect(() => {
    const stepFromUrl = parseInt(searchParams?.get("currentStep") || "1", 10);
    if (stepFromUrl !== currentStep && stepFromUrl >= 1 && stepFromUrl <= steps.length) {
      setCurrentStep(stepFromUrl);
    }
  }, [searchParams, currentStep, steps.length]);

  return (
    <div className="relative flex flex-col gap-8 sm:gap-10 md:gap-12 lg:gap-[47px]">
      <div className="absolute left-3 sm:left-4 md:left-[14px] top-3 sm:top-4 md:top-[15px] h-full w-0.5 bg-gray-200">
        {/* Background line */}
      </div>
      <div
        className="absolute left-3 sm:left-4 md:left-[14px] top-3 sm:top-4 md:top-[15px] w-0.5 bg-primary transition-all duration-300"
        style={{ height: `${stepPercentage * (currentStep - 1)}%` }}
      >
        {/* Progress line */}
      </div>
      {steps.map((item, index) => (
        <div key={index} className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
          <div
            className={`relative z-10 flex items-center justify-center rounded-full border-2 px-1.5 sm:px-2 md:px-3 text-xs sm:text-sm md:text-base font-medium w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 border-hairline text-gray-500 ${
              currentStep > index + 1
                ? "border-primary bg-primary text-white"
                : "bg-white"
            }`}
          >
            {currentStep > index + 1 ? <span>&#10003;</span> : index + 1}
          </div>
          <div
            onClick={() => {
              if (index < currentStep - 1) {
                handleSetStep(index + 1);
              }
            }}
            className={`cursor-pointer font-poppins text-xs sm:text-sm md:text-base font-medium text-[#656D78] ${
              index < currentStep - 1 ? "" : "cursor-not-allowed"
            }`}
          >
            {item.title}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stepper;
