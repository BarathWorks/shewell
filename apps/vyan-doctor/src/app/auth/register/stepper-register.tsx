"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const StepperRegister = () => {
  const pathname = usePathname();
  const params = useSearchParams();
  //   const step = params.get("step");
  const [step, setStep] = useState(params.get("step") || null);

  useEffect(() => {
    const currentStep = params.get("step");
    setStep(currentStep);
  }, [params]);
  return (
    <>
      <div className="block ">
     
        <div className="  flex  justify-between w-full  ">
         <div className="w-full">
         <div
            className={`flex gap-[12px] after:absolute  after:border  after:w-full ${step && step > "1" ? "after:border-secondary" : "after:border-[#B4B4B4]"}  relative  after:top-6  after:left-[40px]`}
          >
            <div className="h-[40px] rounded-full border bg-secondary">
              <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full font-inter text-[16px] font-medium text-[#FFFFFF] ">
                1
              </div>
            </div>
          </div>
         </div>

         <div className="w-full">
         <div
            className={`flex gap-[12px] after:absolute after:w-full  after:border  ${step && step > "2" ? "after:border-secondary" : "after:border-[#B4B4B4]"}  relative after:left-[40px]  after:top-6  `}
          >
            {step && step > "1" ? (
              <div className="h-[40px] rounded-full border bg-secondary">
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-secondary font-inter text-[16px] font-medium text-[#FFFFFF]">
                  2
                </div>
              </div>
            ) : (
              <div className="h-[40px] w-[40px] rounded-full bg-[#D2D2D2]"></div>
            )}
          </div>
         </div>

         <div className="w-full">
         <div
            className={`flex gap-[12px] after:absolute  after:border after:w-full  ${step && step > "3" ? "after:border-secondary" : "after:border-[#B4B4B4]"}  relative after:left-[40px] after:top-6  `}
          >
            {step && step > "2" ? (
              <div className="h-[40px] rounded-full border bg-secondary">
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-secondary font-inter text-[16px] font-medium text-[#FFFFFF]">
                  3
                </div>
              </div>
            ) : (
              <div className="h-[40px] w-[40px] z-[1000] rounded-full bg-[#D2D2D2]"></div>
            )}
          </div>
         </div>

         <div className="w-full">
          <div
            className={`flex gap-[12px] after:absolute  after:border after:w-full  ${step && step > "4" ? "after:border-secondary" : "after:border-[#B4B4B4]"}  relative after:left-[40px] after:top-6  `}
          >
            {step && step > "3" ? (
              <div className="h-[40px] rounded-full border bg-secondary">
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-secondary font-inter text-[16px] font-medium text-[#FFFFFF]">
                  4
                </div>
              </div>
            ) : (
              <div className="h-[40px] w-[40px] z-[1000] rounded-full bg-[#D2D2D2]"></div>
            )}
          </div>
         </div>

         <div className="w-full">
          <div
            className={`flex gap-[12px] after:absolute  after:border after:w-full  ${step && step > "5" ? "after:border-secondary" : "after:border-[#B4B4B4]"}  relative after:left-[40px] after:top-6  `}
          >
            {step && step > "4" ? (
              <div className="h-[40px] rounded-full border bg-secondary">
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-secondary font-inter text-[16px] font-medium text-[#FFFFFF]">
                  5
                </div>
              </div>
            ) : (
              <div className="h-[40px] w-[40px] z-[1000] rounded-full bg-[#D2D2D2]"></div>
            )}
          </div>
         </div>

          <div className="flex  gap-[12px]">
            {step && step > "5" ? (
              <div className="h-[40px] rounded-full border bg-secondary">
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-secondary font-inter text-[16px] font-medium text-[#FFFFFF]">
                  6
                </div>
              </div>
            ) : (
              <div className="h-[40px] w-[40px] z-[1000] rounded-full bg-[#D2D2D2]"></div>
            )}
          </div>
        </div>
        <div>
          {step === null && (
            <div className="my-[20px] flex flex-col gap-[6px]">
              <div className="font-inter text-base font-semibold  2xl:text-lg">
                Personal Information
              </div>
            </div>
          )}
          {step === "2" && (
            <div className="my-[20px] flex flex-col gap-[6px]">
              <div className="font-inter text-base font-semibold  2xl:text-lg">
                Address & Identity
              </div>
            </div>
          )}
          {step === "3" && (
            <div className="my-[20px] flex flex-col gap-[6px]">
              <div className="font-inter text-base font-semibold  2xl:text-lg">
                Qualifications
              </div>
            </div>
          )}
          {step === "4" && (
            <div className="my-[20px] flex flex-col gap-[6px]">
              <div className="font-inter text-base font-semibold  2xl:text-lg">
                Modes
              </div>
            </div>
          )}

          {step === "5" && (
            <div className="my-[20px] flex flex-col gap-[6px]">
              <div className="font-inter text-base font-semibold  2xl:text-lg">
                Uploads
              </div>
            </div>
          )}

          {step === "6" && (
            <div className="my-[20px] flex flex-col gap-[6px]">
              <div className="font-inter text-base font-semibold  2xl:text-lg">
                Bank Details
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default StepperRegister;
