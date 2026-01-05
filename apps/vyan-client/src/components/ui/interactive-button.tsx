"use client";

import React from "react";
import { ArrowUp } from "lucide-react";

interface InteractiveButtonProps {
  onClick?: () => void;
  className?: string; // Optional: allows adding external margins
  color?: string;
  active?: Boolean;
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
        flex h-16 w-16 
        items-center justify-center 
        rounded-full
        hover:bg-white
        group-hover:bg-white
        ${active ? `bg-white` : `${color}`} 
        outline-none transition-colors duration-300
        ease-in-out 
        focus:ring-2 focus:ring-[#00898F] focus:ring-offset-2 active:scale-95
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
          ${active ? `rotate-[30deg] text-[#00898F]` : `text-white`}
          rotate-[210deg]
          transition-all duration-500 ease-in-out
          group-hover:rotate-[30deg]
          group-hover:text-[#00898F]
        `}
      />
    </button>
  );
};

InteractiveButton.displayName = "InteractiveButton";
