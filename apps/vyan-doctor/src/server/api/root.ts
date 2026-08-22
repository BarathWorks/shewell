import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { searchMeetingRouter } from "./routers/findMeetingsForADay";
import { searchMeetingRouterForADayRange } from "./routers/findMeetingsforADayRange";
import { similarDoctorProfileRouter } from "./routers/similarDoctorProfile";
import { searchTimeSlotsRouter } from "./routers/searchTimeSlots";
import { appointmentTimeDurationRouter } from "./routers/appointmentTimeDuration";
import { searchCommentsRouter } from "./routers/findComments";
import { noOfOnlineAppointmentsRouter } from "./routers/no-of-online-appointments";
import { noOfVacantAndBookesSlotsRouter } from "./routers/no-of-vacant-and-booked-slots";
import { findDoctorsBasedOnSearchRouter } from "./routers/findDoctorsBasedOnSearch";
import { earningsRouter } from "./routers/earnings";
import { dashboardAnalyticsRouter } from "./routers/dashboard-analytics";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  searchMeeting: searchMeetingRouter,
  searchMeetingForADayRange: searchMeetingRouterForADayRange,
  similarDoctorProfile: similarDoctorProfileRouter,
  searchTimeSlots: searchTimeSlotsRouter,
  appointmentTimeDuration: appointmentTimeDurationRouter,
  searchComments : searchCommentsRouter,
  noOfOnlineAppointments : noOfOnlineAppointmentsRouter,
  noOfVacantAndBookedSlots : noOfVacantAndBookesSlotsRouter,
  findDoctorsBasedOnSearch : findDoctorsBasedOnSearchRouter,
  earnings: earningsRouter,
  dashboardAnalytics: dashboardAnalyticsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
