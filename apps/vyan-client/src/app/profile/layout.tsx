import { getServerSession } from "next-auth";
import ProfileNav from "~/components/profile-nav";
import { db } from "~/server/db";

export default async function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  const userDetails = session?.user?.email
    ? await db.user.findFirst({
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          name: true,
        },
        where: {
          email: session.user.email,
          deletedAt: null,
        },
      })
    : null;

  return (
    <div className="w-full min-h-screen bg-[#FBFBFB] font-inter py-4 md:py-6 lg:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="items-start xl:flex xl:flex-row xl:gap-8 2xl:gap-10">
          <div className="w-full xl:w-[320px] 2xl:w-[360px] mb-6 xl:mb-0 xl:sticky xl:top-24">
            <ProfileNav
              email={userDetails?.email || ""}
              name={userDetails?.name || ""}
            />
          </div>
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
