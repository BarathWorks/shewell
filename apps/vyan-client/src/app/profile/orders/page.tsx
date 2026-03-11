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
import ProfileNav from "~/components/profile-nav";
import ReturnedOrders from "./returned-orders";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { db } from "~/server/db";
import { OrderStatus } from "@repo/database";
import ActiveOrders from "./active-order";
import DeliveredOrders from "./delivered-order";
import RacOrders from "./rac-orders";

const Orders = async () => {
  const session = await getServerSession();

  // Fetch user details and orders in parallel using the email FK shortcut
  const [userDetails, orders] = await Promise.all([
    db.user.findFirst({
      select: { id: true, email: true, phoneNumber: true, name: true },
      where: { email: session?.user.email! },
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
                    // Removed: review — fetched separately, scoped to this user
                    // Removed: productVariants — lineItem already holds the purchased variant
                    // Scope wishlisted check to current user only
                    userWishlisted: {
                      where: { email: session?.user.email! },
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
        user: { email: session?.user.email! },
      },
      orderBy: { orderPlaced: "desc" },
    }),
  ]);

  const activeOrders = orders.filter(
    (i: any) => i.status === OrderStatus.PAYMENT_SUCCESSFUL,
  );
  const deliveredOrders = orders.filter(
    (i: any) => i.status === OrderStatus.DELIVERED,
  );
  const returnedAndCancelledOrders = orders.filter(
    (i: any) =>
      i.status === OrderStatus.RETURNED || i.status === OrderStatus.CANCELLED,
  );

  // Only fetch reviews written by this user — avoids full-table scan
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
      user: { email: session?.user.email! },
    },
  });

  return (
    <>
      <div className="container mx-auto flex max-w-full flex-col items-start">
        <div className="py-[18px] lg:py-6 xl:py-7 2xl:py-[30px]">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>Orders</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:p-10">
          <div className="mb-10 flex items-center gap-3 font-poppins text-xl font-semibold text-[#181818] lg:text-2xl xl:text-3xl">
            <svg
              className="size-6 xl:size-8"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M25.3307 16H6.66406"
                stroke="black"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.9974 25.3334L6.66406 16.0001L15.9974 6.66675"
                stroke="black"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Orders
          </div>
          <div>
            <Tabs defaultValue="Active Orders">
              <TabsList className="overflow-item text-black-200 flex justify-center gap-4 text-lg font-medium md:gap-10">
                <TabsTrigger
                  className="text-nowrap border-primary pb-[6px] font-poppins data-[state=active]:border-b-2"
                  value="Active Orders"
                >
                  Active Orders
                </TabsTrigger>
                <TabsTrigger
                  className="text-nowrap border-primary pb-[6px] font-poppins data-[state=active]:border-b-2"
                  value="Delivered Orders"
                >
                  Delivered Orders
                </TabsTrigger>
                <TabsTrigger
                  className="text-nowrap border-primary pb-[6px] font-poppins data-[state=active]:border-b-2"
                  value="Returned Orders"
                >
                  Returned/Cancelled Orders
                </TabsTrigger>
              </TabsList>
              <TabsContent value="Active Orders">
                {activeOrders.map((order: any) => (
                  <>
                    <div key={order.id}>
                      {/* TODO: fix the @ts-ignore */}
                      {/* @ts-ignore */}
                      <ActiveOrders activeOrders={order} reviews={reviews} />
                    </div>
                  </>
                ))}
              </TabsContent>

              <TabsContent value="Delivered Orders">
                {deliveredOrders.map((order: any) => (
                  <div key={order.id}>
                    {/* TODO: fix the @ts-ignore */}
                    {/* @ts-ignore */}
                    <DeliveredOrders
                      deliveredOrders={order}
                      reviews={reviews}
                    />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="Returned Orders">
                {returnedAndCancelledOrders.map((order: any) => (
                  <div key={order.id}>
                    {/* TODO: fix the @ts-ignore */}
                    {/* @ts-ignore */}
                    <RacOrders racOrders={order} reviews={reviews} />
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};
export default Orders;
