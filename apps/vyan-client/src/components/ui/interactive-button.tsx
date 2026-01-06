"use client";

import React from "react";
import { ArrowUp } from "lucide-react";

interface InteractiveButtonProps {
  onClick?: () => void;
  className?: string; // Optional: allows adding external margins
  color?: string;
  active?: Boolean;
  as?: "button" | "span" | "div"; // Allows rendering as different elements to avoid nested buttons
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  onClick,
  className = "",
  color = "bg-[#00898F]",
  active = false,
  as: Component = "button",
}) => {
  const baseProps = {
    onClick,
    className: `
      group 
      flex h-16 w-16 
      items-center justify-center 
      rounded-full
      hover:bg-white
      group-hover:bg-white
      ${active ? `bg-white` : `${color}`} 
      outline-none transition-colors duration-300
      ease-in-out 
      ${Component === "button" ? "focus:ring-2 focus:ring-[#00898F] focus:ring-offset-2 active:scale-95" : ""}
      ${className}
    `,
  };

  // Add aria-label only for button elements
  const ariaProps = Component === "button" ? { "aria-label": "Toggle direction" } : {};

  return (
    <Component {...baseProps} {...ariaProps}>
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
    </Component>
  );
};

InteractiveButton.displayName = "InteractiveButton";

