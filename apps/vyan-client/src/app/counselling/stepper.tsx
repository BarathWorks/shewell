import React from "react";

interface IStepperProps {
  steps: { title: string }[];
  currentStep: number;
  setStep: (step: number) => void;
}

const Stepper = ({ steps, currentStep, setStep }: IStepperProps) => {
  return (
    <>
      {/* Mobile — horizontal compact pill stepper */}
      <div className="block font-poppins lg:hidden">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-4 sm:gap-x-8">
          {steps.map((item, index) => {
            const isCompleted = currentStep > index;
            const isActive = currentStep === index;

            return (
              <div key={index} className="flex items-center gap-2">
                {/* Step node */}
                <div
                  onClick={() => {
                    if (index < currentStep) setStep(index + 1);
                  }}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? "cursor-pointer bg-[#006879] text-white shadow-sm"
                      : isActive
                        ? "border-2 border-[#006879] bg-[#eff4ff] text-[#006879] shadow-sm font-bold"
                        : "border-2 border-[#c0c8cc] bg-white text-[#c0c8cc]"
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>

                {/* Step label — only show for active */}
                {isActive && (
                  <span className="text-sm font-bold text-[#0b1c30]">
                    {item.title}
                  </span>
                )}

                {/* Connector line between steps */}
                {index < steps.length - 1 && !isActive && (
                  <div
                    className={`h-[2px] w-6 shrink-0 rounded-full sm:w-8 ${isCompleted ? "bg-[#006879]" : "bg-[#c0c8cc]/30"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop — vertical sidebar stepper */}
      <div className="hidden font-poppins lg:block">
        <div className="relative flex flex-col pt-6">
          {steps.map((item, index) => {
            const isCompleted = currentStep > index;
            const isActive = currentStep === index;

            return (
              <div key={index} className="relative flex items-start gap-4">
                {/* Vertical connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[17px] top-9 z-0 h-10 w-[2px] rounded-full bg-[#c0c8cc]/20">
                    <div
                      className="h-full rounded-full bg-[#006879] transition-all duration-500"
                      style={{ height: isCompleted ? "100%" : "0%" }}
                    />
                  </div>
                )}

                {/* Step circle */}
                <div
                  onClick={() => {
                    if (index < currentStep) setStep(index + 1);
                  }}
                  className={`relative z-10 mb-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? "cursor-pointer border-[#006879] bg-[#006879] text-white shadow-sm"
                      : isActive
                        ? "border-[#006879] bg-[#eff4ff] text-[#006879] shadow-sm ring-4 ring-[#006879]/10"
                        : "cursor-not-allowed border-[#c0c8cc] bg-white text-[#c0c8cc]"
                  }`}
                >
                  {isCompleted ? (
                    <span className="text-sm font-bold">✓</span>
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* Step label */}
                <div className="pb-10 pt-1.5">
                  <p
                    className={`text-sm font-semibold leading-tight transition-colors ${
                      isActive
                        ? "text-[#006879] font-bold"
                        : isCompleted
                          ? "text-[#0b1c30]"
                          : "text-gray-400"
                    }`}
                  >
                    {item.title}
                  </p>
                  {isActive && (
                    <p className="mt-0.5 text-xs text-[#006879] font-medium">In progress</p>
                  )}
                  {isCompleted && (
                    <p className="mt-0.5 text-xs text-green-600 font-medium">Completed</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Stepper;
