"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { InteractiveButton } from "@/components/ui/interactive-button";
import { ChevronDown, Calendar, Check, Link } from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";
import { Media } from "@/types/media";
import { toast } from "@repo/ui/src/@/components/use-toast";
import { a } from "node_modules/framer-motion/dist/types.d-DagZKalS";

interface BookingSectionProps {
  price: number;
  banners: Media[];
  sessionId: string;
  isRegistered?: boolean;
  meetingLink?: string | null;
}

export const BookingSection = ({
  price,
  banners,
  sessionId,
  isRegistered = false,
  meetingLink,
}: BookingSectionProps): JSX.Element => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isPregnant, setIsPregnant] = useState(false);
  const [isNewMom, setIsNewMom] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    trimester: "",
    dueDate: "",
    babyDob: "",
    languages: [] as string[],
    timeSlot: "",
  });

  const containerVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const validateStep = (currentStep: number): boolean => {
    setError(null);

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError("Please enter your name");
        return false;
      }
      if (!formData.email.trim()) {
        setError("Please enter your email");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        return false;
      }
      if (!formData.mobile.trim()) {
        setError("Please enter your mobile number");
        return false;
      }
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(formData.mobile.replace(/\D/g, ""))) {
        setError("Please enter a valid 10-digit mobile number");
        return false;
      }
    }

    if (currentStep === 2) {
      if (isPregnant) {
        if (!formData.trimester) {
          setError("Please select your trimester");
          return false;
        }
        if (!formData.dueDate) {
          setError("Please enter your expected due date");
          return false;
        }
      }
      if (isNewMom) {
        if (!formData.babyDob) {
          setError("Please enter your baby's date of birth");
          return false;
        }
      }
      // If neither is selected, it's valid to proceed (assuming optional if not applicable)
      // or if business logic requires at least one, we can add that check here.
      // For now, assuming if user doesn't toggle either, they might be just exploring or booking for someone else?
      // Re-reading requirements: "Moms in their third trimester...", "New mothers...".
      // It implies users should likely be one of these.
      // However, to avoid blocking valid edge cases (e.g. support person), I will strictly validate only if toggles are on.
    }

    return true;
  };

  const getStepImage = () => {
    switch (step) {
      case 1:
        return banners?.[0].media.fileUrl;
      case 2:
        return banners?.[1].media.fileUrl;

      default:
        return banners?.[0].media.fileUrl;
    }
  };

  // Load Razorpay SDK
  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBooking = async () => {
    if (!validateStep(2)) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Load Razorpay SDK
      const res = await initializeRazorpay();
      if (!res) {
        setError("Failed to load payment gateway. Please try again.");
        setIsProcessing(false);
        return;
      }

      // Import server actions dynamically
      const { createSessionOrder, verifySessionPayment } =
        await import("~/lib/payment-actions");

      // Create order
      const orderResponse = await createSessionOrder({
        sessionId,
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        isPregnant,
        trimester: isPregnant ? formData.trimester : undefined,
        dueDate: isPregnant ? formData.dueDate : undefined,
        isNewMom,
        babyDob: isNewMom ? formData.babyDob : undefined,
        languages: formData.languages,
        timeSlot: formData.timeSlot,
      });

      if (orderResponse.error) {
        setError(orderResponse.error);
        setIsProcessing(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderResponse.razorpay.amount,
        currency: orderResponse.razorpay.currency,
        name: "Shewell",
        description: orderResponse.razorpay.description,
        order_id: orderResponse.razorpay.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await verifySessionPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.success) {
              toast.success("Payment successful! Your session is booked.");
              window.location.reload();
            } else {
              setError(verifyResponse.message || "Payment verification failed");
            }
          } catch (err: any) {
            setError(err.message || "Payment verification failed");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: orderResponse.razorpay.user.name,
          email: orderResponse.razorpay.user.email,
          contact: formData.mobile,
        },
        theme: {
          color: "#00898F",
        },
      };

      // @ts-ignore
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on("payment.failed", function (response: any) {
        setError("Payment failed. Please try again.");
        setIsProcessing(false);
      });
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };
  return (
    <section className="w-full overflow-hidden bg-white px-4 py-8 sm:px-6 sm:py-10 md:px-10 md:py-12 lg:px-12 lg:py-16 xl:px-16 2xl:px-20 2xl:py-20">
      <div className="mx-auto max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px]">
        <div className="relative flex min-h-[600px] flex-col items-center overflow-hidden rounded-2xl border border-gray-100 bg-[#F8FAFB] shadow-xl sm:min-h-[640px] sm:rounded-3xl md:min-h-[700px] lg:min-h-[720px] lg:flex-row lg:rounded-[40px] xl:min-h-[800px] 2xl:min-h-[900px]">
          {/* LEFT IMAGE SECTION */}
          <div className="absolute inset-0 hidden h-full w-full lg:block lg:w-[50%]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full w-full"
              >
                <img
                  src={getStepImage()}
                  alt="Booking backdrop"
                  className="h-full w-full object-cover object-center"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      banners?.[0].media.fileUrl ||
                      "https://placehold.co/800x1200?text=Booking+Session";

                    console.log("banners", banners);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#F8FAFB]/30 md:to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT BOOKING CARD */}
          <div className="relative z-0 flex w-full justify-center px-3 py-6 sm:px-4 sm:py-8 md:py-10 lg:justify-end lg:pl-[50%] lg:pr-6 xl:pr-8 2xl:pr-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative flex min-h-[520px] w-full max-w-[480px] flex-col p-4 sm:min-h-[560px] sm:max-w-[500px] sm:p-5 md:min-h-[600px] md:max-w-[520px] md:p-6 lg:min-h-[640px] lg:max-w-[520px] lg:p-8 xl:min-h-[700px] xl:max-w-[580px] xl:p-10 2xl:min-h-[800px] 2xl:max-w-[640px] 2xl:p-12"
            >
              {/* PRICE PILL */}
              {!isRegistered && (
                <div className="mb-4 flex justify-center sm:mb-6 md:mb-8 lg:mb-10">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-2 rounded-lg border border-[#00898F]/10 bg-[#e6eff1] px-3 py-2.5 shadow-sm sm:flex-row sm:gap-2.5 sm:rounded-2xl sm:px-5 sm:py-3 md:rounded-full md:px-6 lg:px-8"
                  >
                    <span className="font-poppins text-lg font-bold text-[#00898F] sm:text-xl md:text-2xl lg:text-3xl">
                      ₹{price}
                    </span>
                    <span className="font-poppins text-xs font-medium text-gray-700 sm:text-sm md:text-base">
                      confirm your seat
                    </span>
                  </motion.div>
                </div>
              )}

              {/* REGISTERED STATE */}
              {isRegistered ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <div className="md:h-18 md:w-18 mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#00898F]/10 text-[#00898F] sm:mb-4 sm:h-16 sm:w-16 md:mb-5 lg:mb-6 lg:h-20 lg:w-20">
                    <Check
                      size={24}
                      className="sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9"
                    />
                  </div>
                  <h3 className="mb-2 font-poppins text-base font-bold text-gray-900 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl">
                    You're Registered!
                  </h3>
                  <p className="mb-4 text-xs text-gray-600 sm:mb-6 sm:text-sm md:mb-8 md:text-base lg:text-lg">
                    You have successfully booked your seat for this session.
                    Click below to join the meeting when it's time.
                  </p>
                  {meetingLink ? (
                    <a
                      href={meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex w-full items-center justify-between gap-2 rounded-lg bg-[#00898F] px-3 py-2.5 text-white transition-all duration-300 ease-in-out hover:bg-teal-700 sm:rounded-lg sm:px-4 sm:py-3 md:rounded-lg md:px-5 md:py-3.5 lg:rounded-xl lg:px-6 lg:py-4"
                    >
                      <span className="text-xs font-medium sm:text-sm md:text-base lg:text-lg">
                        Join Meeting Now
                      </span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-1 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10">
                        <InteractiveButton />
                      </div>
                    </a>
                  ) : (
                    <div className="w-full rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700 sm:rounded-lg sm:p-3 sm:text-sm md:rounded-lg md:p-4 md:text-base lg:rounded-xl">
                      The meeting link will be shared here closer to the session
                      start time.
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* STEPPER */}
                  <div className="mb-5 flex items-center justify-center sm:mb-6 md:mb-8 lg:mb-10">
                    {[1, 2].map((s, i) => (
                      <div key={s} className="flex items-center">
                        <div className="relative flex flex-col items-center">
                          <motion.div
                            animate={{
                              backgroundColor:
                                step >= s ? "#00898F" : "#E5E7EB",
                              color: step >= s ? "#FFFFFF" : "#4B5563",
                            }}
                            onClick={() => {
                              if (s < step) {
                                setStep(s as 1 | 2 | 3);
                              }
                            }}
                            className={`relative z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-xs font-bold transition-transform hover:scale-110 sm:h-7 sm:w-7 sm:text-xs md:h-8 md:w-8 md:text-sm lg:h-9 lg:w-9`}
                          >
                            {step > s ? (
                              <Check size={12} className="sm:h-4 sm:w-4" />
                            ) : (
                              s
                            )}
                          </motion.div>
                          {step === s && (
                            <motion.div
                              layoutId="step-label"
                              className="absolute -bottom-4 whitespace-nowrap text-[7px] font-bold uppercase tracking-tighter text-[#00898F] sm:-bottom-5 sm:text-[8px] md:text-[9px] lg:text-[10px]"
                            >
                              Step {s}
                            </motion.div>
                          )}
                        </div>

                        {i < 1 && (
                          <div className="relative mx-1 h-[1.5px] w-6 bg-gray-100 sm:mx-1.5 sm:w-7 md:mx-2 md:w-8 lg:w-10">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: step > s ? "100%" : "0%" }}
                              className="absolute inset-0 bg-[#00898F]"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* FORM BODY */}
                  <div className="flex-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={step}
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="space-y-5"
                      >
                        {/* STEP 1 */}
                        {step === 1 && (
                          <>
                            <div className="space-y-1 sm:space-y-1.5">
                              <label className="ml-2 text-[9px] font-semibold text-gray-500 sm:text-[10px] md:text-xs">
                                MOM NAME
                              </label>
                              <Input
                                placeholder="Enter your full name"
                                className="h-9 rounded-lg border-none bg-[#F3F7F8] text-xs focus-visible:ring-1 focus-visible:ring-[#00898F] sm:h-10 sm:rounded-xl sm:text-sm md:h-11 lg:h-12"
                                value={formData.name}
                                onChange={(e) => {
                                  setError(null);
                                  setFormData({
                                    ...formData,
                                    name: e.target.value,
                                  });
                                }}
                              />
                            </div>
                            <div className="space-y-1 sm:space-y-1.5">
                              <label className="ml-2 text-[9px] font-semibold text-gray-500 sm:text-[10px] md:text-xs">
                                EMAIL ADDRESS
                              </label>
                              <Input
                                placeholder="Enter your email"
                                type="email"
                                className="h-9 rounded-lg border-none bg-[#F3F7F8] text-xs focus-visible:ring-1 focus-visible:ring-[#00898F] sm:h-10 sm:rounded-xl sm:text-sm md:h-11 lg:h-12"
                                value={formData.email}
                                onChange={(e) => {
                                  setError(null);
                                  setFormData({
                                    ...formData,
                                    email: e.target.value,
                                  });
                                }}
                              />
                            </div>
                            <div className="space-y-1 sm:space-y-1.5">
                              <label className="ml-2 text-[9px] font-semibold text-gray-500 sm:text-[10px] md:text-xs">
                                MOBILE NUMBER
                              </label>
                              <Input
                                placeholder="Enter contact number"
                                className="h-9 rounded-lg border-none bg-[#F3F7F8] text-xs focus-visible:ring-1 focus-visible:ring-[#00898F] sm:h-10 sm:rounded-xl sm:text-sm md:h-11 lg:h-12"
                                value={formData.mobile}
                                onChange={(e) => {
                                  setError(null);
                                  setFormData({
                                    ...formData,
                                    mobile: e.target.value,
                                  });
                                }}
                              />
                            </div>
                          </>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                          <div className="space-y-3 sm:space-y-4 md:space-y-5">
                            {/* Pregnant Toggle */}
                            <div className="rounded-lg border border-gray-100 bg-[#F3F7F8] p-3 sm:rounded-xl sm:p-4 md:rounded-2xl md:p-5">
                              <div className="mb-2 flex items-center justify-between sm:mb-2.5 md:mb-3">
                                <span className="font-poppins text-xs font-medium text-gray-800 sm:text-sm md:text-base">
                                  Currently pregnant?
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newValue = !isPregnant;
                                    setIsPregnant(newValue);
                                    if (newValue) {
                                      setIsNewMom(false);
                                      // Clear new mom related data if needed, or just let validation handle active fields
                                      // Optional: setFormData({...formData, babyDob: ''})
                                    }
                                  }}
                                  className={`h-4 w-9 rounded-full p-0.5 transition-colors duration-300 sm:h-5 sm:w-11 md:h-6 md:w-12 ${isPregnant ? "bg-[#00898F]" : "bg-gray-300"}`}
                                >
                                  <motion.div
                                    animate={{ x: isPregnant ? 16 : 0 }}
                                    className="h-3 w-3 rounded-full bg-white shadow-sm sm:h-3.5 sm:w-3.5 md:h-4 md:w-4"
                                  />
                                </button>
                              </div>

                              <div
                                className={`space-y-2 transition-all duration-300 sm:space-y-2.5 ${isPregnant ? "opacity-100" : "pointer-events-none opacity-30"}`}
                              >
                                <div className="relative">
                                  <select
                                    disabled={!isPregnant}
                                    value={formData.trimester}
                                    onChange={(e) => {
                                      setError(null);
                                      setFormData({
                                        ...formData,
                                        trimester: e.target.value,
                                      });
                                    }}
                                    className="h-9 w-full appearance-none rounded-lg border-none bg-white px-3 pr-8 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00898F] sm:h-10 sm:rounded-lg sm:text-sm md:h-11 md:rounded-xl"
                                  >
                                    <option value="">Select Trimester</option>
                                    <option value="first">
                                      First Trimester (1-12 weeks)
                                    </option>
                                    <option value="second">
                                      Second Trimester (13-26 weeks)
                                    </option>
                                    <option value="third">
                                      Third Trimester (27-40 weeks)
                                    </option>
                                  </select>
                                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                                </div>
                                <div className="relative">
                                  <input
                                    type="date"
                                    disabled={!isPregnant}
                                    value={formData.dueDate}
                                    onChange={(e) => {
                                      setError(null);
                                      setFormData({
                                        ...formData,
                                        dueDate: e.target.value,
                                      });
                                    }}
                                    placeholder="Expected Due Date"
                                    className="h-9 w-full rounded-lg border-none bg-white px-3 pr-8 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00898F] sm:h-10 sm:rounded-lg sm:text-sm md:h-11 md:rounded-xl"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* New Mom Toggle */}
                            <div className="rounded-lg border border-gray-100 bg-[#F3F7F8] p-3 sm:rounded-xl sm:p-4 md:rounded-2xl md:p-5">
                              <div className="mb-2 flex items-center justify-between sm:mb-2.5 md:mb-3">
                                <span className="font-poppins text-xs font-medium text-gray-800 sm:text-sm md:text-base">
                                  Are you a new mom?
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newValue = !isNewMom;
                                    setIsNewMom(newValue);
                                    if (newValue) {
                                      setIsPregnant(false);
                                    }
                                  }}
                                  className={`h-4 w-9 rounded-full p-0.5 transition-colors duration-300 sm:h-5 sm:w-11 md:h-6 md:w-12 ${isNewMom ? "bg-[#00898F]" : "bg-gray-300"}`}
                                >
                                  <motion.div
                                    animate={{ x: isNewMom ? 16 : 0 }}
                                    className="h-3 w-3 rounded-full bg-white shadow-sm sm:h-3.5 sm:w-3.5 md:h-4 md:w-4"
                                  />
                                </button>
                              </div>

                              <div
                                className={`transition-all duration-300 ${isNewMom ? "opacity-100" : "pointer-events-none opacity-30"}`}
                              >
                                <div className="relative">
                                  <input
                                    type="date"
                                    disabled={!isNewMom}
                                    value={formData.babyDob}
                                    onChange={(e) => {
                                      setError(null);
                                      setFormData({
                                        ...formData,
                                        babyDob: e.target.value,
                                      });
                                    }}
                                    placeholder="Baby's Date of Birth"
                                    className="h-9 w-full rounded-lg border-none bg-white px-3 pr-8 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00898F] sm:h-10 sm:rounded-lg sm:text-sm md:h-11 md:rounded-xl"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* STEP 3 Logic was here, skipping as originally commented out */}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* ERROR MESSAGE */}
                  {error && (
                    <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 sm:mb-3 sm:rounded-lg sm:px-4 sm:py-3 sm:text-sm md:mb-4 md:rounded-lg md:px-5 md:py-3.5 md:text-base lg:rounded-xl">
                      {error === "Sign in to proceed" ? (
                        <>
                          {error}{" "}
                          <NextLink
                            href="/auth/login"
                            className="font-semibold underline"
                          >
                            Sign in
                          </NextLink>
                        </>
                      ) : (
                        error
                      )}
                    </div>
                  )}

                  {/* WHITE SEPARATOR WITH BLUR */}
                  <div className="my-3 h-[1.5px] bg-gradient-to-r from-transparent via-gray-200 to-transparent sm:my-4 md:my-5 lg:my-6" />

                  {/* CONTINUE BUTTON */}
                  <div
                    onClick={() => {
                      if (isProcessing) return;

                      // Validate Step 1
                      if (step === 1) {
                        if (!validateStep(1)) return;
                        setStep(2);
                      }
                      // Validate Step 2 and Submit
                      else if (step === 2) {
                        handleBooking();
                      }
                    }}
                    className="order-0 group flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg bg-[#F2F2F2] px-3 py-2 transition-all duration-300 ease-in-out hover:bg-[#00898F] hover:text-white sm:gap-2.5 sm:rounded-lg sm:px-4 sm:py-2.5 md:rounded-lg md:px-5 md:py-3 lg:rounded-xl lg:px-6 lg:py-4"
                  >
                    <span className="text-xs font-medium text-[#00000066] group-hover:text-white sm:text-sm md:text-base lg:text-lg">
                      {isProcessing
                        ? "Processing..."
                        : step === 2
                          ? "Proceed to Pay"
                          : "Continue"}
                    </span>
                    <InteractiveButton />
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
