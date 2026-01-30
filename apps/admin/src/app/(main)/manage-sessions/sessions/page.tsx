export const revalidate = 0;

import { db } from '@/src/server/db';
import { Skeleton } from 'primereact/skeleton';
import React, { Suspense } from 'react';
import SessionTable from './session-table';

const Sessions = async () => {
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
      <Suspense fallback={<Skeleton className="tw-bg-red-200" width="100%" height="100px" />}>
        <SessionTable sessions={sessions as any} categories={categories as any} />
      </Suspense>
    </>
  );
};

export default Sessions;
