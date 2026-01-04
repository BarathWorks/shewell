"use client";

import React from "react";
import { ArrowUp } from "lucide-react";

interface InteractiveButtonProps {
  onClick?: () => void;
  className?: string; // Optional: allows adding external margins
  color?: string;
  active : Boolean;
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  onClick,
  className = "",
  color = "bg-[#00898F]",
  active = false,
}) => {
  return (
    <button
      onClick={onClick}
      aria-label="Toggle direction"
      // 'group' is essential here to trigger the icon rotation on hover
      className={`
        group 
        flex items-center justify-center 
        w-16 h-16 
        rounded-full
        hover:bg-white
        group-hover:bg-white
        ${active ? `bg-white` : `${color}`} 
        transition-colors duration-300 ease-in-out
        active:scale-95 
        outline-none focus:ring-2 focus:ring-[#00898F] focus:ring-offset-2
        ${className}
      `}
    >
      {/* LUCIDE ICON
         - size: 24px (standard icon size)
         - strokeWidth: 2.5 (makes it bold like your design)
         - color: #00898F (Teal)
         - Rotation Logic: Starts at 30deg -> Rotates to 210deg on hover
      */}
      <ArrowUp
        size={64}
        strokeWidth={1.25}
        color="currentColor"
        className={`
          text-[#E1EBED]
          ${active ? `text-[#00898F] rotate-[30deg]` : `text-white`}
          group-hover:text-[#00898F]
          transition-all duration-500 ease-in-out
          rotate-[210deg]
          group-hover:rotate-[30deg]
        `}
      />
    </button>
  );
};

InteractiveButton.displayName = "InteractiveButton";
