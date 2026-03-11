// import { optional, z } from "zod";
// import { db } from "~/server/db";
// import { createTRPCRouter, publicProcedure } from "../trpc";
// import { Prisma } from "@repo/database";
// export const productRouter = createTRPCRouter({
//   filterProducts: publicProcedure
//     .input(
//       z.object({
//         categoryId: z.array(z.string()),
//         minPrice: z.number().optional(),
//         maxPrice: z.number().optional(),
//         sortBy: z
//           .enum(["price-asc", "price-desc", "rating-asc", "rating-desc"])
//           .optional(),
//       }),
//     )
//     .query(async ({ input }) => {
//       // console.log("ddfdfdfdd");
//       const { categoryId } = input;

//       let whereCondition: Prisma.ProductWhereInput = {};

//       if (input.categoryId.length > 0) {
//         whereCondition = {
//           ...whereCondition,
//           category: {
//             id: {
//               in: categoryId,
//             },
//           },
//         };
//       }

//       if (input.minPrice) {
//         console.log("input.minPrice", input.minPrice);
//         whereCondition = {
//           AND: [
//             { ...whereCondition },
//             {
//               productVariants: {
//                 some: {
//                   priceInCents: {
//                     gte: input.minPrice * 100,
//                   },
//                 },
//               },
//             },
//           ],
//         };
//       }

//       if (input.maxPrice) {
//         whereCondition = {
//           AND: [
//             { ...whereCondition },
//             {
//               productVariants: {
//                 some: {
//                   priceInCents: {
//                     lte: input.maxPrice * 100,
//                   },
//                 },
//               },
//             },
//           ],
//         };
//       }
//       let orderByCondition: Prisma.ProductOrderByWithRelationInput = {};
//       if (input.sortBy === "rating-asc") {
//         orderByCondition = {
//           // avgRating: "asc",
//         };
//       }
//       if (input.sortBy === "rating-desc") {
//         orderByCondition = {
//           // avgRating: "desc",
//         };
//       }
//       // if (input.sortBy === "price-asc") {
//       //   orderByCondition = {
//       //     productVariants: {
//       //       priceInCents: "asc",
//       //     },
//       //   };
//       // }
//       // if (input.sortBy === "price-desc") {
//       //   orderByCondition = {
//       //     productVariants: {
//       //       priceInCents: "desc",
//       //     },
//       //   };
//       // }
//       // console.log("whereCondition", JSON.stringify(whereCondition));
//       // console.log("orderByCondition", JSON.stringify(orderByCondition));

//       const filteredProducts = await db.product.findMany({
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//           active: true,
//           shortDescription: true,
//           description: true,
//           seoTitle: true,
//           seoDescription: true,
//           seoKeywords: true,
//           userWishlisted: true,
//           categoryId: true,
//           review:{
//             select:{
//               id:true,
//               rating:true,
//               review:true,
//               productId:true,
//               approved:true,
//               createdAt:true,
//               user:{
//                 select:{
//                   id:true,
//                   name:true,
//                   email:true,
//                 }
//               }
//             }
//           },
//           productVariants: {
//             select: {
//               id: true,
//               name: true,
//               discountEndDate:true,
//               priceInCents: true,
//               discountInCents: true,
//               discountInPercentage: true,
//               productVariantInventory:{
//                 select:{
//                   id:true,
//                   available:true,
//                   productVariantId:true,
//                 }
//               }
//             },
//           },
//           category: {
//             select: {
//               id: true,
//               name: true,
//             },
//           },
//           mediaOnProducts: {
//             where: {
//               NOT: {
//                 media: {
//                   fileUrl: null,
//                 },
//               },
//             },
//             select: {
//               order: true,
//               imageAltText: true,
//               comment: true,
//               mediaId: true,
//               productId: true,
//               media: {
//                 select: {
//                   id: true,
//                   fileUrl: true,
//                   fileKey: true,
//                 },
//               },
//             },
//           },
//         },
//         where: whereCondition,
//         orderBy: orderByCondition,
//       });
//       console.log(filteredProducts);
//       return { filteredProducts };
//     }),
// });

import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { Prisma } from "@repo/database";

export const productRouter = createTRPCRouter({
  filterProducts: publicProcedure
    .input(
      z.object({
        categoryId: z.array(z.string()),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sortBy: z
          .enum(["price-asc", "price-desc", "rating-asc", "rating-desc"])
          .optional(),
      }),
    )
    .query(async ({ input }) => {
      // Build a flat AND array — Postgres can use indexes on all leaf conditions
      const andConditions: any[] = [
        { deletedAt: null },
        { active: true },
      ];

      if (input.categoryId && input.categoryId.length > 0) {
        andConditions.push({
          category: { id: { in: input.categoryId }, deletedAt: null },
        });
      }

      if (input.minPrice) {
        andConditions.push({
          productVariants: { some: { deletedAt: null, priceInCents: { gte: input.minPrice * 100 } } },
        });
      }

      if (input.maxPrice) {
        andConditions.push({
          productVariants: { some: { deletedAt: null, priceInCents: { lte: input.maxPrice * 100 } } },
        });
      }

      const whereCondition: any = { AND: andConditions };

      // Use DB-level sort for avgRating — avoids pulling all reviews into memory
      let orderByCondition: any = undefined;
      if (input.sortBy === "price-asc" || input.sortBy === "price-desc") {
        // price sort happens in JS below (variant-level min price)
        orderByCondition = undefined;
      } else if (input.sortBy === "rating-asc") {
        orderByCondition = { avgRating: "asc" };
      } else if (input.sortBy === "rating-desc") {
        orderByCondition = { avgRating: "desc" };
      }

      const filteredProducts = await db.product.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          active: true,
          shortDescription: true,
          description: true,
          seoTitle: true,
          seoDescription: true,
          seoKeywords: true,
          userWishlisted: true,
          categoryId: true,
          avgRating: true,
          totalReviews: true,
          // Only fetch approved reviews; limit to avoid massive payloads
          review: {
            select: {
              id: true,
              rating: true,
              review: true,
              productId: true,
              approved: true,
              createdAt: true,
              user: {
                select: { id: true, name: true, email: true },
              },
            },
            where: { approved: true },
            take: 10,
            orderBy: { createdAt: "desc" },
          },
          productBenefits: {
            select: { id: true, benefit: true },
            where: { deletedAt: null },
          },
          productVariants: {
            select: {
              id: true,
              name: true,
              discountEndDate: true,
              priceInCents: true,
              discountInCents: true,
              discountInPercentage: true,
              productVariantInventory: {
                select: { id: true, available: true, productVariantId: true },
              },
            },
            where: { deletedAt: null },
            orderBy: { priceInCents: "asc" },
          },
          faq: {
            select: { id: true, question: true, answer: true, order: true },
          },
          category: {
            select: { id: true, name: true },
          },
          media: {
            where: { NOT: { media: { fileUrl: null } } },
            select: {
              order: true,
              imageAltText: true,
              comment: true,
              mediaId: true,
              productId: true,
              media: { select: { id: true, fileUrl: true, fileKey: true } },
            },
            orderBy: { order: "asc" },
          },
        },
        where: whereCondition,
        ...(orderByCondition ? { orderBy: orderByCondition } : {}),
      });

      const updatedFilteredProducts = filteredProducts.map((item) => ({
        ...item,
        avgRating: item.avgRating.toString(),
      }));

      // Price sort: DB cannot easily sort by min variant price so keep in JS
      if (input.sortBy === "price-asc" || input.sortBy === "price-desc") {
        updatedFilteredProducts.sort((a, b) => {
          const aMin = Math.min(...a.productVariants.map((v) => v.priceInCents ?? 0));
          const bMin = Math.min(...b.productVariants.map((v) => v.priceInCents ?? 0));
          return input.sortBy === "price-asc" ? aMin - bMin : bMin - aMin;
        });
      }

      return { updatedFilteredProducts };
    }),
});
