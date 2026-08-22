export const revalidate = 0;

import React, { Suspense } from 'react';
import { db } from '@/src/server/db';

import { Skeleton } from 'primereact/skeleton';
import SpecializationTable from './specialization-parent-category-table';
import SpecializationParentCategoryTable from './specialization-parent-category-table';
import { requireAdminPage } from '@/src/server/authz';

import PageHeader from '@/src/_components/shared/page-header';
const SpecializationParentCategoryPage = async () => {
  await requireAdminPage('doctor:read');

  //   const specializations = await db.professionalSpecializations.findMany({
  //     select: {
  //       id: true,
  //       specialization: true,
  //       active: true
  //     },
  //     orderBy: [
  //       {
  //         specialization: 'asc'
  //       }
  //     ]
  //   });

  const specializations = await db.professionalSpecializationParentCategory.findMany({
    select: {
      id: true,
      name: true,
      active: true,
      media: true,
      mediaId: true
    },
    orderBy: [
      {
        name: 'asc'
      }
    ]
  });

  return (
    <>
      <PageHeader title="Speciality categories" description="Top-level grouping for practitioner specialities." />
      <Suspense fallback={<Skeleton width="100%" height="100px" />}>
        <SpecializationParentCategoryTable specializations={specializations} />
      </Suspense>
    </>
  );
};

export default SpecializationParentCategoryPage;
