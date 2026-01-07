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
      let whereCondition: any = {
        deletedAt: null, // Add this base condition for all queries
      };
      let orderByCondition: any = {};

      // Only apply category filter if categoryId array is not empty
      if (input.categoryId && input.categoryId.length > 0) {
        whereCondition = {
          ...whereCondition, // Spread existing conditions including deletedAt: null
          category: {
            id: {
              in: input.categoryId,
            },
            deletedAt: null,
          },
        };
      }

      // Build price filter conditions
      const priceConditions = [];

      if (input.minPrice) {
        priceConditions.push({
          productVariants: {
            some: {
              priceInCents: {
                gte: input.minPrice * 100,
              },
            },
          },
        });
      }

      if (input.maxPrice) {
        priceConditions.push({
          productVariants: {
            some: {
              priceInCents: {
                lte: input.maxPrice * 100,
              },
            },
          },
        });
      }

      // Combine price conditions with existing where conditions if any price filters exist
      if (priceConditions.length > 0) {
        whereCondition = {
          AND: [
            { deletedAt: null }, // Ensure deletedAt: null is included in AND conditions
            ...priceConditions,
            ...(whereCondition.category
              ? [{ category: whereCondition.category }]
              : []),
          ],
        };
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
          review: {
            select: {
              id: true,
              rating: true,
              review: true,
              productId: true,
              approved: true,
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
          productBenefits : {
            select : {
              id : true,
              benefit : true
            },
            where : {
              deletedAt : null
            }
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
                select: {
                  id: true,
                  available: true,
                  productVariantId: true,
                },
              },
            },

            where: {
              deletedAt: null,
            },
            
            orderBy: {
              priceInCents: "asc",
            },
          },
          faq: {
            select: {
              id: true,
              question: true,
              answer: true,
              order: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          media: {
            where: {
              NOT: {
                media: {
                  fileUrl: null,
                },
              },
            },
            select: {
              order: true,
              imageAltText: true,
              comment: true,
              mediaId: true,
              productId: true,
              media: {
                select: {
                  id: true,
                  fileUrl: true,
                  fileKey: true,
                },
              },
            },
          },
        },
        where: whereCondition,
      });

      // Rest of the code remains the same...
      // Sort products by price
      if (input.sortBy === "price-asc" || input.sortBy === "price-desc") {
        filteredProducts.sort((a, b) => {
          const aMinPrice = Math.min(
            ...a.productVariants.map((v) => v.priceInCents ?? 0),
          );
          const bMinPrice = Math.min(
            ...b.productVariants.map((v) => v.priceInCents ?? 0),
          );
          return input.sortBy === "price-asc"
            ? aMinPrice - bMinPrice
            : bMinPrice - aMinPrice;
        });
      }

      const updatedFilteredProducts = filteredProducts.map((item) => ({
        ...item,
        avgRating: item.avgRating.toString(),
      }));

      // Sort products by rating
      if (input.sortBy === "rating-asc" || input.sortBy === "rating-desc") {
        updatedFilteredProducts.sort((a, b) => {
          const aRatings =
            a.review
              ?.filter((r) => r.rating != null)
              .map((r) => Number(r.rating)) ?? [];
          const bRatings =
            b.review
              ?.filter((r) => r.rating != null)
              .map((r) => Number(r.rating)) ?? [];

          const aAvgRating =
            aRatings.length > 0
              ? aRatings.reduce((sum, rating) => sum + rating, 0) /
                aRatings.length
              : 0;

          const bAvgRating =
            bRatings.length > 0
              ? bRatings.reduce((sum, rating) => sum + rating, 0) /
                bRatings.length
              : 0;

          return input.sortBy === "rating-asc"
            ? aAvgRating - bAvgRating
            : bAvgRating - aAvgRating;
        });
      }

      return { updatedFilteredProducts };
    }),
});
