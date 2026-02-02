export const revalidate = 0;

import { db } from '@/src/server/db';
import HomepageBannersTable from '@/src/app/(main)/manage-blogs/homepage-banners/homepage-banners-table';

const HomepageBannerPage = async () => {
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

  return <HomepageBannersTable homepageBanners={homepageBanners} />;
};

export default HomepageBannerPage;
