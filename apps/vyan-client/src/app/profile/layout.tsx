
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
   
       
          <div className="w-full bg-[#FBFBFB] font-inter pt-3">
         
          <div className=" container mx-auto 2xl:pb-[65px] xl:pb-[60px] lg:pb-[55px] pb-[32px] max-w-full">
          <div className="items-start xl:flex xl:flex-row xl:gap-[46px] 2xl:gap-[60px] ">
          <div className="w-full xl:w-[343px] 2xl:w-[375px] mb-4 xl:mb-0">
                  <ProfileNav email={userDetails?.email!}
                  name={userDetails?.name!} />
                  </div>
            <div className="flex-1">
            {children}
            </div>
            </div>
            </div>
            </div>
           
           
     
     
  );
} 
