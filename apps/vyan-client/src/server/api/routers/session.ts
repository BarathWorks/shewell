import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import {
  Prisma,
  SessionStatus,
  Trimester,
  PaymentStatus,
} from "@repo/database";

export const sessionRouter = createTRPCRouter({
  // Filter sessions with advanced options (category, trimester, price, sort)
  filterSessions: publicProcedure
    .input(
      z.object({
        categoryId: z.array(z.string()).optional(),
        trimester: z.nativeEnum(Trimester).optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sortBy: z.enum(["price-asc", "price-desc"]).optional(),
        status: z.nativeEnum(SessionStatus).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        isOnlyOnline: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      // Build flat AND array for clean index usage
      const andConditions: Prisma.SessionWhereInput[] = [
        // Default to PUBLISHED unless caller explicitly requests another status
        { status: input.status ?? SessionStatus.PUBLISHED },
        // Only show future online sessions or recordings (recordings always visible)
        {
          OR: [
            { type: "RECORDING" },
            { AND: [{ type: "ONLINE" }, { startAt: { gte: new Date() } }] },
          ],
        },
      ];

      if (input.categoryId && input.categoryId.length > 0) {
        andConditions.push({ categoryId: { in: input.categoryId } });
      }

      if (input.trimester) {
        andConditions.push({ category: { trimester: input.trimester } });
      }

      if (input.isOnlyOnline) {
        andConditions.push({ type: "ONLINE" });
      }

      if (input.minPrice !== undefined) {
        andConditions.push({ price: { gte: input.minPrice } });
      }
      if (input.maxPrice !== undefined) {
        andConditions.push({ price: { lte: input.maxPrice } });
      }
      if (input.startDate) {
        andConditions.push({ startAt: { gte: new Date(input.startDate) } });
      }
      if (input.endDate) {
        andConditions.push({ endAt: { lte: new Date(input.endDate) } });
      }

      const sessions = await db.session.findMany({
        where: { AND: andConditions },
        select: {
          id: true,
          title: true,
          slug: true,
          startAt: true,
          endAt: true,
          price: true,
          thumbnailMedia: {
            select: { fileUrl: true },
          },
          language: true,
          type: true,
        },
        orderBy: input.sortBy
          ? { price: input.sortBy === "price-asc" ? "asc" : "desc" }
          : { startAt: "asc" },
      });

      return { sessions };
    }),

  // Get all published sessions
  getAllSessions: publicProcedure
    .input(
      z.object({
        trimester: z.nativeEnum(Trimester).optional(),
        categoryId: z.string().optional(),
        status: z.nativeEnum(SessionStatus).optional(),
      }),
    )
    .query(async ({ input }) => {
      const whereCondition: Prisma.SessionWhereInput = {
        // Default to PUBLISHED unless explicitly specified
        status: input.status ?? SessionStatus.PUBLISHED,
      };

      if (input.categoryId) {
        whereCondition.categoryId = input.categoryId;
      }

      if (input.trimester) {
        whereCondition.category = { trimester: input.trimester };
      }

      const sessions = await db.session.findMany({
        where: whereCondition,
        select: {
          id: true,
          title: true,
          slug: true,
          startAt: true,
          endAt: true,
          price: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          thumbnailMediaId: true,
          thumbnailMedia: {
            select: { id: true, fileUrl: true },
          },
          language: true,
          type: true,
          category: {
            select: { id: true, name: true, slug: true, trimester: true },
          },
          // Use _count instead of fetching full registration rows
          _count: {
            select: { registrations: true },
          },
        },
        orderBy: { startAt: "asc" },
      });

      return sessions;
    }),

  // Get session by slug
  // Pass the current userId so registrations are scoped to that user only.
  // This avoids fetching all registrations (can be thousands) on a public page.
  getSessionBySlug: publicProcedure
    .input(z.object({ slug: z.string(), userId: z.string().optional() }))
    .query(async ({ input }) => {
      const session = await db.session.findUnique({
        where: { slug: input.slug },
        select: {
          id: true,
          title: true,
          slug: true,
          startAt: true,
          endAt: true,
          price: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          thumbnailMediaId: true,
          thumbnailMedia: {
            select: { id: true, fileUrl: true },
          },
          banners: {
            select: {
              media: { select: { id: true, fileUrl: true } },
            },
          },
          overview: true,
          meetingLink: true,
          language: true,
          type: true,
          maxBookings: true,
          _count: {
            select: {
              registrations: {
                where: { paymentStatus: PaymentStatus.COMPLETED },
              },
            },
          },
          category: {

            select: { id: true, name: true, slug: true, trimester: true },
          },
          // Scope to current user only — avoids loading all registrations publicly
          registrations: input.userId
            ? {
                where: { userId: input.userId },
                select: {
                  id: true,
                  paymentStatus: true,
                  createdAt: true,
                  userId: true,
                },
              }
            : false,
        },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      return session;
    }),

  // Get session by ID
  getSessionById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const session = await db.session.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          title: true,
          slug: true,
          startAt: true,
          endAt: true,
          price: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              trimester: true,
            },
          },
          registrations: {
            select: {
              id: true,
              paymentStatus: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      return session;
    }),

  // Get all session categories
  getAllCategories: publicProcedure
    .input(
      z.object({
        trimester: z.nativeEnum(Trimester).optional(),
      }),
    )
    .query(async ({ input }) => {
      const whereCondition: Prisma.SessionCategoryWhereInput = {};

      if (input.trimester) {
        whereCondition.trimester = input.trimester;
      }

      const categories = await db.sessionCategory.findMany({
        where: whereCondition,
        select: {
          id: true,
          name: true,
          slug: true,
          trimester: true,
          createdAt: true,
          updatedAt: true,
          // Use _count instead of fetching session rows just to count them
          _count: {
            select: {
              sessions: {
                where: { status: SessionStatus.PUBLISHED },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return categories;
    }),

  // Get category by slug
  getCategoryBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const category = await db.sessionCategory.findUnique({
        where: { slug: input.slug },
        select: {
          id: true,
          name: true,
          slug: true,
          trimester: true,
          createdAt: true,
          updatedAt: true,
          sessions: {
            where: {
              status: SessionStatus.PUBLISHED,
            },
            select: {
              id: true,
              title: true,
              slug: true,
              startAt: true,
              endAt: true,
              price: true,
              status: true,
            },
            orderBy: {
              startAt: "asc",
            },
          },
        },
      });

      if (!category) {
        throw new Error("Category not found");
      }

      return category;
    }),

  // Register for a session (protected - requires authentication)
  registerForSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
 
      return await db.$transaction(async (tx) => {
        // Lock the session row to prevent race conditions during capacity check
        // Note: Using a raw query for FOR UPDATE as Prisma doesn't support it natively in findUnique yet
        await tx.$executeRaw`SELECT * FROM "Session" WHERE id = ${input.sessionId} FOR UPDATE`;
 
        const session = await tx.session.findUnique({
          where: { id: input.sessionId },
          select: {
            status: true,
            startAt: true,
            maxBookings: true,
          },
        });
 
        if (!session) {
          throw new Error("Session not found");
        }
 
        if (session.status !== SessionStatus.PUBLISHED) {
          throw new Error("Session is not available for registration");
        }
 
        // Check if session has already started
        if (new Date() > session.startAt) {
          throw new Error("Session has already started");
        }
 
        // Check Capacity
        if (session.maxBookings) {
          const activeRegistrations = await tx.sessionRegistration.count({
            where: {
              sessionId: input.sessionId,
              OR: [
                { paymentStatus: PaymentStatus.COMPLETED },
                {
                  paymentStatus: PaymentStatus.PENDING,
                  createdAt: {
                    // Count pending registrations from the last 15 minutes as "reserving" a slot
                    gte: new Date(Date.now() - 15 * 60 * 1000),
                  },
                },
              ],
            },
          });
 
          if (activeRegistrations >= session.maxBookings) {
            throw new Error("Session is full");
          }
        }
 
        // Check if user is already registered
        const existingRegistration = await tx.sessionRegistration.findUnique({
          where: {
            sessionId_userId: {
              sessionId: input.sessionId,
              userId: userId,
            },
          },
        });
 
        if (existingRegistration) {
          throw new Error("You are already registered for this session");
        }
 
        // Create registration
        const registration = await tx.sessionRegistration.create({
          data: {
            sessionId: input.sessionId,
            userId: userId,
            paymentStatus: PaymentStatus.PENDING,
          },
          select: {
            id: true,
            sessionId: true,
            userId: true,
            paymentStatus: true,
            createdAt: true,
          },
        });
 
        return registration;
      });
    }),


  // Get user's registered sessions (protected)
  getUserRegistrations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const registrations = await db.sessionRegistration.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        paymentStatus: true,
        createdAt: true,
        session: {
          select: {
            id: true,
            title: true,
            slug: true,
            startAt: true,
            endAt: true,
            price: true,
            status: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                trimester: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return registrations;
  }),

  // Update payment status for registration (protected)
  updatePaymentStatus: protectedProcedure
    .input(
      z.object({
        registrationId: z.string(),
        paymentStatus: z.nativeEnum(PaymentStatus),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      // Verify the registration belongs to the user
      const registration = await db.sessionRegistration.findUnique({
        where: {
          id: input.registrationId,
        },
      });

      if (!registration) {
        throw new Error("Registration not found");
      }

      if (registration.userId !== userId) {
        throw new Error("Unauthorized to update this registration");
      }

      // Update payment status
      const updatedRegistration = await db.sessionRegistration.update({
        where: {
          id: input.registrationId,
        },
        data: {
          paymentStatus: input.paymentStatus,
        },
        select: {
          id: true,
          sessionId: true,
          userId: true,
          paymentStatus: true,
          createdAt: true,
          session: {
            select: {
              id: true,
              title: true,
              slug: true,
              startAt: true,
              endAt: true,
              price: true,
            },
          },
        },
      });

      return updatedRegistration;
    }),

  // Get upcoming sessions
  getUpcomingSessions: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
        trimester: z.nativeEnum(Trimester).optional(),
      }),
    )
    .query(async ({ input }) => {
      const whereCondition: Prisma.SessionWhereInput = {
        status: SessionStatus.PUBLISHED,
        startAt: {
          gte: new Date(),
        },
      };

      if (input.trimester) {
        whereCondition.category = {
          trimester: input.trimester,
        };
      }

      const sessions = await db.session.findMany({
        where: whereCondition,
        select: {
          id: true,
          title: true,
          slug: true,
          startAt: true,
          endAt: true,
          price: true,
          _count: {
            select: { registrations: true },
          },
          thumbnailMedia: {
            select: {
              fileUrl: true,
            },
          },
          language: true,
          type: true,
        },
        orderBy: {
          startAt: "asc",
        },
        take: input.limit,
      });

      return sessions;
    }),

  // Check if user is registered for a session
  checkUserRegistration: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const registration = await db.sessionRegistration.findUnique({
        where: {
          sessionId_userId: {
            sessionId: input.sessionId,
            userId: userId,
          },
        },
        select: {
          id: true,
          paymentStatus: true,
          createdAt: true,
        },
      });

      return {
        isRegistered: !!registration,
        registration: registration,
      };
    }),

  // Get session statistics
  getSessionStatistics: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const stats = await db.sessionRegistration.groupBy({
        by: ["paymentStatus"],
        where: {
          sessionId: input.sessionId,
        },
        _count: true,
      });

      const totalRegistrations = stats.reduce((acc, curr) => acc + curr._count, 0);
      const getCount = (status: PaymentStatus) =>
        stats.find((s) => s.paymentStatus === status)?._count || 0;

      return {
        totalRegistrations,
        completedPayments: getCount(PaymentStatus.COMPLETED),
        pendingPayments: getCount(PaymentStatus.PENDING),
        failedPayments: getCount(PaymentStatus.FAILED),
      };
    }),
});
