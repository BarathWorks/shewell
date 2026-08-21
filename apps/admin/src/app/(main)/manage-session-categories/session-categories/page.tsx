export const revalidate = 0;

import { db } from '@/src/server/db';
import { Skeleton } from 'primereact/skeleton';
import React, { Suspense } from 'react';
import SessionCategoryTable from './session-category-table';
import { requireAdminPage } from '@/src/server/authz';

const SessionCategories = async () => {
  await requireAdminPage('session:read');

    const sessionCategories = await db.sessionCategory.findMany({
        orderBy: {
            updatedAt: 'desc'
        }
    });

    return (
        <>
            <Suspense fallback={<Skeleton className="tw-bg-red-200" width="100%" height="100px" />}>
                <SessionCategoryTable sessionCategories={sessionCategories as any} />
            </Suspense>
        </>
    );
};

export default SessionCategories;
