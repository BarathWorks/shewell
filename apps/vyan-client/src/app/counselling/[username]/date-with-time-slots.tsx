// "use client";
// import UIFormLabel from "@repo/ui/src/@/components/form/label";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@repo/ui/src/@/components/select";
// import { add, addDays, isAfter, startOfDay, startOfToday, subDays } from "date-fns";
// import { format } from "date-fns";
// import { useEffect, useState } from "react";
// import { api } from "~/trpc/react";
// interface ITimeSlot {
//   availableTimings: {
//     startingTime: Date;
//     endingTime: Date;
//   }[];
// }
// const TimeSlots = ({ expertId }: { expertId: string }) => {
//   const { data: minTimeDuration } =
//     api.appointmentTimeDuration.appointmentTimeDuration.useQuery({
//       professionalUserId: expertId,
//     });
//   const today = new Date();
//   const [startDate, setStartDate] = useState<Date>(new Date());
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
//   const [timeDuration, setTimeDuration] = useState<number>();
//   const [timeSlots, setTimeSlots] = useState<ITimeSlot[]>([]);
//   //   array in which days are stored
//   const days: Date[] = [];
//   //   we are showing the four days
//   for (let i = 0; i < 4; i++) {
//     days.push(addDays(startDate, i));
//   }
//   //   back button will reduce the day from 1
//   const handleBack = () => {
//     setStartDate(subDays(startDate, 1));
//   };
//   //   next button will increase the day from 1
//   const handleNext = () => {
//     setStartDate(addDays(startDate, 1));
//   };

//   const isPrevDisabled = days[0]! <= today;
//   //   time slots for the selected date
//   const { data: timeSlotsData } = api.searchTimeSlots.searchTimeSlots.useQuery({
//     date: selectedDate,
//     expertId: expertId,
//   });
//   //   time duration for the appointments
//   const { data: timeDurations } =
//     api.appointmentTimeDuration.appointmentTimeDuration.useQuery({
//       professionalUserId: expertId,
//     });

//   console.log(minTimeDuration);
//   //   console.log(data);

//   //   setting the time slots in the state and converting the time slots into the required interface
//   useEffect(() => {
//     if (timeSlotsData?.timeSlots) {
//       const availableTimeSlots = timeSlotsData.timeSlots.flatMap((slot) =>
//         slot.availableTimings.map((timing) => ({
//           startTime: new Date(timing.startingTime),
//           endTime: new Date(timing.endingTime),
//         })),
//       );

//       // console.log("", availableTimeSlots[0]?.startTime);

//       if (minTimeDuration && availableTimeSlots.length > 0) {
//         setTimeSlots(
//           generateTimeSlots(
//             availableTimeSlots,
//             minTimeDuration.minTimeDuration?.time!,
//           ),
//         );
//       }
//       if (timeDuration && availableTimeSlots.length > 0) {
//         setTimeSlots(generateTimeSlots(availableTimeSlots, timeDuration));
//       }
//     }
//   }, [timeSlotsData, timeDuration, minTimeDuration]);

//   // function to break the time slots on the basis of time duration
//   // const generateTimeSlots = (
//   //   timeSlots: { startTime: Date; endTime: Date }[],
//   //   duration: number,
//   // ): ITimeSlot[] => {
//   //   const generatedTimeSlots: ITimeSlot[] = [];

//   //   timeSlots.forEach((slot) => {
//   //     let currentTime = new Date(slot.startTime);
//   //     const endTime = new Date(slot.endTime);

//   //     while (currentTime.getTime() + duration * 60000 <= endTime.getTime()) {
//   //       generatedTimeSlots.push({
//   //         availableTimings: [
//   //           {
//   //             startingTime: new Date(currentTime),
//   //             endingTime: new Date(currentTime.getTime() + duration * 60000),
//   //           },
//   //         ],
//   //       });
//   //       currentTime.setMinutes(currentTime.getMinutes() + duration);
//   //     }
//   //   });
//   //   return generatedTimeSlots;
//   // };

//    const generateTimeSlots = (
//     timeSlots: { startTime: Date; endTime: Date }[],
//     duration: number,
//   ): ITimeSlot[] => {
//     const generatedTimeSlots: ITimeSlot[] = [];
//     const now = new Date();

//     timeSlots?.forEach((slot) => {
//       let currentTime = new Date(slot.startTime);
//       const endTime = new Date(slot.endTime);

//       const isToday = currentTime.toDateString() === now.toDateString();

//       if (isToday && currentTime < add(now, { hours: 2})) {
//         currentTime = add(now, { hours: 2 });
//       }

//       while (currentTime.getTime() + duration * 60000 <= endTime.getTime()) {
//         generatedTimeSlots.push({
//           availableTimings: [
//             {
//               startingTime: new Date(currentTime),
//               endingTime: new Date(currentTime.getTime() + duration * 60000),
//             },
//           ],
//         });
//         currentTime.setMinutes(currentTime.getMinutes() + duration);
//       }
//     });

//     return generatedTimeSlots;
//   };

//   return (
//     <>
//       <div className="flex items-center justify-between  border-b-2 border-[#C6E4E7] pb-[6px]">
//         <div className="font-inter text-[12px] sm:text-base font-semibold ">
//           {" "}
//           Available Time Slots
//         </div>

//         <div className="md:w-[103px] xl:w-[136px]">

//           <Select
//             value={
//               timeDuration?.toString() ||
//               minTimeDuration?.minTimeDuration?.time.toString()
//             }
//             onValueChange={(selectedValue) => {
//               setTimeDuration(parseInt(selectedValue));
//             }}
//           >
//             <SelectTrigger className="w-full px-2 ">
//               <SelectValue
//                 className="placeholder:font-inter placeholder:text-xs placeholder:font-normal placeholder:text-inactive 2xl:placeholder:text-sm "
//                 placeholder="Add Time"
//               />
//             </SelectTrigger>
//             <SelectContent className="bg-white">
//               <SelectGroup>
//                 {timeDurations?.timeDurations.map((timeDuration) => (
//                   <SelectItem
//                     key={timeDuration.time}
//                     value={timeDuration.time.toString()}
//                   >
//                     {timeDuration.time} Min
//                   </SelectItem>
//                 ))}
//               </SelectGroup>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       <div className="mt-[10px]">
//         <button disabled={isPrevDisabled} onClick={handleBack}>
//           <svg
//             width="12"
//             height="13"
//             viewBox="0 0 12 13"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               d="M6 12.5C7.60266 12.5 9.10938 11.8759 10.2427 10.7427C11.3759 9.60938 12 8.10266 12 6.5C12 4.89734 11.3759 3.39062 10.2427 2.25734C9.10938 1.12412 7.60266 0.5 6 0.5C4.39734 0.5 2.89062 1.12412 1.75734 2.25734C0.624118 3.39062 0 4.89734 0 6.5C0 8.10266 0.624118 9.60938 1.75734 10.7427C2.89062 11.8759 4.39734 12.5 6 12.5ZM6 1.4375C7.35225 1.4375 8.62355 1.96409 9.57973 2.92027C10.5359 3.87645 11.0625 5.14775 11.0625 6.5C11.0625 7.85225 10.5359 9.12355 9.57973 10.0797C8.62355 11.0359 7.35225 11.5625 6 11.5625C4.64777 11.5625 3.37645 11.0359 2.42027 10.0797C1.46409 9.12355 0.9375 7.85225 0.9375 6.5C0.9375 5.14775 1.46409 3.87645 2.42027 2.92027C3.37645 1.96409 4.64777 1.4375 6 1.4375ZM7.05788 9.31599L7.6538 8.59227L5.11275 6.5L7.6538 4.40773L7.05788 3.68401L3.63783 6.5L7.05788 9.31599Z"
//               fill="#00898F"
//             />
//           </svg>
//         </button>

//         {days.map((day) => (
//           <span
//             onClick={() => setSelectedDate(day)}
//             key={day.toISOString()}
//             className={`pb-[6px] mx-[10px]  font-inter text-xs sm:text-sm font-normal 2xl:text-base ${
//               format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
//                 ? " border-b-[2px] border-primary"
//                 : ""
//             }`}
//             style={{
//               // margin: "0 5px",
//               cursor: "pointer",
//               boxSizing: "border-box",
//               paddingBottom:
//                 format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
//                   ? "2px"
//                   : "6px",
//             }}
//             // onClick={() => handleDayClick(day)}
//           >
//             {format(day, "d LLL")}
//           </span>
//         ))}
//         <button onClick={handleNext}>
//           <svg
//             width="12"
//             height="13"
//             viewBox="0 0 12 13"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               d="M6 12.5C7.60266 12.5 9.10938 11.8759 10.2427 10.7427C11.3759 9.60938 12 8.10266 12 6.5C12 4.89734 11.3759 3.39062 10.2427 2.25734C9.10938 1.12412 7.60266 0.5 6 0.5C4.39734 0.5 2.89062 1.12412 1.75734 2.25734C0.624118 3.39062 0 4.89734 0 6.5C0 8.10266 0.624118 9.60938 1.75734 10.7427C2.89062 11.8759 4.39734 12.5 6 12.5ZM6 1.4375C7.35225 1.4375 8.62355 1.96409 9.57973 2.92027C10.5359 3.87645 11.0625 5.14775 11.0625 6.5C11.0625 7.85225 10.5359 9.12355 9.57973 10.0797C8.62355 11.0359 7.35225 11.5625 6 11.5625C4.64777 11.5625 3.37645 11.0359 2.42027 10.0797C1.46409 9.12355 0.9375 7.85225 0.9375 6.5C0.9375 5.14775 1.46409 3.87645 2.42027 2.92027C3.37645 1.96409 4.64777 1.4375 6 1.4375ZM4.94212 9.31599L4.3462 8.59227L6.88725 6.5L4.3462 4.40773L4.94212 3.68401L8.36217 6.5L4.94212 9.31599Z"
//               fill="#00898F"
//             />
//           </svg>
//         </button>
//       </div>
//       {/* <span onClick={handleBack}>Back</span>
//       {days.map((item) => {
//         return (
//           <>
//             <span onClick={() => setSelectedDate(item)}>
//               {format(item, "d MMM")}
//             </span>
//           </>
//         );
//       })}

//       <span onClick={handleNext}>next</span> */}

//       {/* {timeSlots.map((item) =>
//         item.availableTimings.map((obj) => {
//           return (
//             <>
//               {" "}
//               {obj.startingTime.toString()} {obj.endingTime.toString()}
//             </>
//           );
//         }),
//       )} */}

//       <div className="mt-[18px] h-[85px] overflow-y-scroll ">
//         {timeSlots.length > 0 ? (
//           <div className="flex flex-wrap gap-[18px]">
//             {timeSlots.map((slot, index) => (
//               <div key={index} className="flex flex-col gap-2">
//                 {slot.availableTimings.map((timing, idx) => (
//                   <div key={idx} className="flex items-center">
//                     <span
//                       className={`cursor-pointer rounded-md border border-primary px-2 py-1 font-inter text-sm font-medium text-black hover:bg-primary hover:text-white `}
//                     >
//                       {format(timing.startingTime, "h:mm a")} -{" "}
//                       {format(timing.endingTime, "h:mm a")}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p>No available time slots.</p>
//         )}
//       </div>
//     </>
//   );
// };
// export default TimeSlots;

// "use client";
// import React, { useState, useEffect, useCallback } from "react";
// import { toZonedTime } from "date-fns-tz";
// import {
//   addDays,
//   subDays,
//   format,
//   startOfToday,
//   isAfter,
//   isBefore,
//   getHours,
//   getMinutes,
//   addMinutes,
//   isToday,
//   endOfDay,
// } from "date-fns";
// import { api } from "~/trpc/react";
// import UIFormLabel from "@repo/ui/src/@/components/form/label";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@repo/ui/src/@/components/select";
// import { add } from "date-fns";
// interface TimeSlot {
//   availableTimings: {
//     startingTime: Date;
//     endingTime: Date;
//   }[];
// }

// const TimeSlots = ({
//   professionalUserId,
//   // onSelectDuration,
//   // onSelectDateTime,
//   // isCouple
//   // reSelectTimeSlot,
// }: {
//   professionalUserId: string;
//   // onSelectDuration: (duration: number) => void;
//   // // isCouple : boolean
//   // onSelectDateTime: (dateTime: {
//   //   date: Date;
//   //   // timeSlots: { startTime: Date; endTime: Date }[];
//   //   timeSlots: { startTime: Date; endTime: Date } | null;
//   //   priceInCents: number | null;
//   // }) => void;
//   // reSelectTimeSlot: () => void;
// }) => {
//   const today = startOfToday();
//   const [startDate, setStartDate] = useState<Date>(today);
//   const [selectedDate, setSelectedDate] = useState<Date>(today);
//   const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
//   // const [timeSlots, setTimeSlots] = useState<TimeSlot | null>(null)
//   const [minDuration, setMinDuration] = useState<number | null>(null);
//   const [timeDuration, setTimeDuration] = useState<number | null>(null);
//   const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
//     date: Date;
//     // timeSlots: { startTime: Date; endTime: Date }[];
//     timeSlots: { startTime: Date; endTime: Date } | null;
//     priceInCents: number | null;
//   }>();

//   const handlePrevDay = () => {
//     setStartDate((prevDate) => subDays(prevDate, 1));
//   };

//   const handleNextDay = () => {
//     setStartDate((prevDate) => addDays(prevDate, 1));
//   };

//   const handleDayClick = (date: Date) => {
//     setSelectedDate(date);

//     // console.log("selected Date On Click", selectedDate);
//   };

//   console.log("time slot in date time slots", selectedTimeSlot);
//   const handleTimeSlotClick = (
//     timing: { startTime: Date; endTime: Date },
//     priceInCents: number,
//   ) => {
//     const selectedDateTime = {
//       date: selectedDate,

//       timeSlots: { startTime: timing.startTime, endTime: timing.endTime },
//       priceInCents: priceInCents,
//     };
//     setSelectedTimeSlot(selectedDateTime);
//     // onSelectDateTime(selectedDateTime);

//     // console.log("selected time slot day", selectedDateTime.timeSlots);
//   };

//   const isPrevDisabled = startDate <= today;

//   const days: Date[] = [];
//   for (let i = 0; i < 3; i++) {
//     days.push(addDays(startDate, i));
//   }

//   // getting time slots based on the selecting day
//   const { data: timeSlotsData, refetch } =
//     api.searchTimeSlots.searchTimeSlots.useQuery(
//       {
//         date: endOfDay(selectedDate),
//         expertId: professionalUserId,
//       },
//       { enabled: true },
//     );

//   console.log("timeSlotsDataForSelectedDate", timeSlotsData);

//   // console.log(
//   //   "selected Date",
//   //   selectedDate,
//   //   timeSlotsData,
//   //   timeSlots,
//   //   // timeSlotsData?.timeSlots[0]?.availableTimings,
//   //   // timeSlotsData?.timeSlots[0]?.availableTimings
//   // );
//   const { data: minTimeDurationData } =
//     api.appointmentTimeDuration.appointmentTimeDuration.useQuery({
//       professionalUserId: professionalUserId,
//     });

//   const { data: timeDurations } =
//     api.appointmentTimeDuration.appointmentTimeDuration.useQuery({
//       professionalUserId: professionalUserId,
//     });
//   // console.log("timeDurations", timeDurations);
//   const { data: pricesInCents } = api.findPrice.findPrice.useQuery({
//     duration: timeDuration! || minTimeDurationData?.minTimeDuration?.time!,
//     expertId: professionalUserId,
//     // couple :isCouple
//   });

//   useEffect(() => {
//     refetch();
//   }, [selectedDate, refetch]);

//   useEffect(() => {
//     if (minTimeDurationData?.minTimeDuration) {
//       setMinDuration(minTimeDurationData.minTimeDuration.time);
//       // onSelectDuration(minTimeDurationData.minTimeDuration.time);
//     }
//   }, [minTimeDurationData]);

//   useEffect(() => {
//     const availableTimeSlots =
//       timeSlotsData &&
//       timeSlotsData.timeSlots.flatMap((slot) =>
//         slot.availableTimings.map((timing) => ({
//           startTime: new Date(timing.startingTime),
//           endTime: new Date(timing.endingTime),
//         })),
//       );

//     if (minTimeDurationData) {
//       setTimeSlots(
//         generateTimeSlots(
//           availableTimeSlots!,
//           minTimeDurationData.minTimeDuration?.time!,
//         ),
//       );
//       // console.log("timeSlotsForMinDuration", timeSlots)
//     }
//     if (timeDuration) {
//       if (timeDuration) {
//         setTimeSlots(generateTimeSlots(availableTimeSlots!, timeDuration));
//         // onSelectDuration(timeDuration);
//         // console.log("timeSlotsForTimeDuration", timeSlots)
//       }
//     }
//   }, [timeSlotsData, timeDuration, minTimeDurationData, selectedDate]);

//   console.log("timeSlotsInStateAfterUseEffect", timeSlots);
//   // console.log(
//   //   "selected Date",
//   //   selectedDate,
//   //   timeSlotsData,
//   //   timeSlots,

//   // );
//   // useEffect(() => {
//   //   if (timeSlotsData?.timeSlots) {
//   //     const availableTimeSlots = timeSlotsData.timeSlots.flatMap((slot) =>
//   //       slot.availableTimings.map((timing) => ({
//   //         startTime: new Date(timing.startingTime),
//   //         endTime: new Date(timing.endingTime),
//   //       })),
//   //     );

//   //     if (minTimeDurationData && availableTimeSlots.length > 0) {
//   //       const generatedSlots = generateTimeSlots(
//   //         availableTimeSlots,
//   //         minTimeDurationData.minTimeDuration?.time!,
//   //       );
//   //       setTimeSlots(filterTimeSlotsForToday(generatedSlots));
//   //     }
//   //     if (timeDuration && availableTimeSlots.length > 0) {
//   //       const generatedSlots = generateTimeSlots(
//   //         availableTimeSlots,
//   //         timeDuration,
//   //       );
//   //       setTimeSlots(filterTimeSlotsForToday(generatedSlots));
//   //       onSelectDuration(timeDuration);
//   //     }
//   //   }
//   // }, [timeSlotsData, timeDuration, minTimeDurationData, selectedDate]);
//   // useEffect(() => {
//   //   if (timeSlotsData?.timeSlots) {
//   //     const availableTimeSlots = timeSlotsData.timeSlots.flatMap((slot) =>
//   //       slot.availableTimings.map((timing) => ({
//   //         startTime: new Date(timing.startingTime),
//   //         endTime: new Date(timing.endingTime),
//   //       }))
//   //     );

//   //     if (minTimeDurationData && availableTimeSlots.length > 0) {
//   //       setTimeSlots(
//   //         generateTimeSlots(availableTimeSlots, minTimeDurationData.minTimeDuration?.time!, selectedDate)
//   //       );
//   //     }
//   //     if (timeDuration && availableTimeSlots.length > 0) {
//   //       setTimeSlots(generateTimeSlots(availableTimeSlots, timeDuration, selectedDate));
//   //     }
//   //   }
//   // }, [timeSlotsData, timeDuration, minTimeDurationData, selectedDate]);

//   // working generate time slots
//   // const generateTimeSlots = (
//   //   timeSlots: { startTime: Date; endTime: Date }[],
//   //   duration: number,
//   // ): TimeSlot[] => {
//   //   const generatedTimeSlots: TimeSlot[] = [];

//   //   timeSlots?.forEach((slot) => {
//   //     let currentTime = new Date(slot.startTime);
//   //     const endTime = new Date(slot.endTime);

//   //     while (currentTime.getTime() + duration * 60000 <= endTime.getTime()) {
//   //       generatedTimeSlots.push({
//   //         availableTimings: [
//   //           {
//   //             startingTime: new Date(currentTime),
//   //             endingTime: new Date(currentTime.getTime() + duration * 60000),
//   //           },
//   //         ],
//   //       });
//   //       currentTime.setMinutes(currentTime.getMinutes() + duration);
//   //     }
//   //   });

//   //   return generatedTimeSlots;
//   // };

//   const generateTimeSlots = (
//     timeSlots: { startTime: Date; endTime: Date }[],
//     duration: number,
//   ): TimeSlot[] => {
//     const generatedTimeSlots: TimeSlot[] = [];

//     timeSlots?.forEach((slot) => {
//       let currentTime = new Date(slot.startTime);
//       const endTime = new Date(slot.endTime);

//       while (
//         isBefore(currentTime, endTime) ||
//         currentTime.getTime() === endTime.getTime()
//       ) {
//         const endingTime = addMinutes(currentTime, duration);

//         // Ensure the generated time slot doesn't exceed the end time
//         if (
//           isBefore(endingTime, endTime) ||
//           endingTime.getTime() === endTime.getTime()
//         ) {
//           generatedTimeSlots.push({
//             availableTimings: [
//               {
//                 startingTime: currentTime,
//                 endingTime,
//               },
//             ],
//           });
//         }

//         currentTime = addMinutes(currentTime, duration);
//       }
//     });

//     return generatedTimeSlots;
//   };

//   return (
//     <>
//       <div className="flex flex-wrap justify-between  ">
//         <div className=" flex flex-wrap items-center gap-y-2">
//           <button onClick={handlePrevDay} disabled={isPrevDisabled}>
//             <svg
//               width="12"
//               height="13"
//               viewBox="0 0 12 13"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 d="M6 12.5C7.60266 12.5 9.10938 11.8759 10.2427 10.7427C11.3759 9.60938 12 8.10266 12 6.5C12 4.89734 11.3759 3.39062 10.2427 2.25734C9.10938 1.12412 7.60266 0.5 6 0.5C4.39734 0.5 2.89062 1.12412 1.75734 2.25734C0.624118 3.39062 0 4.89734 0 6.5C0 8.10266 0.624118 9.60938 1.75734 10.7427C2.89062 11.8759 4.39734 12.5 6 12.5ZM6 1.4375C7.35225 1.4375 8.62355 1.96409 9.57973 2.92027C10.5359 3.87645 11.0625 5.14775 11.0625 6.5C11.0625 7.85225 10.5359 9.12355 9.57973 10.0797C8.62355 11.0359 7.35225 11.5625 6 11.5625C4.64777 11.5625 3.37645 11.0359 2.42027 10.0797C1.46409 9.12355 0.9375 7.85225 0.9375 6.5C0.9375 5.14775 1.46409 3.87645 2.42027 2.92027C3.37645 1.96409 4.64777 1.4375 6 1.4375ZM7.05788 9.31599L7.6538 8.59227L5.11275 6.5L7.6538 4.40773L7.05788 3.68401L3.63783 6.5L7.05788 9.31599Z"
//                 fill="#00898F"
//               />
//             </svg>
//           </button>
//           {days.map((day) => (
//             <span
//               key={day.toISOString()}
//               className={`pb-[6px] font-inter font-normal xs:text-xs sm:text-sm 2xl:text-base ${
//                 format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
//                   ? " border-b-[2px] border-primary"
//                   : ""
//               }`}
//               style={{
//                 margin: "0 10px",
//                 cursor: "pointer",
//                 boxSizing: "border-box",
//                 paddingBottom:
//                   format(day, "yyyy-MM-dd") ===
//                   format(selectedDate, "yyyy-MM-dd")
//                     ? "2px"
//                     : "6px",
//               }}
//               onClick={() => {
//                 handleDayClick(day);

//                 // const newTimeSlot = {
//                 //   date: day,
//                 //   timeSlots: null,
//                 //   priceInCents: null,
//                 // };
//                 // setSelectedTimeSlot(newTimeSlot);
//                 // onSelectDateTime(selectedTimeSlot!);
//                 // console.log(
//                 //   "time slots in dateTimeSlot on day clicking",
//                 //   selectedTimeSlot,
//                 // );
//                 // console.log("date while clicking", day, selectedDate);
//               }}
//             >
//               {format(day, "d LLL")}
//             </span>
//           ))}

//           <button onClick={handleNextDay}>
//             <svg
//               width="12"
//               height="13"
//               viewBox="0 0 12 13"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 d="M6 12.5C7.60266 12.5 9.10938 11.8759 10.2427 10.7427C11.3759 9.60938 12 8.10266 12 6.5C12 4.89734 11.3759 3.39062 10.2427 2.25734C9.10938 1.12412 7.60266 0.5 6 0.5C4.39734 0.5 2.89062 1.12412 1.75734 2.25734C0.624118 3.39062 0 4.89734 0 6.5C0 8.10266 0.624118 9.60938 1.75734 10.7427C2.89062 11.8759 4.39734 12.5 6 12.5ZM6 1.4375C7.35225 1.4375 8.62355 1.96409 9.57973 2.92027C10.5359 3.87645 11.0625 5.14775 11.0625 6.5C11.0625 7.85225 10.5359 9.12355 9.57973 10.0797C8.62355 11.0359 7.35225 11.5625 6 11.5625C4.64777 11.5625 3.37645 11.0359 2.42027 10.0797C1.46409 9.12355 0.9375 7.85225 0.9375 6.5C0.9375 5.14775 1.46409 3.87645 2.42027 2.92027C3.37645 1.96409 4.64777 1.4375 6 1.4375ZM4.94212 9.31599L4.3462 8.59227L6.88725 6.5L4.3462 4.40773L4.94212 3.68401L8.36217 6.5L4.94212 9.31599Z"
//                 fill="#00898F"
//               />
//             </svg>
//           </button>
//         </div>

//         {/* add time */}
//         <div className="mt-3 md:ml-4 ">
//           <UIFormLabel className="font-inter text-sm font-medium text-active 2xl:text-base ">
//             Add Time
//           </UIFormLabel>

//           <Select
//             value={
//               timeDuration?.toString() ||
//               minTimeDurationData?.minTimeDuration?.time.toString()
//             }
//             onValueChange={(selectedValue) => {
//               setTimeDuration(parseInt(selectedValue));
//               // onSelectDuration(
//               //   parseInt(selectedValue) ||
//               //     minTimeDurationData?.minTimeDuration?.time!,
//               // );
//             }}
//           >
//             <SelectTrigger className="w-full">
//               <SelectValue
//                 className="placeholder:font-inter placeholder:text-xs placeholder:font-normal placeholder:text-inactive 2xl:placeholder:text-sm"
//                 placeholder="Select"
//               />
//             </SelectTrigger>
//             <SelectContent className="bg-white">
//               <SelectGroup>
//                 {timeDurations?.timeDurations.map((timeDuration) => (
//                   <SelectItem
//                     key={timeDuration.time}
//                     value={timeDuration.time.toString()}
//                   >
//                     {timeDuration.time} Min
//                   </SelectItem>
//                 ))}
//               </SelectGroup>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>
//       <div className="mt-[18px] h-[78px] overflow-y-scroll ">
//         {timeSlots.length > 0 ? (
//           <div className="flex flex-wrap gap-[18px]">
//             {timeSlots.map((slot, index) => (
//               <div key={index} className="flex flex-col gap-2">
//                 {slot.availableTimings.map((timing, idx) => (
//                   <div key={idx} className="flex items-center">
//                     <span
//                       className={`cursor-pointer rounded-md border border-primary px-2 py-1 font-inter text-sm font-medium text-black hover:bg-primary hover:text-white ${
//                         selectedTimeSlot &&
//                         selectedTimeSlot.date === selectedDate &&
//                         selectedTimeSlot.timeSlots?.startTime ===
//                           timing.startingTime
//                           ? "bg-primary text-white"
//                           : ""
//                       }`}
//                       onClick={() =>
//                         handleTimeSlotClick(
//                           {
//                             startTime: timing.startingTime,
//                             endTime: timing.endingTime,
//                           },
//                           pricesInCents?.price?.priceInCentsForSingle!,
//                         )
//                       }
//                     >
//                       {format(timing.startingTime, "h:mm a")} -{" "}
//                       {format(timing.endingTime, "h:mm a")}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p>No available time slots.</p>
//         )}
//       </div>
//     </>
//   );
// };

// export default TimeSlots;

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";
import { toZonedTime } from "date-fns-tz";
import {
  addDays,
  subDays,
  format,
  startOfToday,
  isAfter,
  isBefore,
  getHours,
  getMinutes,
  addMinutes,
  isToday,
  endOfDay,
} from "date-fns";
import { api } from "~/trpc/react";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import { add } from "date-fns";
interface TimeSlot {
  availableTimings: {
    startingTime: Date;
    endingTime: Date;
  }[];
}

const TimeSlots = ({
  professionalUserId,
  // onSelectDuration,
  // onSelectDateTime,
  // isCouple
  // reSelectTimeSlot,
}: {
  professionalUserId: string;
}) => {
  const today = startOfToday();
  const [startDate, setStartDate] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  // const [timeSlots, setTimeSlots] = useState<TimeSlot | null>(null)
  const [minDuration, setMinDuration] = useState<number | null>(null);
  const [timeDuration, setTimeDuration] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    date: Date;
    // timeSlots: { startTime: Date; endTime: Date }[];
    timeSlots: { startTime: Date; endTime: Date } | null;
    priceInCents: number | null;
  }>();

  const handlePrevDay = () => {
    setStartDate((prevDate) => subDays(prevDate, 1));
  };

  const handleNextDay = () => {
    setStartDate((prevDate) => addDays(prevDate, 1));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);

    // console.log("selected Date On Click", selectedDate);
  };

  console.log("time slot in date time slots", selectedTimeSlot);
  const handleTimeSlotClick = (
    timing: { startTime: Date; endTime: Date },
    priceInCents: number,
  ) => {
    const selectedDateTime = {
      date: selectedDate,

      timeSlots: { startTime: timing.startTime, endTime: timing.endTime },
      priceInCents: priceInCents,
    };
    setSelectedTimeSlot(selectedDateTime);
    // onSelectDateTime(selectedDateTime);

    // console.log("selected time slot day", selectedDateTime.timeSlots);
  };

  const isPrevDisabled = startDate <= today;

  const days: Date[] = [];
  for (let i = 0; i < 4; i++) {
    days.push(addDays(startDate, i));
  }

  // getting time slots based on the selecting day
  const { data: timeSlotsData, refetch } =
    api.searchTimeSlots.searchTimeSlots.useQuery(
      {
        date: endOfDay(selectedDate),
        expertId: professionalUserId,
      },
      { enabled: true },
    );

  console.log("timeSlotsDataForSelectedDate", timeSlotsData);

  const { data: timeDurationData } =
    api.appointmentTimeDuration.appointmentTimeDuration.useQuery({
      professionalUserId: professionalUserId,
    });
  const { data: pricesInCents } = api.findPrice.findPrice.useQuery({
    duration: timeDuration! || timeDurationData?.minTimeDuration?.time!,
    expertId: professionalUserId,
    // couple :isCouple
  });

  useEffect(() => {
    refetch();
  }, [selectedDate, refetch]);

  useEffect(() => {
    if (timeDurationData?.minTimeDuration) {
      setMinDuration(timeDurationData.minTimeDuration.time);
      // onSelectDuration(timeDurationData.minTimeDuration.time);
    }
  }, [timeDurationData]);

  useEffect(() => {
    const availableTimeSlots =
      timeSlotsData &&
      timeSlotsData.timeSlots.flatMap((slot) =>
        slot.availableTimings.map((timing) => ({
          startTime: new Date(timing.startingTime),
          endTime: new Date(timing.endingTime),
        })),
      );

    if (timeDurationData) {
      setTimeSlots(
        generateTimeSlots(
          availableTimeSlots!,
          timeDurationData.minTimeDuration?.time!,
        ),
      );
      // console.log("timeSlotsForMinDuration", timeSlots)
    }
    if (timeDuration) {
      if (timeDuration) {
        setTimeSlots(generateTimeSlots(availableTimeSlots!, timeDuration));
        // onSelectDuration(timeDuration);
        // console.log("timeSlotsForTimeDuration", timeSlots)
      }
    }
  }, [timeSlotsData, timeDuration, timeDurationData, selectedDate]);

  console.log("timeSlotsInStateAfterUseEffect", timeSlots);

  // working generate time slots
  // const generateTimeSlots = (
  //   timeSlots: { startTime: Date; endTime: Date }[],
  //   duration: number,
  // ): TimeSlot[] => {
  //   const generatedTimeSlots: TimeSlot[] = [];

  //   timeSlots?.forEach((slot) => {
  //     let currentTime = new Date(slot.startTime);
  //     const endTime = new Date(slot.endTime);

  //     while (currentTime.getTime() + duration * 60000 <= endTime.getTime()) {
  //       generatedTimeSlots.push({
  //         availableTimings: [
  //           {
  //             startingTime: new Date(currentTime),
  //             endingTime: new Date(currentTime.getTime() + duration * 60000),
  //           },
  //         ],
  //       });
  //       currentTime.setMinutes(currentTime.getMinutes() + duration);
  //     }
  //   });

  //   return generatedTimeSlots;
  // };

  const generateTimeSlots = (
    timeSlots: { startTime: Date; endTime: Date }[],
    duration: number,
  ): TimeSlot[] => {
    const generatedTimeSlots: TimeSlot[] = [];

    timeSlots?.forEach((slot) => {
      let currentTime = new Date(slot.startTime);
      const endTime = new Date(slot.endTime);

      while (
        isBefore(currentTime, endTime) ||
        currentTime.getTime() === endTime.getTime()
      ) {
        const endingTime = addMinutes(currentTime, duration);

        // Ensure the generated time slot doesn't exceed the end time
        if (
          isBefore(endingTime, endTime) ||
          endingTime.getTime() === endTime.getTime()
        ) {
          generatedTimeSlots.push({
            availableTimings: [
              {
                startingTime: currentTime,
                endingTime,
              },
            ],
          });
        }

        currentTime = addMinutes(currentTime, duration);
      }
    });

    return generatedTimeSlots;
  };

  return (
    <>
      <div className="mb-6 flex items-center gap-2">
        <Clock className="h-5 w-5 text-[#00898F]" />
        <span className="font-poppins text-lg font-semibold text-[#333333]">
          Available Time Slots
        </span>
      </div>
      <div className="mb-6 mt-4 h-px w-full bg-gray-100"></div>
      <div className="flex flex-wrap justify-between gap-y-5">
        <div className="flex items-center gap-2 rounded-2xl bg-[#F8F8F8] p-1.5">
          <button
            onClick={handlePrevDay}
            disabled={isPrevDisabled}
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition-all hover:bg-gray-50 ${isPrevDisabled ? "cursor-not-allowed opacity-50" : "hover:text-[#00898F]"}`}
          >
            <svg
              width="8"
              height="12"
              viewBox="0 0 8 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 11L1.5 6L6.5 1"
                stroke="#333333"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="scrollbar-hide flex gap-1 overflow-x-auto px-1">
            {days.map((day) => (
              <div
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl px-4 py-2 transition-all duration-300 ${
                  format(day, "yyyy-MM-dd") ===
                  format(selectedDate, "yyyy-MM-dd")
                    ? "border-0 bg-[#00898F] text-white shadow-md"
                    : "border-0 bg-transparent text-[#666666] hover:bg-white hover:text-[#00898F]"
                }`}
              >
                <span className="text-xs font-medium uppercase opacity-80">
                  {format(day, "EEE")}
                </span>
                <span className="text-sm font-semibold">
                  {format(day, "d")}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={handleNextDay}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition-all hover:bg-gray-50 hover:text-[#00898F]"
          >
            <svg
              width="8"
              height="12"
              viewBox="0 0 8 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.5 1L6.5 6L1.5 11"
                stroke="#333333"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* add time */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#333333]">Duration:</span>
          <Select
            value={
              timeDuration?.toString() ||
              timeDurationData?.minTimeDuration?.time.toString()
            }
            onValueChange={(selectedValue: string) => {
              setTimeDuration(parseInt(selectedValue));
            }}
          >
            <SelectTrigger className="w-[120px] rounded-xl border-gray-200 bg-white font-medium text-[#333333] shadow-sm">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-100 bg-white shadow-lg">
              <SelectGroup>
                {timeDurationData?.timeDurations.map((timeDuration) => (
                  <SelectItem
                    className="cursor-pointer rounded-lg bg-white px-2 py-1.5 text-sm font-medium text-[#333333] hover:bg-gray-50"
                    key={timeDuration.time}
                    value={timeDuration.time.toString()}
                  >
                    {timeDuration.time} Min
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div
        className={`mt-[18px] ${timeSlots.length > 0 ? "max-h-[78px] overflow-y-auto" : ""}`}
      >
        {timeSlots.length > 0 ? (
          <div className="flex flex-wrap gap-[18px]">
            {timeSlots.map((slot, index) => (
              <div key={index} className="flex flex-col gap-2">
                {slot.availableTimings.map((timing, idx) => (
                  <div key={idx} className="flex items-center">
                    <span
                      className={`cursor-pointer rounded-md border border-primary px-2 py-1 font-inter text-sm font-medium text-black hover:bg-primary hover:text-white ${
                        selectedTimeSlot &&
                        selectedTimeSlot.date === selectedDate &&
                        selectedTimeSlot.timeSlots?.startTime ===
                          timing.startingTime
                          ? "bg-primary text-white"
                          : ""
                      }`}
                      onClick={() =>
                        handleTimeSlotClick(
                          {
                            startTime: timing.startingTime,
                            endTime: timing.endingTime,
                          },
                          pricesInCents?.price?.priceInCentsForSingle!,
                        )
                      }
                    >
                      {format(timing.startingTime, "h:mm a")} -{" "}
                      {format(timing.endingTime, "h:mm a")}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 flex min-h-[100px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-[#FCFCFD]">
            <div className="flex flex-col items-center gap-2 text-[#999999]">
              <Clock className="h-6 w-6 opacity-50" />
              <p className="text-sm font-medium">
                No available slots for this date
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TimeSlots;
