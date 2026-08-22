"use client";

import React from "react";

export type BadgeVariant = "specialization" | "language" | "status";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "language",
  className = "",
}) => {
  const variantClasses = {
    specialization: `
      rounded-full border border-primary-600/20 
      bg-gradient-to-r from-[#00898F]/10 to-[#51AF5A]/10 
      px-3 py-1.5 font-poppins text-xs font-medium text-primary-700
    `,
    language: `
      rounded-full border border-hairline bg-slate-50 
      px-3 py-1.5 font-poppins text-xs font-medium text-muted
    `,
    status: `
      rounded-full border border-primary/20 bg-primary/10 
      px-3 py-1.5 font-poppins text-xs font-medium text-primary
    `,
  };

  return (
    <span className={`inline-flex items-center ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

Badge.displayName = "Badge";
