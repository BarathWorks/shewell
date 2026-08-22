export const revalidate = 0;

import { db } from '@/src/server/db';
import { Skeleton } from 'primereact/skeleton';
import React, { Suspense } from 'react';
import SessionTable from './session-table';
import { requireAdminPage } from '@/src/server/authz';

import PageHeader from '@/src/_components/shared/page-header';
const Sessions = async () => {
  await requireAdminPage('session:read');

  // Fetch sessions and categories in parallel
  const [sessions, categories] = await Promise.all([
    db.session.findMany({
      include: {
        registrations: {
          select: {
            id: true,
            paymentStatus: true
          }
        },
        thumbnailMedia: true,
        banners: {
          include: {
            media: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    }),
    db.sessionCategory.findMany({
      orderBy: {
        name: 'asc'
      }
    })
  ]);

  return (
    <>
      <PageHeader title="Sessions" description="Expert-led group sessions and their scheduling." />
      <>
        <Suspense fallback={<Skeleton width="100%" height="100px" />}>
          <SessionTable sessions={sessions as any} categories={categories as any} />
        </Suspense>
      </>
    </>
  );
};

export default Sessions;
