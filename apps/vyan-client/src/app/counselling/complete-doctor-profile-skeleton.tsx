import React from "react";

const CompleteDoctorProfileSkeleton = () => {
  return (
    <div className="w-full">
      <div className="w-full max-w-[600px] mx-auto md:ml-0 md:mr-auto bg-white rounded-[24px] shadow-lg border border-[#c0c8cc]/30 p-5 md:p-6 space-y-5">
        {/* Header Section Placeholder */}
        <section className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Avatar Placeholder */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-[#eff4ff] bg-[#d3e4fe]/50 animate-pulse"></div>
          </div>
          
          {/* Doctor Details Placeholder */}
          <div className="flex-1 space-y-3 w-full">
            <div className="h-7 w-48 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-5 w-36 bg-gray-100 rounded animate-pulse"></div>
            
            {/* Tags Placeholder */}
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse"></div>
              <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse"></div>
            </div>
            
            {/* Rating Placeholder */}
            <div className="h-5 w-44 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </section>

        {/* Availability Section Placeholder */}
        <section className="space-y-6 border-t border-[#c0c8cc]/30 pt-6">
          <div className="h-6 w-44 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-16 w-full bg-[#eff4ff]/50 rounded-xl animate-pulse"></div>
        </section>
        
        {/* Footer Action Section Placeholder */}
        <footer className="border-t border-[#c0c8cc]/30 pt-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 h-12 bg-[#eff4ff]/50 rounded-xl animate-pulse w-full sm:w-auto"></div>
          <div className="w-full sm:flex-[2] h-12 bg-gray-100 rounded-xl animate-pulse"></div>
        </footer>
      </div>
    </div>
  );
};

export default CompleteDoctorProfileSkeleton;
