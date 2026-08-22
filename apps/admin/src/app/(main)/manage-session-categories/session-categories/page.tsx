export const revalidate = 0;

import { db } from '@/src/server/db';
import { Skeleton } from 'primereact/skeleton';
import React, { Suspense } from 'react';
import SessionCategoryTable from './session-category-table';
import { requireAdminPage } from '@/src/server/authz';

import PageHeader from '@/src/_components/shared/page-header';
const SessionCategories = async () => {
  await requireAdminPage('session:read');

    const sessionCategories = await db.sessionCategory.findMany({
        orderBy: {
            updatedAt: 'desc'
        }
    });

    return (
        <>
            <PageHeader title="Session categories" description="How group sessions are grouped for patients." />
            <Suspense fallback={<Skeleton width="100%" height="100px" />}>
                <SessionCategoryTable sessionCategories={sessionCategories as any} />
            </Suspense>
        </>
    );
};

export default SessionCategories;
