
import ProfileNav from "~/components/profile-nav";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function OrdersPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerAuthSession();

  // Same undefined-filter hazard as the pages below: guard before querying.
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userDetails = await db.user.findFirst({
    select: {
      id: true,
      email: true,
      phoneNumber: true,
      name: true,
    },
    where: {
      id: session.user.id,
      deletedAt: null,
    },
  });
  return (
    <div className="bg-canvas">
      <div className="container-page py-6 md:py-10">
        {/* Was a stack of `container mx-auto max-w-full` with a 343px fixed rail
            and four breakpoint-specific bottom paddings. A 12-column grid holds
            the two columns without pinning either to a pixel width. */}
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-4 xl:gap-8">
          <div className="xl:sticky xl:top-24 xl:col-span-1">
            <ProfileNav
              email={userDetails?.email!}
              name={userDetails?.name!}
            />
          </div>

          <div className="min-w-0 xl:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
