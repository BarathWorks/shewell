"use client";
import { AppointmentType } from "@repo/database";
import { format } from "date-fns";
import { env } from "~/env";
import Link from "next/link";

type IAppointmentData = {
  appointmentDate: Date;
  appointmentTime: Date;
  where: AppointmentType;
  professionalUserName: string;
  patientName: string;
  priceInCents: number;
  isCouple: boolean;
};

const AppointmentApproval = ({
  appointmentDate,
  appointmentTime,
  where,
  professionalUserName,
  patientName,
  priceInCents,
  isCouple,
}: IAppointmentData) => {
  const formattedDate = format(appointmentDate, "do MMMM, yyyy");
  const formattedTime = format(appointmentTime, "hh:mm a");
  const GST_RATE = parseInt(env.NEXT_PUBLIC_GST);
  const gstAmount = (GST_RATE / 100) * priceInCents;
  const totalWithGST = priceInCents + gstAmount;

  const InfoCard = ({
    icon,
    label,
    value,
    badge,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    badge?: React.ReactNode;
  }) => (
    <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E1EBED]/60">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <p className="truncate font-poppins text-sm font-bold text-[#0b1c30] sm:text-base">
            {value}
          </p>
          {badge}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5 pb-4 font-poppins">
      {/* Summary Header */}
      <div className="mb-1">
        <h2 className="text-lg font-bold text-[#0b1c30]">
          Appointment Summary
        </h2>
        <p className="text-sm text-gray-500">
          Review your details before confirming
        </p>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* When */}
        <InfoCard
          label="When"
          value={`${formattedDate} · ${formattedTime}`}
          icon={
            <svg width="20" height="20" viewBox="0 0 26 26" fill="none">
              <path
                d="M20.3121 4.0257H19.2319V3.19474C19.2319 2.73579 18.8599 2.36377 18.4009 2.36377C17.942 2.36377 17.57 2.73579 17.57 3.19474V4.0257H13.7891V3.19474C13.7891 2.73579 13.417 2.36377 12.9581 2.36377C12.4992 2.36377 12.1271 2.73579 12.1271 3.19474V4.0257H8.38778V3.19474C8.38778 2.73579 8.01576 2.36377 7.55682 2.36377C7.09788 2.36377 6.72585 2.73579 6.72585 3.19474V4.0257H5.68714C3.85437 4.0257 2.36328 5.51679 2.36328 7.34957V20.3126C2.36328 22.1454 3.85437 23.6365 5.68714 23.6365H12.044C12.503 23.6365 12.875 23.2645 12.875 22.8055C12.875 22.3466 12.503 21.9746 12.044 21.9746H5.68714C4.77076 21.9746 4.02521 21.229 4.02521 20.3126V7.34957C4.02521 6.43318 4.77076 5.68763 5.68714 5.68763H6.72585V6.5186C6.72585 6.97754 7.09788 7.34957 7.55682 7.34957C8.01576 7.34957 8.38778 6.97754 8.38778 6.5186V5.68763H12.1271V6.5186C12.1271 6.97754 12.4992 7.34957 12.9581 7.34957C13.417 7.34957 13.7891 6.97754 13.7891 6.5186V5.68763H17.57V6.5186C17.57 6.97754 17.942 7.34957 18.4009 7.34957C18.8599 7.34957 19.2319 6.97754 19.2319 6.5186V5.68763H20.3121C21.2285 5.68763 21.9741 6.43318 21.9741 7.34957V12.0861C21.9741 12.545 22.3461 12.917 22.805 12.917C23.264 12.917 23.636 12.545 23.636 12.0861V7.34957C23.636 5.51679 22.1449 4.0257 20.3121 4.0257Z"
                fill="#00898F"
              />
              <path
                d="M18.6094 13.582C15.8373 13.582 13.582 15.8373 13.582 18.6094C13.582 21.3815 15.8373 23.6367 18.6094 23.6367C21.3815 23.6367 23.6367 21.3815 23.6367 18.6094C23.6367 15.8373 21.3815 13.582 18.6094 13.582Z"
                fill="#00898F"
              />
            </svg>
          }
        />

        {/* Where */}
        <InfoCard
          label="Where"
          value={where}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M17 11.9995C17 14.7609 14.7614 16.9995 12 16.9995M17 11.9995C17 9.23809 14.7614 6.99951 12 6.99951M17 11.9995H15M12 16.9995C9.23858 16.9995 7 14.7609 7 11.9995M12 16.9995V14.9995M7 11.9995C7 9.23809 9.23858 6.99951 12 6.99951M7 11.9995H9M12 6.99951V8.99951"
                stroke="#00898F"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        {/* With */}
        <InfoCard
          label="Therapist"
          value={`Dr. ${professionalUserName}`}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M11.8317 11.5674C13.3959 11.5674 14.7502 11.0064 15.8571 9.89949C16.9636 8.7928 17.5248 7.43869 17.5248 5.87432C17.5248 4.31049 16.9638 2.95621 15.8569 1.84916C14.75 0.74265 13.3957 0.181641 11.8317 0.181641C10.2674 0.181641 8.91325 0.74265 7.80655 1.84934C6.69986 2.95603 6.13867 4.31031 6.13867 5.87432C6.13867 7.43869 6.69986 8.79298 7.80655 9.89967C8.91361 11.0062 10.2679 11.5674 11.8317 11.5674Z"
                fill="#00898F"
              />
            </svg>
          }
        />

        {/* Patient */}
        <InfoCard
          label="Patient"
          value={patientName}
          badge={
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                isCouple
                  ? "bg-[#E1EBED]/60 text-[#00898F] border-[#00898F]/15"
                  : "bg-[#f1f3f5] text-[#495057] border-gray-200"
              }`}
            >
              {isCouple ? "Couple" : "Individual"}
            </span>
          }
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21"
                stroke="#00898F"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
                stroke="#00898F"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 11L18 13L22 9"
                stroke="#00898F"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      </div>

      {/* Payment Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Payment Header */}
        <div className="flex items-center gap-3 border-b border-gray-50 bg-[#E1EBED]/20 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E1EBED]/60">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect
                x="2"
                y="5"
                width="20"
                height="14"
                rx="2"
                stroke="#00898F"
                strokeWidth="2"
              />
              <path d="M2 10H22" stroke="#00898F" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-[#0b1c30]">Payment Details</p>
            <p className="text-xs text-gray-500">
              {isCouple ? "Couple" : "Individual"} therapy · Virtual appointment
            </p>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="flex flex-col gap-2 px-5 py-4 font-poppins">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 font-medium">Sub Total</span>
            <span className="font-bold text-[#0b1c30]">
              INR {priceInCents}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 font-medium">GST ({GST_RATE}%)</span>
            <span className="font-bold text-[#00898F]">
              + INR {gstAmount}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-dashed border-gray-100 pt-3">
            <span className="font-bold text-[#0b1c30]">Total</span>
            <span className="text-lg font-bold text-[#00898F]">
              INR {totalWithGST}
            </span>
          </div>
        </div>

        {/* Terms */}
        <div className="border-t border-gray-50 px-5 py-3 text-xs text-gray-400">
          By proceeding, you agree to the{" "}
          <Link
            href="/terms"
            target="_blank"
            className="text-[#00898F] hover:underline font-semibold"
          >
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-[#00898F] hover:underline font-semibold">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AppointmentApproval;
