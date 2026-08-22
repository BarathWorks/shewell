"use client";

import React from "react";
import { ArrowUp } from "lucide-react";

interface InteractiveButtonProps {
  onClick?: () => void;
  className?: string; // Optional: allows adding external margins
  color?: string;
  active?: Boolean;
  size?: "small" | "medium" | "large";
  as?: "button" | "span" | "div"; // Allows rendering as different elements to avoid nested buttons
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  onClick,
  
  className = "",
  color = "bg-primary-600",
  active = false,
  size = "medium",
  as: Component = "button",
}) => {
  const sizeClasses = {
    small: "h-5 sm:h-6 md:h-7 w-5 sm:w-6 md:w-7",
    medium: "h-7 sm:h-8 md:h-10 w-7 sm:w-8 md:w-10",
    large: "h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12",
  };

  const arrowSizes = {
    small: 16,
    medium: 24,
    large: 32,
  };

  const baseProps = {
    onClick,
    className: `
      group 
      flex ${sizeClasses[size]}
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
      <ArrowUp
        size={arrowSizes[size]}
        strokeWidth={1.25}
        color="currentColor"
        className={`
          
          ${active ? `rotate-[45deg]`  : `rotate-[225deg]`}
          ${active ? `text-primary-700` : `text-[#E1EBED] `} 
          transition-all duration-500 ease-in-out
          group-hover:rotate-[45deg]
          group-hover:text-primary-700
        `}
      />
    </Component>
  );
};

InteractiveButton.displayName = "InteractiveButton";

