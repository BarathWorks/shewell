import { Suspense } from 'react';
import Layout from '../../layout/layout';
import { requireAdminPage } from '@/src/server/authz';

/**
 * Gates every route under /view-doctors, and gives them the admin shell.
 *
 * Two jobs:
 *
 *  1. The pages here are client components, so the role guard cannot live inside
 *     them — it goes in this server layout, which runs before any of them render.
 *
 *  2. This layout used to return a bare `<>{children}</>`. `view-doctors` is a
 *     sibling of the `(main)` route group, not a child of it, so it never
 *     inherited `(main)/layout.tsx` — which is what mounts `<Layout>`, and with
 *     it the top bar and the sidebar. Both `/view-doctors/doctors` and
 *     `/view-doctors/appointments` therefore rendered as bare pages with no
 *     navigation at all: once an admin followed a link into either screen, the
 *     only way back was the browser's back button.
 */
const ViewDoctorsLayout = async ({ children }: { children: React.ReactNode }) => {
  await requireAdminPage('doctor:read');

  return (
    <Layout>
      <Suspense>{children}</Suspense>
    </Layout>
  );
};

export default ViewDoctorsLayout;
