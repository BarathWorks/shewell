export const revalidate = 0;

import React, { Suspense } from 'react';
import { db } from '@/src/server/db';
import MediaTable from './media-table';
import { Skeleton } from 'primereact/skeleton';

const Media = async () => {
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
    <Suspense fallback={<Skeleton width="100%" height="100px" />}>
      <MediaTable media={media} />
    </Suspense>
  );
};

export default Media;
