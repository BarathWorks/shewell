export const revalidate = 0;

import React, { Suspense } from 'react';
import { db } from '@/src/server/db';
import ProductsTable from '@/src/app/(main)/manage-products/products/products-table';
import { ICurrency } from '@/src/_models/product.model';
import { Skeleton } from 'primereact/skeleton';

const Products = async () => {
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      active: true,
      description: true,
      shortDescription: true,
      seoTitle: true,
      seoDescription: true,
      seoKeywords: true,
      bestSeller: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          name: true
        }
      },
      media: {
        where: {
          NOT: {
            media: {
              fileUrl: null
            }
          }
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
              fileKey: true
            }
          }
        }
      },
      productBenefits: {
        select: {
          id: true,
          benefit: true
        },
        where: {
          deletedAt: null
        }
      },
      productStats: {
        select: {
          id: true,
          title: true,
          stat: true
        },
        where: {
          deletedAt: null
        }
      },
      productVariants: {
        select: {
          id: true,
          name: true,
          priceInCents: true,
          discountInCents: true,
          discountInPercentage: true,
          discountEndDate: true
        },
        where: {
          deletedAt: null
        }
      },
      faq : {
        select : {
          id : true,
          question : true,
          answer : true,
          order :true
        }
      },
      createdAt: true,
      updatedAt: true,
      
    },
    where:{
      deletedAt : null
    },
    orderBy: {
      name: 'asc'
    }
  });

  const parentCategories = await db.category.findMany({
    select: {
      id: true
    },
    where: {
      active: true,
      parentCategoryId: null
    }
  });

  console.log("parentCategories are",parentCategories)

  const selectCategories = await db.category.findMany({
    select: {
      id: true,
      name: true,
      active: true,
      childCategories: {
        select: {
          id: true,
          name: true
        }
      }
    },
    where: {
      active: true,
      deletedAt: null,
      parentCategoryId: {
        in: parentCategories.map((p) => p.id)
      }
    },
    orderBy: {
      name: 'desc'
    }
  });


  const mediaOnProducts = await db.mediaOnProducts.findMany({
    select: {
      mediaId: true,
      productId: true,
      order: true,
      comment: true,
      imageAltText: true,
      media: true
    },
    orderBy: {
      order: 'asc'
    }
  });
 

  return (
    <Suspense fallback={<Skeleton width="100%" height="100px" />}>
      
      <ProductsTable
        mediaOnProducts={mediaOnProducts}
        products={products.map((p) => ({ ...p, productVariants: [...p.productVariants.map((pv) => ({ ...pv, isPercentage: !!pv.discountInPercentage }))] }))}
        selectCategories={selectCategories}
        // currencies={currencies}
        // brands={brands}
      />
    </Suspense>
  );
};

export default Products;
