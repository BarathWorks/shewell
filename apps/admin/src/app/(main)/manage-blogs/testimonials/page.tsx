export const revalidate = 0;

import React, { Suspense } from 'react';
import { db } from '@/src/server/db';
import { Skeleton } from 'primereact/skeleton';
import TestimonialTable from './testimonial-table';
const Testimonials = async () => {
  const testimonials = await db.testimonials.findMany({
    select: {
      id: true,
      name: true,
      title: true,
      active: true,
      avgRating: true,
      mediaId: true,
      media: {
        select: {
          id: true,
          mimeType: true,
          fileUrl: true
        }
      }
    }
  });
  return (
    <>
      <Suspense fallback={<Skeleton className="tw-bg-red-200" width="100%" height="100px" />}>
        <TestimonialTable testimonials={testimonials.map((t)=>({...t, avgRating: t.avgRating?.toFixed(1)!}))} />
      </Suspense>
    </>
  );
};

export default Testimonials;
