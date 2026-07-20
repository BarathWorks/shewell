import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@repo/ui/src/@/components/breadcrumb";
import { getServerSession } from "next-auth";
import { db } from "~/server/db";
import { format } from "date-fns";
import { Bell, BellOff, CheckCircle2, Clock, Info } from "lucide-react";

export default async function Notification() {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return null;
  }

  const userDetails = await db.user.findUnique({
    select: { id: true },
    where: { email: session.user.email },
  });

  if (!userDetails) {
    return null;
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
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="w-full font-inter space-y-6">
      {/* Breadcrumbs */}
      <div className="pb-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-gray-500 hover:text-[#00898F]">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/profile/notification" className="text-[#00898F] font-medium">
                Notifications
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Card Container */}
      <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        {/* Card Title Header */}
        <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E6F4EE] text-[#00898F]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-poppins text-xl font-semibold text-[#181818] md:text-2xl">
                Notifications & Updates
              </h1>
              <p className="font-inter text-xs text-[#666666] mt-0.5">
                Stay updated with your latest orders, appointments, and account alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Notification List */}
        <div>
          {notifications && notifications.length > 0 ? (
            <div className="flex flex-col gap-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all hover:border-[#00898F]/30 hover:shadow-sm"
                >
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#E6F4EE] text-[#00898F]">
                    <Info className="h-4 w-4" />
                  </div>

                  <div className="flex w-full flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-poppins text-sm font-semibold text-[#181818]">
                        {n.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-[#00898F] font-medium">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(n.createdAt), "MMM d, h:mm a")}</span>
                      </div>
                    </div>
                    <p className="font-inter text-xs text-[#666666] leading-relaxed">
                      {n.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
                <BellOff className="h-8 w-8" />
              </div>
              <h3 className="font-poppins text-base font-semibold text-[#181818]">
                No Notifications
              </h3>
              <p className="font-inter text-xs text-[#666666] max-w-sm mt-1">
                You're all caught up! When you place orders or book appointments, updates will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

