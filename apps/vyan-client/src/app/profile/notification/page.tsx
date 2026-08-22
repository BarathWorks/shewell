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
    <div className="flex flex-col gap-5">
      <Breadcrumb>
              <BreadcrumbList className="text-sm text-muted">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="inline-block py-1 hover:text-primary-700">
              Home
            </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink className="inline-block py-1 text-ink">Notifications</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
      </Breadcrumb>

      <div className="surface-card p-5 sm:p-6 lg:p-8">
        <h1 className="mb-6 text-2xl font-semibold text-ink sm:text-3xl">
          Notification
        </h1>
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
                      <div className="mx-auto flex w-full items-center justify-center font-inter text-muted">
                        No notifications
                      </div>
                    </>
                  )}
                </div>
      </div>
    </div>
  );
}
