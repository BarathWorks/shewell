export const revalidate = 0;

import React, { Suspense } from 'react';
import { db } from '@/src/server/db';

import { Skeleton } from 'primereact/skeleton';
import LanguageTable from './language-table';
import { requireAdminPage } from '@/src/server/authz';


const LanguagesPage = async () => {
  await requireAdminPage('doctor:read');

  const languages = await db.professionalLanguages.findMany({
    select: {
      id: true,
      language: true,
      active: true
    },
    orderBy: [
      {
        language: 'asc'
      }
    ]
  });

  return (
    <Suspense fallback={<Skeleton width="100%" height="100px" />}>
      <LanguageTable languages={languages}/>
    </Suspense>
  );
};

export default LanguagesPage;
