export const revalidate = 0;

import React, { Suspense } from 'react';
import { db } from '@/src/server/db';
import CategoriesTable from './categories-table';
import { Skeleton } from 'primereact/skeleton';

const Categories = async () => {
  const categories = await db.category.findMany({
    select: {
      id: true,
      name: true,
      active: true,
      slug: true,
      parentCategoryId: true,
      parentCategory: {
        select: {
          id: true,
          name: true
        }
      },
      childCategories: {
        select: {
          id: true,
          name: true,
          active: true,
          slug:true,
          parentCategoryId: true,
          parentCategory: {
            select: {
              id: true,
              name: true
            },
            
          },
          childCategories: {
            select: {
              id: true,
              name: true,
              active: true,
              slug: true,
              parentCategoryId: true
            },
           
          }
        },
        where :{
          deletedAt : null
        }
      }
    },
    orderBy: {
      name: 'asc'
    },
    where: {
      parentCategoryId: null,
      deletedAt: null
    }
  });

 
  

  const selectCategories = await db.category.findMany({
    select: {
      id: true,
      name: true,
      active: true,
      slug: true
    },
    orderBy: {
      name: 'asc'
    },
    where:{
      deletedAt : null
    }
  });

  return (
    <Suspense fallback={<Skeleton width="100%" height="100px" />}>
      <CategoriesTable categories={categories} selectCategories={selectCategories} />
    </Suspense>
  );
};

export default Categories;
