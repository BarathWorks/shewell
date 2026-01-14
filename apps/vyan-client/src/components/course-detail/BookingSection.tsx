"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { InteractiveButton } from "@/components/ui/interactive-button";
import { ChevronDown, Calendar, Check } from "lucide-react";
import Image from "next/image";

interface BookingSectionProps {
  price: number;
  imageUrl: string;
  sessionId: string;
}

export const BookingSection = ({
  price,
  imageUrl,
  sessionId,
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

  const getStepImage = () => {
    switch (step) {
      case 1:
        return "/shefit/why-shefit-1.png";
      case 2:
        return "/shefit/why-shefit-2.png";
      case 3:
        return "/shefit/why-shefit-3.png";
      default:
        return "/shefit/hero.png";
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
              alert("Payment successful! Your session is booked.");
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
    <section className="w-full overflow-hidden bg-white px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="relative flex min-h-[720px] items-center overflow-hidden rounded-[40px] border border-gray-100 bg-[#F8FAFB] shadow-xl">
          {/* LEFT IMAGE SECTION */}
          <div className="absolute inset-0 hidden h-full w-full md:block md:w-[50%]">
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
                      imageUrl ||
                      "https://placehold.co/800x1200?text=Booking+Session";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#F8FAFB]/30 md:to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT BOOKING CARD */}
          <div className="relative z-0 flex w-full justify-center py-12 md:justify-end md:pl-[50%] md:pr-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="  relative flex min-h-[640px] w-full max-w-[520px] flex-col p-8 md:p-12"
            >
              {/* PRICE PILL */}
              <div className="mb-8 flex justify-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-3 rounded-full border border-[#00898F]/10 bg-[#e6eff1] px-8 py-4 shadow-sm"
                >
                  <span className="font-poppins text-2xl font-bold text-[#00898F]">
                    ₹{price}
                  </span>
                  <span className="font-poppins font-medium text-gray-700">
                    confirm your seat
                  </span>
                </motion.div>
              </div>

              {/* STEPPER */}
              <div className="mb-10 flex items-center justify-center">
                {[1, 2, 3].map((s, i) => (
                  <div key={s} className="flex items-center">
                    <div className="relative flex flex-col items-center">
                      <motion.div
                        animate={{
                          backgroundColor: step >= s ? "#00898F" : "#E5E7EB",
                          color: step >= s ? "#FFFFFF" : "#4B5563",
                        }}
                        onClick={() => setStep(s as 1 | 2 | 3)}
                        className={`relative z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xs font-bold transition-transform hover:scale-110`}
                      >
                        {step > s ? <Check size={16} /> : s}
                      </motion.div>
                      {step === s && (
                        <motion.div
                          layoutId="step-label"
                          className="absolute -bottom-6 whitespace-nowrap text-[10px] font-bold uppercase tracking-tighter text-[#00898F]"
                        >
                          Step {s}
                        </motion.div>
                      )}
                    </div>

                    {i < 2 && (
                      <div className="relative mx-2 h-[2px] w-12 bg-gray-100">
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
                        <div className="space-y-1">
                          <label className="ml-2 text-xs font-semibold text-gray-500">
                            MOM NAME
                          </label>
                          <Input
                            placeholder="Enter your full name"
                            className="h-14 rounded-2xl border-none bg-[#F3F7F8] focus-visible:ring-1 focus-visible:ring-[#00898F]"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="ml-2 text-xs font-semibold text-gray-500">
                            EMAIL ADDRESS
                          </label>
                          <Input
                            placeholder="Enter your email"
                            type="email"
                            className="h-14 rounded-2xl border-none bg-[#F3F7F8] focus-visible:ring-1 focus-visible:ring-[#00898F]"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="ml-2 text-xs font-semibold text-gray-500">
                            MOBILE NUMBER
                          </label>
                          <Input
                            placeholder="Enter contact number"
                            className="h-14 rounded-2xl border-none bg-[#F3F7F8] focus-visible:ring-1 focus-visible:ring-[#00898F]"
                            value={formData.mobile}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                mobile: e.target.value,
                              })
                            }
                          />
                        </div>
                      </>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                      <div className="space-y-6">
                        {/* Pregnant Toggle */}
                        <div className="rounded-2xl border border-gray-100 bg-[#F3F7F8] p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-poppins font-medium text-gray-800">
                              Currently pregnant?
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsPregnant(!isPregnant)}
                              className={`h-6 w-12 rounded-full p-1 transition-colors duration-300 ${isPregnant ? "bg-[#00898F]" : "bg-gray-300"}`}
                            >
                              <motion.div
                                animate={{ x: isPregnant ? 24 : 0 }}
                                className="h-4 w-4 rounded-full bg-white shadow-sm"
                              />
                            </button>
                          </div>

                          <div
                            className={`space-y-3 transition-all duration-300 ${isPregnant ? "opacity-100" : "pointer-events-none opacity-30"}`}
                          >
                            <div className="relative">
                              <select
                                disabled={!isPregnant}
                                value={formData.trimester}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    trimester: e.target.value,
                                  })
                                }
                                className="h-12 w-full appearance-none rounded-xl border-none bg-white px-4 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00898F]"
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
                              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            </div>
                            <div className="relative">
                              <input
                                type="date"
                                disabled={!isPregnant}
                                value={formData.dueDate}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    dueDate: e.target.value,
                                  })
                                }
                                placeholder="Expected Due Date"
                                className="h-12 w-full rounded-xl border-none bg-white px-4 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00898F]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* New Mom Toggle */}
                        <div className="rounded-2xl border border-gray-100 bg-[#F3F7F8] p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-poppins font-medium text-gray-800">
                              Are you a new mom?
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsNewMom(!isNewMom)}
                              className={`h-6 w-12 rounded-full p-1 transition-colors duration-300 ${isNewMom ? "bg-[#00898F]" : "bg-gray-300"}`}
                            >
                              <motion.div
                                animate={{ x: isNewMom ? 24 : 0 }}
                                className="h-4 w-4 rounded-full bg-white shadow-sm"
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
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    babyDob: e.target.value,
                                  })
                                }
                                placeholder="Baby's Date of Birth"
                                className="h-12 w-full rounded-xl border-none bg-white px-4 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00898F]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="ml-2 text-xs font-semibold text-gray-500">
                            PREFERRED LANGUAGE
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Tamil",
                              "English",
                              "Hindi",
                              "Telugu",
                              "Kannada",
                              "Malayalam",
                            ].map((lang) => (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => {
                                  if (formData.languages.includes(lang)) {
                                    setFormData({
                                      ...formData,
                                      languages: formData.languages.filter(
                                        (l) => l !== lang,
                                      ),
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      languages: [...formData.languages, lang],
                                    });
                                  }
                                }}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                  formData.languages.includes(lang)
                                    ? "bg-[#00898F] text-white"
                                    : "bg-[#F3F7F8] text-gray-600 hover:bg-[#e6eff1]"
                                }`}
                              >
                                {lang}
                              </button>
                            ))}
                          </div>
                          {formData.languages.length > 0 && (
                            <p className="ml-2 text-xs text-[#00898F]">
                              Selected: {formData.languages.join(", ")}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label className="ml-2 text-xs font-semibold text-gray-500">
                            TIME SLOT
                          </label>
                          <div className="relative">
                            <select
                              value={formData.timeSlot}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  timeSlot: e.target.value,
                                })
                              }
                              className="h-14 w-full appearance-none rounded-2xl border-none bg-[#F3F7F8] px-4 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00898F]"
                            >
                              <option value="">Select Time Slot</option>
                              <option value="09:00-10:00">
                                09:00 AM - 10:00 AM
                              </option>
                              <option value="10:00-11:00">
                                10:00 AM - 11:00 AM
                              </option>
                              <option value="11:00-12:00">
                                11:00 AM - 12:00 PM
                              </option>
                              <option value="14:00-15:00">
                                02:00 PM - 03:00 PM
                              </option>
                              <option value="15:00-16:00">
                                03:00 PM - 04:00 PM
                              </option>
                              <option value="16:00-17:00">
                                04:00 PM - 05:00 PM
                              </option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#00898F]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* WHITE SEPARATOR WITH BLUR */}
              <div className="my-8 h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              {/* CONTINUE BUTTON */}
              <div
                onClick={() => {
                  if (isProcessing) return;
                  if (step === 3) {
                    handleBooking();
                  } else {
                    setStep((prev) => (prev < 3 ? ((prev + 1) as any) : prev));
                  }
                }}
                className="order-0 group flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-2xl bg-[#F2F2F2] px-6 py-4 transition-all duration-300 ease-in-out hover:bg-[#00898F] hover:text-white"
              >
                <span className="text-lg font-medium text-[#00000066] group-hover:text-white sm:text-xl">
                  {isProcessing
                    ? "Processing..."
                    : step === 3
                      ? "Proceed to Pay"
                      : "Continue"}
                </span>
                <InteractiveButton />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
