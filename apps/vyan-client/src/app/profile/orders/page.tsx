"use server";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@repo/ui/src/@/components/breadcrumb";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/src/@/components/tabs";
import { getServerSession } from "next-auth";
import { db } from "~/server/db";
import { OrderStatus } from "@repo/database";
import ActiveOrders from "./active-order";
import DeliveredOrders from "./delivered-order";
import RacOrders from "./rac-orders";
import { ShoppingBag, PackageCheck, PackageX, ShoppingCart } from "lucide-react";

const Orders = async () => {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return null;
  }

  const [userDetails, orders] = await Promise.all([
    db.user.findFirst({
      select: { id: true, email: true, phoneNumber: true, name: true },
      where: { email: session.user.email },
    }),
    db.order.findMany({
      select: {
        id: true,
        discountInCent: true,
        orderPlaced: true,
        cancelledDate: true,
        expectedDelivery: true,
        userId: true,
        status: true,
        subTotalInCent: true,
        taxesInCent: true,
        couponId: true,
        deliveryFeesInCent: true,
        totalInCent: true,
        addressId: true,
        coupon: {
          select: { id: true, code: true, isPercent: true, amount: true },
        },
        lineItems: {
          select: {
            id: true,
            orderId: true,
            productVariantId: true,
            perUnitPriceInCent: true,
            quantity: true,
            subTotalInCent: true,
            discountInCent: true,
            totalInCent: true,
            productVariant: {
              select: {
                id: true,
                productId: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                priceInCents: true,
                discountInCents: true,
                discountEndDate: true,
                discountInPercentage: true,
                productVariantInventory: {
                  select: { id: true, available: true, productVariantId: true },
                },
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    shortDescription: true,
                    description: true,
                    userWishlisted: {
                      where: { email: session.user.email },
                      select: { email: true },
                    },
                    media: {
                      select: {
                        media: { select: { id: true, fileUrl: true, fileKey: true } },
                      },
                      take: 1,
                      orderBy: { order: "asc" },
                    },
                  },
                },
              },
            },
          },
        },
        address: {
          select: {
            id: true,
            name: true,
            houseNo: true,
            mobile: true,
            area: true,
            city: true,
            countryId: true,
            stateId: true,
            landmark: true,
            pincode: true,
            addressType: true,
            userId: true,
            createdAt: true,
            deletedAt: true,
            updatedAt: true,
          },
        },
      },
      where: {
        user: { email: session.user.email },
      },
      orderBy: { orderPlaced: "desc" },
    }),
  ]);

  const activeOrders = orders.filter(
    (i: any) => i.status === OrderStatus.PAYMENT_SUCCESSFUL || i.status === OrderStatus.PENDING
  );
  const deliveredOrders = orders.filter(
    (i: any) => i.status === OrderStatus.DELIVERED
  );
  const returnedAndCancelledOrders = orders.filter(
    (i: any) =>
      i.status === OrderStatus.RETURNED || i.status === OrderStatus.CANCELLED
  );

  const reviews = await db.review.findMany({
    select: {
      id: true,
      review: true,
      rating: true,
      approved: true,
      createdAt: true,
      productId: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    where: {
      user: { email: session.user.email },
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
              <BreadcrumbLink href="/profile/orders" className="text-[#00898F] font-medium">
                Orders
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
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-poppins text-xl font-semibold text-[#181818] md:text-2xl">
                My Orders
              </h1>
              <p className="font-inter text-xs text-[#666666] mt-0.5">
                Track active shipments, view order receipts, and manage your purchase history.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Switcher */}
        <div>
          <Tabs defaultValue="Active Orders" className="w-full">
            <TabsList className="mb-6 flex w-full flex-wrap justify-start gap-2 rounded-2xl bg-gray-50 p-1.5 sm:w-fit">
              <TabsTrigger
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-poppins text-sm font-medium text-gray-600 transition-all data-[state=active]:bg-[#00898F] data-[state=active]:text-white data-[state=active]:shadow-sm"
                value="Active Orders"
              >
                <ShoppingCart className="h-4 w-4" />
                Active ({activeOrders.length})
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-poppins text-sm font-medium text-gray-600 transition-all data-[state=active]:bg-[#00898F] data-[state=active]:text-white data-[state=active]:shadow-sm"
                value="Delivered Orders"
              >
                <PackageCheck className="h-4 w-4" />
                Delivered ({deliveredOrders.length})
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-poppins text-sm font-medium text-gray-600 transition-all data-[state=active]:bg-[#00898F] data-[state=active]:text-white data-[state=active]:shadow-sm"
                value="Returned Orders"
              >
                <PackageX className="h-4 w-4" />
                Returned / Cancelled ({returnedAndCancelledOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="Active Orders" className="mt-0 focus-visible:outline-none">
              {activeOrders.length > 0 ? (
                activeOrders.map((order: any) => (
                  <div key={order.id} className="mb-4">
                    {/* @ts-ignore */}
                    <ActiveOrders activeOrders={order} reviews={reviews} />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-10 text-center">
                  <ShoppingCart className="h-10 w-10 text-gray-400 mb-2" />
                  <h3 className="font-poppins text-base font-semibold text-gray-700">No Active Orders</h3>
                  <p className="font-inter text-xs text-gray-500 max-w-sm mt-1">
                    You don't have any active orders currently in progress.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="Delivered Orders" className="mt-0 focus-visible:outline-none">
              {deliveredOrders.length > 0 ? (
                deliveredOrders.map((order: any) => (
                  <div key={order.id} className="mb-4">
                    {/* @ts-ignore */}
                    <DeliveredOrders deliveredOrders={order} reviews={reviews} />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-10 text-center">
                  <PackageCheck className="h-10 w-10 text-gray-400 mb-2" />
                  <h3 className="font-poppins text-base font-semibold text-gray-700">No Delivered Orders</h3>
                  <p className="font-inter text-xs text-gray-500 max-w-sm mt-1">
                    Completed order deliveries will be listed here.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="Returned Orders" className="mt-0 focus-visible:outline-none">
              {returnedAndCancelledOrders.length > 0 ? (
                returnedAndCancelledOrders.map((order: any) => (
                  <div key={order.id} className="mb-4">
                    {/* @ts-ignore */}
                    <RacOrders racOrders={order} reviews={reviews} />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-10 text-center">
                  <PackageX className="h-10 w-10 text-gray-400 mb-2" />
                  <h3 className="font-poppins text-base font-semibold text-gray-700">No Returned or Cancelled Orders</h3>
                  <p className="font-inter text-xs text-gray-500 max-w-sm mt-1">
                    Cancelled or returned orders will appear here.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Orders;

