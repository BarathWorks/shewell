export const revalidate = 0;

import { db } from '@/src/server/db';
import HomepageBannersTable from '@/src/app/(main)/manage-blogs/homepage-banners/homepage-banners-table';
import { requireAdminPage } from '@/src/server/authz';

import PageHeader from '@/src/_components/shared/page-header';
const HomepageBannerPage = async () => {
  await requireAdminPage('content:read');

  const homepageBanners = await db.homeBanner.findMany({
    select: {
      id: true,
      order: true,
      url: true,
      active: true,
      mediaId: true,
      media: true,
      usedFor : true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      order: 'asc'
    }
  });

  return (
    <>
      <PageHeader title="Homepage banners" description="Rotating banners on the patient homepage." />
      <HomepageBannersTable homepageBanners={homepageBanners} />
    </>
  );
};

export default HomepageBannerPage;
