"use client";

import React from "react";
import { ArrowUp } from "lucide-react";

interface InteractiveButtonProps {
  onClick?: () => void;
  className?: string; // Optional: allows adding external margins
  color?: string;
  active?: Boolean;
  size?: "small" | "medium" | "large" | "xlarge";
  as?: "button" | "span" | "div"; // Allows rendering as different elements to avoid nested buttons
  variant?: "default" | "reverse";
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  onClick,
  
  className = "",
  color = "bg-[#00898F]",
  active = false,
  size = "medium",
  as: Component = "button",
  variant = "default",
}) => {
  const sizeClasses = {
    small: "h-5 sm:h-6 md:h-7 w-5 sm:w-6 md:w-7",
    medium: "h-7 sm:h-8 md:h-10 w-7 sm:w-8 md:w-10",
    large: "h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12",
    xlarge: "h-12 sm:h-14 md:h-[72px] w-12 sm:w-14 md:w-[72px]",
  };

  const arrowSizes = {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 44,
  };

  const baseProps = {
    onClick,
    className: `
      group 
      flex ${sizeClasses[size]}
      items-center justify-center 
      rounded-full
      outline-none transition-colors duration-300
      ease-in-out 
      ${Component === "button" ? "focus:ring-2 focus:ring-[#00898F] focus:ring-offset-2 active:scale-95" : ""}
      ${variant === "reverse"
        ? "bg-white border border-[#E1EBED] group-hover:bg-[#00898F] group-hover:border-[#00898F] active:bg-[#006e72] active:border-[#006e72]"
        : `hover:bg-white group-hover:bg-white group-active:bg-white ${active ? `bg-white` : `${color}`}`}
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
          transition-all duration-500 ease-in-out
          ${variant === "reverse"
            ? "text-[#00898F] rotate-[45deg] group-hover:text-white group-hover:rotate-[45deg] group-active:text-white"
            : `
              ${active ? `rotate-[45deg]`  : `rotate-[225deg]`}
              ${active ? `text-[#00898F]` : `text-[#E1EBED] `} 
              group-hover:rotate-[45deg]
              group-hover:text-[#00898F]
              group-active:rotate-[45deg]
              group-active:text-[#00898F]
            `}
        `}
      />
    </Component>
  );
};

InteractiveButton.displayName = "InteractiveButton";

