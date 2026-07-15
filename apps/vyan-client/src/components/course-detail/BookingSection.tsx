"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { InteractiveButton } from "@/components/ui/interactive-button";
import { ChevronDown, Calendar, Check, Link } from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";
import { Media } from "@/types/media";
import { toast } from "@repo/ui/src/@/components/use-toast";

const FloatingInput = ({
  type,
  placeholder,
  value,
  onChange,
  label,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  label: string;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFilled = value.length > 0;
  const active = isFocused || isFilled;

  return (
    <div className="relative flex flex-col justify-center w-full h-[60px] bg-[#F1F4F9] border border-[#D8D8D8] rounded-[12px] px-4 transition-all focus-within:border-[#00898F] focus-within:ring-1 focus-within:ring-[#00898F]">
      <label
        className={`absolute left-4 font-poppins transition-all duration-200 pointer-events-none ${
          active
            ? "top-1.5 text-[10px] font-semibold text-[#00898F]"
            : "top-1/2 -translate-y-1/2 text-[14px] lg:text-[15px] font-normal text-[#333333]"
        }`}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-transparent outline-none border-none p-0 font-poppins text-[14px] lg:text-[15px] text-[#333333] transition-all ${
          active ? "pt-3.5" : "opacity-0"
        }`}
        placeholder={isFocused ? placeholder : ""}
      />
    </div>
  );
};

const FloatingSelect = ({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  options: { value: string; label: string }[];
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const active = isFocused || value !== "";

  return (
    <div className="relative flex flex-col justify-center w-full h-[60px] bg-[#F1F4F9] border border-[#D8D8D8] rounded-[12px] px-4 transition-all focus-within:border-[#00898F] focus-within:ring-1 focus-within:ring-[#00898F]">
      <label
        className={`absolute left-4 font-poppins transition-all duration-200 pointer-events-none ${
          active
            ? "top-1.5 text-[10px] font-semibold text-[#00898F]"
            : "top-1/2 -translate-y-1/2 text-[14px] lg:text-[15px] font-normal text-[#333333]"
        }`}
      >
        {label}
      </label>
      <select
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-transparent outline-none border-none p-0 font-poppins text-[14px] lg:text-[15px] text-[#333333] appearance-none transition-all ${
          active ? "pt-3.5" : "opacity-0"
        }`}
      >
        <option value="" disabled hidden></option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#006E72]" />
    </div>
  );
};

const FloatingDate = ({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const active = isFocused || value !== "";

  return (
    <div className="relative flex flex-col justify-center w-full h-[60px] bg-[#F1F4F9] border border-[#D8D8D8] rounded-[12px] px-4 transition-all focus-within:border-[#00898F] focus-within:ring-1 focus-within:ring-[#00898F]">
      <label
        className={`absolute left-4 font-poppins transition-all duration-200 pointer-events-none ${
          active
            ? "top-1.5 text-[10px] font-semibold text-[#00898F]"
            : "top-1/2 -translate-y-1/2 text-[14px] lg:text-[15px] font-normal text-[#333333]"
        }`}
      >
        {label}
      </label>
      <input
        type="date"
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-transparent outline-none border-none p-0 pr-8 font-poppins text-[14px] lg:text-[15px] text-[#333333] transition-all relative z-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${
          active ? "pt-3.5" : "opacity-0 h-full absolute inset-0 pt-0 pl-4"
        }`}
      />
      <Calendar className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#006E72]" />
    </div>
  );
};

interface BookingSectionProps {
  price: number;
  banners: Media[];
  sessionId: string;
  isRegistered?: boolean;
  meetingLink?: string | null;
  maxBookings?: number | null;
  currentRegistrations?: number;
}

export const BookingSection = ({
  price,
  banners,
  sessionId,
  isRegistered = false,
  meetingLink,
  maxBookings = null,
  currentRegistrations = 0,
}: BookingSectionProps): JSX.Element => {

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isPregnant, setIsPregnant] = useState(false);
  const [isNewMom, setIsNewMom] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isOther, setIsOther] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFull = maxBookings !== null && currentRegistrations >= maxBookings;
  const remainingSlots = maxBookings !== null ? Math.max(0, maxBookings - currentRegistrations) : null;


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
      if (!isPlanning && !isOther && !isPregnant && !isNewMom) {
        setError("Please select at least one option to continue");
        return false;
      }
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
    }

    return true;
  };

  const getStepImage = () => {
    const banner = step === 1 ? banners?.[0]?.media?.fileUrl : banners?.[1]?.media?.fileUrl;
    return banner || "/images/session/deafult img.png";
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
    <section className="w-full bg-white px-4 py-10 sm:px-6 sm:py-14 md:px-10 md:py-16 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-6xl xl:max-w-7xl">
        <div className="relative flex min-h-[600px] overflow-hidden rounded-3xl shadow-lg   lg:min-h-[680px] lg:flex-row lg:rounded-[40px]">

          {/* ── LEFT IMAGE PANEL ─────────────────────────────────── */}
          {!isRegistered && (
            <div className="absolute inset-0 hidden h-full w-[48%] lg:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.03 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="h-full w-full"
                >
                  {getStepImage() ? (
                    <div className="relative h-full w-full">
                      <img
                        src={getStepImage()}
                        alt="Booking banner"
                        className="h-full w-full object-cover object-center"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src && !target.src.includes("deafult")) {
                            target.src = "/images/session/deafult img.png";
                          } else {
                            target.style.display = "none";
                            const fallback = target.parentElement?.querySelector(".image-fallback");
                            if (fallback) fallback.classList.remove("hidden");
                          }
                        }}
                      />
                      <div className="image-fallback absolute inset-0 hidden flex-col items-center justify-center bg-gradient-to-br from-[#00898F]/20 to-[#2C5F71]/10">
                        <Calendar className="h-16 w-16 text-[#00898F]/30" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#00898F]/10 to-[#00898F]/5">
                      <Calendar className="h-16 w-16 text-[#00898F]/30" />
                    </div>
                  )}
                  {/* Edge fade */}
                  <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-[#F8FAFB]" />
                  {/* Step progress chip on image */}
                  <div className="absolute bottom-6 left-6 rounded-full bg-black/30 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                    Step {step} of 2
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* ── RIGHT FORM PANEL ──────────────────────────────────── */}
          <div
            className={` relative z-10 flex w-full items-start shadow-lg justify-center px-4 py-8 sm:px-6 sm:py-10 ${isRegistered ? "" : " shadow-lg lg:ml-[48%] lg:px-10 lg:py-12 xl:px-14"
              }`}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex w-full max-w-[480px] flex-col gap-6"
            >
              {/* PRICE PILL */}
              {!isRegistered && (
                <div className="mb-3 flex justify-center sm:mb-4">
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
              {/* ── REGISTERED STATE ────────────────────────────── */}
              {isRegistered ? (
                <div className="flex flex-col items-center gap-6 py-8 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#00898F]/10 ring-8 ring-[#00898F]/5">
                    <Check className="h-9 w-9 text-[#00898F]" />
                  </div>
                  <div>
                    <h3 className="mb-1.5 text-2xl font-extrabold text-gray-900">
                      You're Registered!
                    </h3>
                    <p className="text-sm text-gray-500">
                      Your seat is confirmed. We'll send you a reminder closer to the session.
                    </p>
                  </div>
                  {meetingLink ? (
                    <a
                      href={meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex w-full max-w-xs items-center justify-between rounded-2xl bg-[#00898F] px-5 py-3.5 text-white transition-all duration-300 hover:bg-[#007a80] hover:shadow-lg"
                    >
                      <span className="text-sm font-semibold">Join Meeting Now</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
                        <InteractiveButton />
                      </div>
                    </a>
                  ) : (
                    <div className="w-full max-w-xs rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-amber-700">
                      The meeting link will be shared closer to the session.
                    </div>
                  )}
                </div>
              ) : (
                <>


                  {/* ── STEPPER (Page - Navigation) ─────────────────────────────────── */}
                  <div className="flex flex-row justify-center items-center gap-1 w-full py-4 overflow-x-auto select-none">
                    {[
                      { s: 1, label: "Your Details" },
                      { s: 2, label: "About You" },
                    ].map(({ s, label }, idx) => {
                      const isActive = step === s;
                      return (
                        <React.Fragment key={s}>
                          <div className="flex flex-row items-center gap-2 flex-shrink-0">
                            {/* Badges */}
                            <div
                              onClick={() => { if (s < step) setStep(s as 1 | 2); }}
                              className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                                isActive
                                  ? "w-8 h-8 min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] bg-[#006E72] text-white font-bold text-[16px] cursor-default"
                                  : `w-6 h-6 min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px] bg-[#E1EBED] text-black font-medium text-[16px] ${s < step ? "cursor-pointer hover:scale-105" : "cursor-default"}`
                              }`}
                            >
                              {s}
                            </div>
                            {/* Text (only active is shown) */}
                            {isActive && (
                              <span className="font-poppins font-normal text-[20px] leading-[30px] text-black whitespace-nowrap">
                                {label}
                              </span>
                            )}
                          </div>
                          {/* Line */}
                          {idx < 1 && (
                            <div className="w-[100px] h-[1px] bg-white border-t border-[#000000]/30 mx-2 flex-shrink-0" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* ── FORM BODY ───────────────────────────────── */}
                  <div className="flex-1">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={step}
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="space-y-3"
                      >
                        {/* STEP 1 — Personal info */}
                        {step === 1 && (
                          <>
                            <p className="text-xs font-medium text-gray-400">
                              Enter your details to reserve your seat.
                            </p>
                            {[
                              { key: "name", label: "Full Name", placeholder: "e.g. Priya Sharma", type: "text" },
                              { key: "email", label: "Email Address", placeholder: "you@example.com", type: "email" },
                              { key: "mobile", label: "Mobile Number", placeholder: "10-digit number", type: "tel" },
                            ].map(({ key, label, placeholder, type }) => (
                              <div key={key} className="flex flex-col gap-1">
                                <FloatingInput
                                  type={type}
                                  placeholder={placeholder}
                                  label={label}
                                  value={(formData as any)[key]}
                                  onChange={(val) => {
                                    setError(null);
                                    setFormData({ ...formData, [key]: val });
                                  }}
                                />
                              </div>
                            ))}
                          </>
                        )}

                        {/* STEP 2 — Profile */}
                        {step === 2 && (
                          <div className="flex flex-col gap-10 w-full py-4">
                            {/* Option 1 — Planning to get pregnant */}
                            <div className="flex flex-col gap-6 w-full">
                              <div className="flex flex-row items-center justify-between w-full h-12">
                                <span className="font-poppins font-normal text-[20px] leading-[24px] text-[#333333]">
                                  Are you planning to get pregnant?
                                </span>
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={isPlanning}
                                  onClick={() => {
                                    const nextVal = !isPlanning;
                                    setIsPlanning(nextVal);
                                    if (nextVal) {
                                      setIsPregnant(false);
                                      setIsNewMom(false);
                                      setIsOther(false);
                                    }
                                  }}
                                  className={`relative inline-flex h-8 w-[52px] flex-shrink-0 cursor-pointer items-center rounded-full p-[2px] transition-colors duration-300 focus:outline-none ${isPlanning ? "bg-[#006E72]" : "bg-gray-200"}`}
                                >
                                  <span
                                    className={`block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${isPlanning ? "translate-x-5" : "translate-x-0"}`}
                                  />
                                </button>
                              </div>
                            </div>

                            {/* Option 2 — Currently Pregnant */}
                            <div className="flex flex-col gap-6 w-full">
                              {/* Toggle Row */}
                              <div className="flex flex-row items-center justify-between w-full h-12">
                                <span className="font-poppins font-normal text-[20px] leading-[24px] text-[#333333]">
                                  Are you currently pregnant?
                                </span>
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={isPregnant}
                                  onClick={() => {
                                    const nextVal = !isPregnant;
                                    setIsPregnant(nextVal);
                                    if (nextVal) {
                                      setIsNewMom(false);
                                      setIsPlanning(false);
                                      setIsOther(false);
                                    }
                                  }}
                                  className={`relative inline-flex h-8 w-[52px] flex-shrink-0 cursor-pointer items-center rounded-full p-[2px] transition-colors duration-300 focus:outline-none ${isPregnant ? "bg-[#006E72]" : "bg-gray-200"}`}
                                >
                                  <span
                                    className={`block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${isPregnant ? "translate-x-5" : "translate-x-0"}`}
                                  />
                                </button>
                              </div>

                              {/* Sub-inputs (Frame 3) */}
                              {isPregnant && (
                                <div className="flex flex-col gap-5 w-full">
                                  <FloatingSelect
                                    label="Trimester"
                                    value={formData.trimester}
                                    onChange={(val) => { setError(null); setFormData({ ...formData, trimester: val }); }}
                                    options={[
                                      { value: "first", label: "First (1–12 weeks)" },
                                      { value: "second", label: "Second (13–26 weeks)" },
                                      { value: "third", label: "Third (27–40 weeks)" },
                                    ]}
                                  />
                                  <FloatingDate
                                    label="Expected Due date"
                                    value={formData.dueDate}
                                    onChange={(val) => { setError(null); setFormData({ ...formData, dueDate: val }); }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Option 3 — New Mom */}
                            <div className="flex flex-col gap-6 w-full">
                              {/* Toggle Row */}
                              <div className="flex flex-row items-center justify-between w-full h-12">
                                <span className="font-poppins font-normal text-[20px] leading-[24px] text-[#333333]">
                                  Are you a new mom?
                                </span>
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={isNewMom}
                                  onClick={() => {
                                    const nextVal = !isNewMom;
                                    setIsNewMom(nextVal);
                                    if (nextVal) {
                                      setIsPregnant(false);
                                      setIsPlanning(false);
                                      setIsOther(false);
                                    }
                                  }}
                                  className={`relative inline-flex h-8 w-[52px] flex-shrink-0 cursor-pointer items-center rounded-full p-[2px] transition-colors duration-300 focus:outline-none ${isNewMom ? "bg-[#006E72]" : "bg-gray-200"}`}
                                >
                                  <span
                                    className={`block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${isNewMom ? "translate-x-5" : "translate-x-0"}`}
                                  />
                                </button>
                              </div>

                              {/* Sub-inputs */}
                              {isNewMom && (
                                <div className="w-full">
                                  <FloatingDate
                                    label="Baby's Date of Birth"
                                    value={formData.babyDob}
                                    onChange={(val) => { setError(null); setFormData({ ...formData, babyDob: val }); }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Option 4 — Other */}
                            <div className="flex flex-col gap-6 w-full">
                              <div className="flex flex-row items-center justify-between w-full h-12">
                                <span className="font-poppins font-normal text-[20px] leading-[24px] text-[#333333]">
                                  Other
                                </span>
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={isOther}
                                  onClick={() => {
                                    const nextVal = !isOther;
                                    setIsOther(nextVal);
                                    if (nextVal) {
                                      setIsPregnant(false);
                                      setIsNewMom(false);
                                      setIsPlanning(false);
                                    }
                                  }}
                                  className={`relative inline-flex h-8 w-[52px] flex-shrink-0 cursor-pointer items-center rounded-full p-[2px] transition-colors duration-300 focus:outline-none ${isOther ? "bg-[#006E72]" : "bg-gray-200"}`}
                                >
                                  <span
                                    className={`block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${isOther ? "translate-x-5" : "translate-x-0"}`}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* ── ERROR ───────────────────────────────────── */}
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error === "Sign in to proceed" ? (
                        <>
                          {error}{" "}
                          <NextLink href="/auth/login" className="font-bold underline">
                            Sign in
                          </NextLink>
                        </>
                      ) : (
                        error
                      )}
                    </div>
                  )}

                  {/* ── ENHANCED DIVIDER ─────────────────────────── */}
                  <div className="relative py-2.5 w-full flex items-center">
                    <div className="flex-grow border-t border-gray-100" />
                    <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-widest text-[#00898F]/50 select-none">
                      checkout
                    </span>
                    <div className="flex-grow border-t border-gray-100" />
                  </div>

                  {/* ── CTA ─────────────────────────────────────── */}
                  {isFull && !isRegistered ? (
                    <div className="flex w-full cursor-not-allowed items-center justify-center rounded-2xl bg-gray-100 px-5 py-4">
                      <span className="text-sm font-semibold text-gray-400">This session is full</span>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        if (isProcessing) return;
                        if (step === 1) {
                          if (!validateStep(1)) return;
                          setStep(2);
                        } else if (step === 2) {
                          handleBooking();
                        }
                      }}
                      className="group flex w-full cursor-pointer items-center justify-between rounded-[24px] bg-[#F2F2F2] px-5 py-4 transition-all duration-300 hover:bg-[#00898F] active:bg-[#006e72] hover:shadow-lg"
                    >
                      <span className="text-sm font-semibold text-[#00000066] group-hover:text-white transition-colors duration-300 md:text-base">
                        {isProcessing
                          ? "Processing…"
                          : step === 2
                            ? "Proceed to Pay"
                            : "Continue"}
                      </span>
                      <InteractiveButton as="span" />
                    </div>
                  )}

                  {/* Urgency nudge */}
                  {remainingSlots !== null && remainingSlots > 0 && remainingSlots <= 5 && (
                    <p className="text-center text-xs font-semibold text-red-500">
                      🔥 Only {remainingSlots} seat{remainingSlots > 1 ? "s" : ""} remaining!
                    </p>
                  )}
                </>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
