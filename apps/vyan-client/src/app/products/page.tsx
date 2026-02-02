
// import ProductCard from "~/components/product-card";
// import ProductsFilter from "~/components/products-filter";
// import { db } from "~/server/db";
// import { getServerSession } from "next-auth";
// import Link from "next/link";

// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbSeparator,
// } from "@repo/ui/src/@/components/breadcrumb";
// import { api } from "~/trpc/server";
// import AllProducts from "./all-products";
// import Filter from "./filter";
// import React from "react";

// const Products = async ({
//   searchParams,
// }: {
//   searchParams: {
//     slug: string;
//     category?: string;
//     minValue: string;
//     maxValue: string;
//   };
// }) => {
//   const productIdString = await searchParams?.category;
//   const productId = productIdString?.split(",") || [];
//   const minPrice = await parseInt(searchParams.minValue);
//   const maxPrice = await parseInt(searchParams.maxValue);
//   console.log("productIdsss", searchParams, productId);
 
  

//   const product = await db.product.findMany({
//     select: {
//       id: true,
//       name: true,
//       shortDescription: true,
//       description: true,
//       slug: true,
//       avgRating : true, 
//       totalReviews : true,
//       categoryId : true,
//       media: {
//         select: {
//           media: {
//             select: {
//               id: true,
//               fileKey: true,
//               fileUrl: true,
//             },
//           },
//         },
//       },
//       productBenefits : {
//         select : {
//           id : true,
//           benefit : true
//         },
//         where :{
//           deletedAt : null
//         }
//       },
//       productVariants: {
//         select: {
//           id: true,
//           name: true,
//           priceInCents: true,
//           discountInCents: true,
//           discountInPercentage: true,
//           discountEndDate: true,
//           productVariantInventory: {
//             select: {
//               id: true,
//               available: true,
//               productVariantId: true,
//             },
//           },
//         },
//         where: {
//           deletedAt: null,
//         },
//         orderBy: {
//           priceInCents: "asc",
//         },
//       },
//       faq:{
//         select :{
//           id : true,
//           question : true,
//           answer : true,
//           order : true
//         }
//       },
//       review: {
//         select: {
//           id: true,
//           rating: true,
//           review: true,
//           productId: true,
//           approved: true,
//           createdAt: true,
//           user: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//             },
//           },
//         },
//       },
//       userWishlisted: {
//         select: {
//           email: true,
//         },
//       },
//     },
//     where: {
//       slug: searchParams?.slug,
//       deletedAt: null,
//     },
//   });


//   const category = await db.category.findMany({
//     select: {
//       id: true,
//       name: true,
//       childCategories: {
//         select: {
//           id: true,
//           name: true,
//           // childCategories: {
//           //   select: {
//           //     id: true,
//           //     name: true,
//           //   },
//           // },
//         },
//       },
//     },
//     where: {
//       parentCategoryId: null,
//       deletedAt : null
//     },
//   });

 

//   const filteredProducts = product.filter((p : any) => p.productVariants.length > 0);
//   return (
//     <>
//       <div className="container mx-auto max-w-full">
//         <div className="pb-[55px] pt-[24px] xl:pt-[24px]  2xl:gap-[60px] 2xl:py-[32px]">
//           <div className="mb-[24px]">
//             <Breadcrumb>
//               <BreadcrumbList>
//                 <BreadcrumbItem>
//                   <BreadcrumbLink href="/">Home</BreadcrumbLink>
//                 </BreadcrumbItem>
//                 <BreadcrumbSeparator />
//                 <BreadcrumbItem>
//                   <BreadcrumbLink href="/product">Products</BreadcrumbLink>
//                 </BreadcrumbItem>
//               </BreadcrumbList>
//             </Breadcrumb>
//           </div>
//           <div className=" flex flex-col gap-[50px] ">
//             {/* Filter-component */}
//             <Filter categories={category} />

//             {/* Products-List */}
//             <div className="grid grid-cols-1 gap-[30px] md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
//               <AllProducts
//                 product={filteredProducts.map((product : any) => ({
//                   ...product,
//                   avgRating: product.avgRating.toFixed(1)
//                 }))}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Products;

import { ComingSoon } from "~/components/coming-soon";

const Products = () => {
  return <ComingSoon />;
};

export default Products;