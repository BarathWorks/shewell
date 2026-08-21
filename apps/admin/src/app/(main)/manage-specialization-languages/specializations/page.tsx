export const revalidate = 0;

import React, { Suspense } from 'react';
import { db } from '@/src/server/db';

import { Skeleton } from 'primereact/skeleton';
import SpecializationTable from './specialization-table';
import { requireAdminPage } from '@/src/server/authz';

const SpecializationPage = async () => {
  await requireAdminPage('doctor:read');

  const specializations = await db.professionalSpecializations.findMany({
    select: {
      id: true,
      specialization: true,
      active: true,
      ProfessionalSpecializationParentCategory : {
        select :{
          id : true
        }
      }
    },
    orderBy: [
      {
        specialization: 'asc'
      }
    ]
  });

  const updatedSpecializations = specializations.map((item) => ({
    ...item,
    categoryId : item.ProfessionalSpecializationParentCategory?.id!
  }))

  const categories = await db.professionalSpecializationParentCategory.findMany({
    select : {
      id : true,
      name : true,
     
    },
    where:{
      active : true,
      deletedAt : null
    }
  })

  console.log("specialization parent categories at specialization server", categories)
  return (
    <Suspense fallback={<Skeleton width="100%" height="100px" />}>
      <SpecializationTable specializations={updatedSpecializations}  categories={categories} />
    </Suspense>
  );
};

export default SpecializationPage;
