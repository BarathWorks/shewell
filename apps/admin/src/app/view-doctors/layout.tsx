import { requireAdminPage } from '@/src/server/authz';

/**
 * Gates every route under /view-doctors.
 *
 * The pages here are client components, so the guard cannot live inside them —
 * it goes in this server layout instead, which runs before any of them render.
 */
const ViewDoctorsLayout = async ({ children }: { children: React.ReactNode }) => {
  await requireAdminPage('doctor:read');
  return <>{children}</>;
};

export default ViewDoctorsLayout;
