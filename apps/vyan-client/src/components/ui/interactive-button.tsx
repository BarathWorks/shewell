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
  color = "bg-[#00898F]",
  active = false,
  size = "medium",
  as: Component = "button",
}) => {
  const baseProps = {
    onClick,
    className: `
      group 
      flex ${size === "small" ? "h-8 w-8" : size === "large" ? "h-16 w-16" : "h-12 w-12"}
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
        size={64}
        strokeWidth={1.25}
        color="currentColor"
        className={`
          
          ${active ? `rotate-[45deg]`  : `rotate-[225deg]`}
          ${active ? `text-[#00898F]` : `text-[#E1EBED] `} 
          transition-all duration-500 ease-in-out
          group-hover:rotate-[45deg]
          group-hover:text-[#00898F]
        `}
      />
    </Component>
  );
};

InteractiveButton.displayName = "InteractiveButton";

