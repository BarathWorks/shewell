export const revalidate = 0;

import React, { Suspense } from 'react';
import { db } from '@/src/server/db';
import MediaTable from './media-table';
import { Skeleton } from 'primereact/skeleton';
import { requireAdminPage } from '@/src/server/authz';

import PageHeader from '@/src/_components/shared/page-header';
const Media = async () => {
  await requireAdminPage('content:read');

  const media = await db.media.findMany({
    select: {
      id: true,
      fileKey: true,
      fileUrl: true,
      comments: true,
      mimeType: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <>
      <PageHeader title="Media library" description="Images uploaded across the platform." />
      <Suspense fallback={<Skeleton width="100%" height="100px" />}>
        <MediaTable media={media} />
      </Suspense>
    </>
  );
};

export default Media;
