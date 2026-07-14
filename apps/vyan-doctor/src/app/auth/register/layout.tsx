"use client";

import Link from "next/link";
import React from "react";
import StepperRegister from "./stepper-register";

const RegisterLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-surface min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Illustration & Branding */}
      <section 
        className="hidden md:flex flex-1 flex-col justify-center items-center bg-surface-container-low p-12 relative overflow-hidden"
        style={{ background: "radial-gradient(circle at center, #ffffff 0%, #eff4ff 100%)" }}
      >
        <div className="z-10 text-center max-w-lg mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight mb-4">
            Provide wellness virtuality
          </h1>
          <p className="text-slate-600 text-lg">
            Provide best services to your client with <span className="font-semibold text-brand-teal">SheWellCare</span>
          </p>
        </div>
        {/* Doctor Illustration */}
        <div className="z-10 w-full max-w-lg aspect-square relative flex items-center justify-center">
          <img 
            className="w-full h-full object-contain" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUw-Prz7hKk6-_sp76ZGq5Na953ol0Boa5yGAgNA7q3Jnas5WyPka6QNYNnBBtuIksNPsXj25B63cj8_ayNM9qRZpBBg7bf9G4hdeQmCGilbtNELb14s6Gb25oZK3Iaan5FhzEHYvKu3k6ZYewuM8ozPv7BLlnnykafLUDHpbhUJuSKLkPIZstX8fyLsjWhFsqBSQStNmTxvI0REMQwfX6NNC6KvR2-uccn-kc4zIjOmo831Jf8BajrA" 
            alt="Doctor registration illustration"
          />
        </div>
        {/* Footer Links (Left Side) */}
        <div className="absolute bottom-8 w-full px-8 text-center">
          <p className="text-xs text-slate-400 mb-2">
            By proceeding, you agree to the{" "}
            <Link className="text-brand-teal hover:underline font-semibold" href="/terms" target="_blank">
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link className="text-brand-teal hover:underline font-semibold" href="/privacy-policy" target="_blank">
              Privacy Policy
            </Link>
          </p>
          <div className="flex justify-center gap-6 text-xs text-slate-400">
            <Link className="hover:text-brand-teal transition-colors" href="#">Help</Link>
            <Link className="hover:text-brand-teal transition-colors" href="#">Privacy</Link>
            <Link className="hover:text-brand-teal transition-colors" href="#">Terms</Link>
          </div>
        </div>
        {/* Atmospheric subtle gradient */}
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-[#2c5f71]/5 blur-[120px] rounded-full"></div>
      </section>

      {/* Right Side: Account Setup Form */}
      <section className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-surface-container-lowest min-h-screen overflow-y-auto">
        <div className="w-full max-w-xl">
          {/* Logo / Header */}
          <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Create your free account</h2>
          </div>
          {/* Stepper Progress Bar */}
          <div className="mb-6">
            <StepperRegister />
          </div>
          {/* Children (Form contents) */}
          {children}
        </div>
      </section>
    </div>
  );
};

export default RegisterLayout;
