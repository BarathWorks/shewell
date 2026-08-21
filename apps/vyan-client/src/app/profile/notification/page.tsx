import ProfileNav from "~/components/profile-nav";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@repo/ui/src/@/components/breadcrumb";

import { db } from "~/server/db";
import { format } from "date-fns";
import { getServerAuthSession } from "~/server/auth";

export default async function Notification() {
  const session = await getServerAuthSession();
  if (!session) {
    return;
  }
  if (!session.user.email) {
    return;
  }
  const userDetails = await db.user.findUnique({
    select: {
      id: true,
      email: true,
      phoneNumber: true,
      name: true,
    },
    where: {
      email: session.user.email,
    },
  });
  if (!userDetails) {
    return;
  }

  const notifications = await db.notification.findMany({
    select: {
      id: true,
      userId: true,
      title: true,
      description: true,
      createdAt: true,
    },
    where: {
      userId: userDetails.id,
    },
  });
  return (
    <>
      <div className="w-full bg-[#FBFBFB] font-inter">
        <div className="container mx-auto max-w-full">
          <div className="py-4 md:py-6 xl:py-[28px] 2xl:py-[32px]">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>Notifications</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="pb-[32px] lg:pb-[55px] xl:pb-[60px] 2xl:pb-[65px]">
            <div className="items-start justify-between xl:flex xl:flex-row xl:justify-center xl:gap-[46px] 2xl:gap-[60px] ">
              <div className="basis-full rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:p-10">
                <div className="mb-10 flex items-center gap-3 font-poppins text-xl font-semibold text-[#181818] lg:text-2xl xl:text-3xl">
                  <svg
                    className="size-6 xl:size-8"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M25.3307 16H6.66406"
                      stroke="#434343"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15.9974 25.3334L6.66406 16.0001L15.9974 6.66675"
                      stroke="#434343"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Notification
                </div>
                <div>
                  {notifications && notifications.length > 0 ? (
                    <>
                      {notifications.map((n) => (
                        <>
                          <div className="border-t-2 border-t-[#F2F7EA] pt-10 font-inter ">
                            <div className="flex flex-col gap-2 border-b border-b-[#8F8F8F] pb-2">
                              <div className="flex items-center justify-between">
                                <div className="text-base font-medium text-black-300">
                                  {n.title}
                                </div>
                                <div className="text-sm font-medium text-green-400">
                                  {format(n.createdAt, "hh:mm a")}
                                </div>
                              </div>
                              <div className="text-black-200 text-base">
                                {n.description}
                              </div>
                            </div>
                          </div>
                        </>
                      ))}
                    </>
                  ) : (
                    <>
                      <div className="mx-auto flex w-full items-center justify-center font-inter text-[#666666]">
                        No notifications
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
