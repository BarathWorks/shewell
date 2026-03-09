"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const StepperRegister = () => {
  const params = useSearchParams();
  const [step, setStep] = useState(params.get("step") || null);

  useEffect(() => {
    const currentStep = params.get("step");
    setStep(currentStep);
  }, [params]);

  const totalSteps = 7;

  const stepLabels: Record<string, string> = {
    "1": "Account Setup",
    "2": "Personal Info",
    "3": "Address",
    "4": "Identity & Documents",
    "5": "Education",
    "6": "Practice Details",
    "7": "Bank Details",
  };

  const getStepLabel = () => {
    if (step === null) return "Account Setup";
    return stepLabels[step] || "";
  };

  const isStepActive = (stepNumber: number) => {
    if (step === null && stepNumber === 1) return true;
    return step !== null && parseInt(step) >= stepNumber;
  };

  const renderStepCircle = (stepNumber: number, isLast: boolean) => {
    const active = isStepActive(stepNumber);
    const lineActive = step !== null && parseInt(step) > stepNumber;

    return (
      <div className={isLast ? "" : "w-full"} key={stepNumber}>
        <div
          className={`flex gap-[12px] ${
            !isLast
              ? `after:absolute after:border-t-2 after:w-full ${
                  lineActive ? "after:border-secondary" : "after:border-[#B4B4B4]"
                } relative after:left-[40px] after:top-5`
              : ""
          }`}
        >
          {active ? (
            <div className="h-[40px] z-10 rounded-full border bg-secondary relative">
              <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-secondary font-inter text-[16px] font-medium text-[#FFFFFF]">
                {stepNumber}
              </div>
            </div>
          ) : (
            <div className="h-[40px] w-[40px] z-10 rounded-full bg-[#D2D2D2] relative"></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="block">
        <div className="flex justify-between w-full">
          {Array.from({ length: totalSteps }, (_, i) =>
            renderStepCircle(i + 1, i + 1 === totalSteps),
          )}
        </div>
        <div>
          <div className="my-[20px] flex flex-col gap-[6px]">
            <div className="font-inter text-base font-semibold 2xl:text-lg">
              {getStepLabel()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default StepperRegister;
