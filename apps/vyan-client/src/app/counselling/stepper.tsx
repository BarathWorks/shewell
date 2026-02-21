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
        <div className="flex items-center justify-center gap-2 px-4 py-5">
          {steps.map((item, index) => {
            const isCompleted = currentStep > index + 1;
            const isActive = currentStep === index + 1;

            return (
              <div key={index} className="flex items-center gap-2">
                {/* Step node */}
                <div
                  onClick={() => {
                    if (index < currentStep - 1) setStep(index + 1);
                  }}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? "cursor-pointer bg-[#00898F] text-white shadow-md"
                      : isActive
                        ? "border-2 border-[#00898F] bg-[#F2F9F9] text-[#00898F] shadow-sm"
                        : "border-2 border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>

                {/* Step label — only show for active */}
                {isActive && (
                  <span className="text-sm font-semibold text-[#333333]">
                    {item.title}
                  </span>
                )}

                {/* Connector line between steps */}
                {index < steps.length - 1 && !isActive && (
                  <div
                    className={`h-[2px] w-8 rounded-full ${isCompleted ? "bg-[#00898F]" : "bg-gray-200"}`}
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
            const isCompleted = currentStep > index + 1;
            const isActive = currentStep === index + 1;

            return (
              <div key={index} className="relative flex items-start gap-4">
                {/* Vertical connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[17px] top-9 z-0 h-10 w-[2px] rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#00898F] transition-all duration-500"
                      style={{ height: isCompleted ? "100%" : "0%" }}
                    />
                  </div>
                )}

                {/* Step circle */}
                <div
                  onClick={() => {
                    if (index < currentStep - 1) setStep(index + 1);
                  }}
                  className={`relative z-10 mb-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? "cursor-pointer border-[#00898F] bg-[#00898F] text-white shadow-md"
                      : isActive
                        ? "border-[#00898F] bg-[#F2F9F9] text-[#00898F] shadow-sm ring-4 ring-[#00898F]/10"
                        : "cursor-not-allowed border-gray-200 bg-white text-gray-400"
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
                        ? "text-[#00898F]"
                        : isCompleted
                          ? "text-[#333333]"
                          : "text-[#BBBBBB]"
                    }`}
                  >
                    {item.title}
                  </p>
                  {isActive && (
                    <p className="mt-0.5 text-xs text-[#999999]">In progress</p>
                  )}
                  {isCompleted && (
                    <p className="mt-0.5 text-xs text-[#00898F]">Completed</p>
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
