// 'use server';
import { db } from '@/src/server/db';
import { Skeleton } from 'primereact/skeleton';
import { Suspense } from 'react';
import CouponsTable from './coupons-table';

export const revalidate = 0;

const Coupons = async () => {
  const coupons = await db.coupon.findMany({
    select: {
      id: true,
      code: true,
      amount: true,
      isPercent: true,
      description: true,
      newUser: true,
      expiresAt: true,
      numberOfTime: true,
      createdAt: true,
      updatedAt: true,
      categories: {
        select: {
          id: true,
          name: true,
          parentCategory: {
            select: {
              id: true,
              name: true,
              parentCategory: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      },
      products: {
        select: {
          id: true,
          name: true
        }
      },
      active: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log('coupons are', coupons);
  const selectCategories = await db.category.findMany({
    select: {
      id: true,
      name: true,
      active: true,
      parentCategory: {
        select: {
          id: true,
          name: true,
          parentCategory: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    where: {
      active: true,
      deletedAt: null,

      parentCategoryId: {
        not: {
          equals: null
        }
      }
    },
    orderBy: {
      parentCategory: {
        parentCategory: {
          name: 'asc'
        }
      }
    }
  });

  const selectProducts = await db.product.findMany({
    select: {
      id: true,
      name: true,
      active: true
    },
    where: {
      active: true,
      deletedAt: null
    }
  });

  console.log('selected categories for coupons', selectCategories);
  return (
    <Suspense fallback={<Skeleton width="100%" height="100px" />}>
      <CouponsTable coupons={coupons.map((c) => ({ ...c, categoryIds: c.categories.map((c) => c.id), productIds: c.products.map((p) => p.id) }))} selectCategories={selectCategories} selectProducts={selectProducts} />
    </Suspense>
  );
};

export default Coupons;
