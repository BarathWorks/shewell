import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  setSeconds,
} from "date-fns";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const slugifyName = (str: string | undefined) => {
  return String(str)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const createTime = (hour: number, minute: number): Date => {
  const date = new Date();
  return setMinutes(setHours(date, hour), minute);
};

export const createTimeDate = (
  hour: number,
  minute: number,
  date: Date,
): Date => {
  // console.log("date", hour, minute, date);
  return setMinutes(setHours(date, hour), minute);
};

export const createTimeDateSeconds = (
  hour: number,
  minute: number,
  date: Date,
): Date => {
  return setSeconds(setMinutes(setHours(date, hour), minute), 0);
};

/**
 * Generates a login OTP.
 *
 * `Math.random` is a predictable PRNG and must never produce a credential: given a
 * few observed values its internal state can be recovered and subsequent codes
 * predicted, which for an OTP means signing in as somebody else. Uses the platform
 * CSPRNG instead.
 *
 * Rejection sampling keeps the digits uniform — taking a raw byte modulo 10 would
 * make 0–5 more likely than 6–9 (256 is not a multiple of 10).
 */
export const generateOtp = () => {
  const OTP_LENGTH = 6;
  const MAX_UNBIASED = 250; // largest multiple of 10 below 256
  let otp = "";

  while (otp.length < OTP_LENGTH) {
    const bytes = new Uint8Array(OTP_LENGTH);
    globalThis.crypto.getRandomValues(bytes);
    for (let i = 0; i < bytes.length && otp.length < OTP_LENGTH; i++) {
      const b = bytes[i]!;
      if (b < MAX_UNBIASED) otp += String(b % 10);
    }
  }

  return otp;
};

export function filterAvailableTimeSlots(
  timeSlots: {
    availableTimings: { startingTime: Date; endingTime: Date }[];
  }[],
  bookedSlots: { startingTime: Date; endingTime: Date }[],
) {
  // function to check if two time slots overlap
  const isOverlapping = (
    slot1: { startingTime: Date; endingTime: Date },
    slot2: { startingTime: Date; endingTime: Date },
  ) => {
    return (
      slot1.startingTime < slot2.endingTime &&
      slot1.endingTime > slot2.startingTime
    );
  };

  const filteredTimeSlots = timeSlots?.map((slot) => ({
    availableTimings: slot.availableTimings.filter((availableSlot) => {
      // Check if this available slot overlaps with any booked slot
      const hasOverlap = bookedSlots?.some((bookedSlot) =>
        isOverlapping(availableSlot, bookedSlot),
      );

      // Keep the slot only if there's no overlap
      return !hasOverlap;
    }),
  }));

  // Remove any groups that now have empty availableTimings
  return filteredTimeSlots?.filter((slot) => slot.availableTimings.length > 0);
}
