import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { productRouter } from "./routers/product";
import { searchProductRouter } from "./routers/searchProduct";
import { searchSpecializationRouter } from "./routers/searchSpecialization";
import { searchExpertRouter } from "./routers/selectExpert";
import { searchPatientRouter } from "./routers/searchPatient";
import { searchTimeSlotsRouter } from "./routers/searchTimeSlots";
import { appointmentTimeDurationRouter } from "./routers/appointmentTimeDuration";
import { findPriceRouter } from "./routers/findPrice";
import { searchOngoingAppointmentsRouter } from "./routers/findOngoingAppointment";
import { searchUpcomingAppointmentsRouter } from "./routers/findUpcomingAppointemnt";
import { searchCancelAppointmentsRouter } from "./routers/findCancelAppointment";
import { searchCompletedAppointmentsRouter } from "./routers/findCompletedAppointment";
import { findDoctorWithoutFilterRouter } from "./routers/findDoctorWithoutAnyFilter";
import { findDoctorRouter } from "./routers/findDoctorsbasedonFilters";
import { DoctorRouter } from "./routers/findDoctorbasedonDate";
import { timeDurationAndPriceForCoupleRouter } from "./routers/timeDurationAndPriceForCouple";
import { findDoctorbasedOnDoctorIdRouter } from "./routers/findDoctorbasedOnDoctorId";
import { priceForCoupleRouter } from "./routers/priceForCouples";
import { searchPatientForEditRouter } from "./routers/searchPatientForEdit";
import { searchLanguagesRouter } from "./routers/findLanguages";
import { searchCancelledAppointmentsRouter } from "./routers/findCancelledAppointment";
import { findPriceForCoupleRouter } from "./routers/findPriceForCouple";
import { similarDoctorProfileRouter } from "./routers/similarDoctorProfile";
import { wishlistedRouter } from "./routers/wishlistedProducts";
import { cartRouter } from "./routers/cart";
import { sessionRouter } from "./routers/session";
import { getTopExpertsRouter } from "./routers/getTopExperts";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  products: productRouter,
  searchProduct: searchProductRouter,
  searchSpecialization: searchSpecializationRouter,
  searchExpert: searchExpertRouter,
  searchPatient: searchPatientRouter,
  searchTimeSlots: searchTimeSlotsRouter,
  appointmentTimeDuration: appointmentTimeDurationRouter,
  findPrice: findPriceRouter,
  findPriceForCouple: findPriceForCoupleRouter,
  searchOngoingAppointments: searchOngoingAppointmentsRouter,
  searchUpcomingAppointments: searchUpcomingAppointmentsRouter,
  searchCancelAppointments: searchCancelAppointmentsRouter,
  searchCompletedAppointments: searchCompletedAppointmentsRouter,
  searchCancelledAppointments: searchCancelledAppointmentsRouter,
  findDoctorWithoutFilter: findDoctorWithoutFilterRouter,
  findDoctor: findDoctorRouter,
  Doctor: DoctorRouter,
  timeDurationAndPriceForCouple: timeDurationAndPriceForCoupleRouter,
  findDoctorbasedOnDoctor: findDoctorbasedOnDoctorIdRouter,
  priceForCouple: priceForCoupleRouter,
  searchPatientForEdit: searchPatientForEditRouter,
  searchLanguages: searchLanguagesRouter,
  similarDoctorProfile: similarDoctorProfileRouter,
  wishlisted: wishlistedRouter,
  cart: cartRouter,
  session: sessionRouter,
  topExperts: getTopExpertsRouter,
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
