const AppointmentSkeleton = () => {
  return (
    <div className="w-full flex flex-col gap-4">
      {[...Array(2)].map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 p-4 rounded-md border border-hairline-strong animate-pulse md:flex-row md:justify-between"
        >
          {/* Left Section */}
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 bg-gray-100 rounded-md"></div>
              <div className="h-6 w-16 bg-gray-100 rounded-md"></div>
            </div>

            {/* Time & Duration */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-12 bg-gray-100 rounded-md"></div>
                <div className="h-4 w-20 bg-gray-100 rounded-md"></div>
              </div>
              <div className="h-4 w-24 bg-gray-100 rounded-md"></div>
            </div>

            {/* Participants */}
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-28 bg-gray-100 rounded-md"></div>
              <div className="h-6 w-20 bg-gray-100 rounded-md"></div>
            </div>
          </div>

          {/* Right Section */}
          <div className="self-end md:self-center">
            <div className="h-8 w-24 bg-gray-100 rounded-md"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentSkeleton;
