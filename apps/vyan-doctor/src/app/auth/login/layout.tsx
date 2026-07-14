"use client";

import Link from "next/link";
import React from "react";

const LoginLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-surface min-h-screen flex items-center justify-center p-4">
      <main className="max-w-6xl w-full bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col md:flex-row min-h-[600px]" data-purpose="login-wrapper">
        {/* Left Section (Illustration & Branding) */}
        <section 
          className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden" 
          data-purpose="marketing-section"
          style={{ background: "radial-gradient(circle at center, #ffffff 0%, #eff4ff 100%)" }}
        >
          <div className="space-y-4 max-w-md z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
              Provide wellness virtuality
            </h1>
            <p className="text-slate-600 text-lg">
              Provide best services to your client with <span className="font-semibold text-brand-teal">SheWellCare</span>
            </p>
          </div>
          
          {/* Illustration Wrapper */}
          <div className="relative w-full max-w-sm z-10" data-purpose="illustration">
            <img 
              alt="Professional healthcare login illustration" 
              className="w-full h-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-S8_6gdl7PPSRbB3fc7kivvu7B2PZattG9L4JMgY18j8mU_IW_YxP675l86C63uLYEpt8tKgyJZ3CBCQAqbGPLkdQeDy-vYjSNMQOPobSjmnDBHMr1U5mnovo3vq5S8oY8IaZjQ9GCq0fHmnRD-U1UnTCV8ULRRqRs3wOVFSgSkEApQYRGGgf_3OnSc7n4bGgbCjpS3aL8aB3jnRfaIPdG_u0co62LeM90ePmxZHAQcL_kjTKODSuYbmO8R2BtE6-wG0"
            />
          </div>

          {/* Footer Policy Links */}
          <div className="mt-auto pt-8 text-xs text-slate-400 space-y-4 z-10">
            <p className="">
              By proceeding, you agree to the{" "}
              <Link className="text-brand-teal hover:underline font-semibold" href="/terms" target="_blank">
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link className="text-brand-teal hover:underline font-semibold" href="/privacy-policy" target="_blank">
                Privacy Policy
              </Link>
            </p>
            <div className="flex justify-center space-x-6">
              <Link className="hover:text-brand-teal transition-colors" href="#">Help</Link>
              <Link className="hover:text-brand-teal transition-colors" href="#">Privacy</Link>
              <Link className="hover:text-brand-teal transition-colors" href="#">Terms</Link>
            </div>
          </div>
          
          {/* Atmospheric subtle gradient */}
          <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-[#2c5f71]/5 blur-[120px] rounded-full"></div>
        </section>
        {/* END: LeftSection */}

        {/* Right Section (Login Form) */}
        <section className="flex-1 bg-surface-container-lowest p-8 md:p-16 flex flex-col justify-center" data-purpose="form-section">
          <div className="max-w-md w-full mx-auto">
            {children}
          </div>
        </section>
        {/* END: RightSection */}
      </main>
    </div>
  );
};

export default LoginLayout;
