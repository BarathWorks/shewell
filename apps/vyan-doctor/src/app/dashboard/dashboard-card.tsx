"use client";
import * as React from "react";

const DashboardCard = ({
  title,
  number,
  change,
  percentage,
  bgColor,
  borderColor,
}: {
  title: string;
  number: number;
  change: number;
  percentage: number;
  bgColor: string;
  borderColor: string;
}) => {
  const isPositiveChange = change >= 0;

  return (
    <div
      className="rounded-2xl border border-gray-100 p-4 sm:p-6 xl:p-5 2xl:p-[26px] shadow-sm hover:shadow-md transition-shadow w-full"
      style={{ backgroundColor: bgColor }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between 2xl:mb-4">
        <h3 className="font-inter text-sm font-medium text-active lg:text-lg 2xl:text-2xl">
          {title}
        </h3>
        <div
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            isPositiveChange ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
          }`}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            {isPositiveChange ? (
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            )}
          </svg>
          <span>{isPositiveChange ? "+" : ""}{change.toFixed(1)}%</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-end justify-between">
        <div className="font-inter text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          {number.toLocaleString()}
        </div>
        <div className="font-inter text-xs sm:text-sm font-medium text-gray-500">
          {percentage.toFixed(0)}% of total
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;

