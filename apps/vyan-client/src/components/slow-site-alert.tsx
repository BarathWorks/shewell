"use client";
import React, { useState, useEffect } from "react";
import { X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const SlowSiteAlert = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show after a short delay for better UX
    const timer = setTimeout(() => {
      const isDismissed = localStorage.getItem("slow-site-alert-dismissed");
      if (!isDismissed) {
        setVisible(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 10000); // Auto dismiss after 10 seconds
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("slow-site-alert-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed top-24 right-4 z-[9999]"
        >
          <div className="flex items-center gap-3 rounded-xl border border-amber-200/50 bg-amber-50/90 backdrop-blur-md p-4 pr-10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] md:max-w-[280px]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100/80">
              <Info className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-poppins text-[10px] font-bold uppercase tracking-wider text-amber-600/70">
                Performance Note
              </span>
              <p className="font-inter text-xs font-medium text-amber-900/80 leading-snug">
                This website might experience slowness in some areas. Our team is working on optimization.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="absolute right-2 top-2 rounded-full p-1.5 hover:bg-amber-100/50 transition-colors"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4 text-amber-700/60" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
