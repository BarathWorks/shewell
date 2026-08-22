export const revalidate = 0;

import React, { Suspense } from 'react';
import { db } from '@/src/server/db';
import { Skeleton } from 'primereact/skeleton';
import TestimonialTable from './testimonial-table';
import { requireAdminPage } from '@/src/server/authz';
import PageHeader from '@/src/_components/shared/page-header';
const Testimonials = async () => {
  await requireAdminPage('content:read');

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
      <PageHeader title="Testimonials" description="Patient quotes shown on the public site." />
      <>
        <Suspense fallback={<Skeleton width="100%" height="100px" />}>
          <TestimonialTable testimonials={testimonials.map((t)=>({...t, avgRating: t.avgRating?.toFixed(1)!}))} />
        </Suspense>
      </>
    </>
  );
};

export default Testimonials;
