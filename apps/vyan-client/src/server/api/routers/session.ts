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
      }),
    )
    .query(async ({ input }) => {
      console.log("filterSessions input:", JSON.stringify(input, null, 2));

      let whereCondition: Prisma.SessionWhereInput = {};

      // Filter by status
      if (input.status !== undefined) {
        whereCondition.status = input.status;
      }

      // Filter by category IDs
      if (input.categoryId && input.categoryId.length > 0) {
        whereCondition.categoryId = { in: input.categoryId };
      }

      // Filter by trimester
      if (input.trimester) {
        whereCondition.category = {
          trimester: input.trimester,
        };
      }

      // Build price filter conditions
      const priceConditions = [];
      if (input.minPrice !== undefined) {
        priceConditions.push({
          price: { gte: input.minPrice },
        });
      }
      if (input.maxPrice !== undefined) {
        priceConditions.push({
          price: { lte: input.maxPrice },
        });
      }

      // Combine price conditions with existing where conditions if any price filters exist
      if (priceConditions.length > 0) {
        whereCondition = {
          AND: [{ ...whereCondition }, ...priceConditions],
        };
      }

      console.log("whereCondition:", JSON.stringify(whereCondition, null, 2));

      // Fetch sessions
      let sessions = await db.session.findMany({
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
          categoryId: true,
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

      // Sort by price if needed (convert Decimal to number for comparison)
      if (input.sortBy === "price-asc" || input.sortBy === "price-desc") {
        sessions.sort((a, b) => {
          const aPrice = Number(a.price ?? 0);
          const bPrice = Number(b.price ?? 0);
          return input.sortBy === "price-asc"
            ? aPrice - bPrice
            : bPrice - aPrice;
        });
      }

      console.log("Filtered sessions count:", sessions.length);

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
      const whereCondition: Prisma.SessionWhereInput = {};

      // Only filter by status if explicitly provided
      if (input.status !== undefined) {
        whereCondition.status = input.status;
      }
      // If status is not provided, don't filter by status at all (show all sessions)

      if (input.categoryId) {
        whereCondition.categoryId = input.categoryId;
      }

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
            },
          },
        },
        orderBy: {
          startAt: "asc",
        },
      });

      return sessions;
    }),

  // Get session by slug
  getSessionBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
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
          sessions: {
            where: {
              status: SessionStatus.PUBLISHED,
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
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

      // Check if session exists and is published
      const session = await db.session.findUnique({
        where: { id: input.sessionId },
        select: {
          id: true,
          status: true,
          startAt: true,
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

      // Check if user is already registered
      const existingRegistration = await db.sessionRegistration.findUnique({
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
      const registration = await db.sessionRegistration.create({
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
          status: true,
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
            },
          },
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
      const registrations = await db.sessionRegistration.findMany({
        where: {
          sessionId: input.sessionId,
        },
        select: {
          paymentStatus: true,
        },
      });

      const totalRegistrations = registrations.length;
      const completedPayments = registrations.filter(
        (r) => r.paymentStatus === PaymentStatus.COMPLETED,
      ).length;
      const pendingPayments = registrations.filter(
        (r) => r.paymentStatus === PaymentStatus.PENDING,
      ).length;
      const failedPayments = registrations.filter(
        (r) => r.paymentStatus === PaymentStatus.FAILED,
      ).length;

      return {
        totalRegistrations,
        completedPayments,
        pendingPayments,
        failedPayments,
      };
    }),
});
