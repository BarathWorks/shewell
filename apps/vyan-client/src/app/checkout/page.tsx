"use server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@repo/ui/src/@/components/breadcrumb";

import OverlayCartCard from "../cart/overlay-cart-card";
import OrderSummary from "~/components/order-summary";

import AddressPopUp from "../profile/manage-address/address-popup";
import { getServerSession } from "next-auth";
import { db } from "~/server/db";

const CheckOut = async () => {
  const session = await getServerSession();

  const [userDetails, countries] = await Promise.all([
    db.user.findFirst({
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        name: true,
      },
      where: {
        email: session?.user.email!,
      },
    }),
    db.country.findMany({
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  
  const addedAddresses = await db.address.findMany({
    select: {
      id: true,
      name: true,
      city: true,
      houseNo: true,
      area: true,
      mobile: true,
      landmark: true,
      pincode: true,
      addressType: true,
      countryId: true,
      stateId: true,
    },
    where: {
      userId: userDetails?.id,
      deletedAt: null,
    },
  });
  return (
    <>
      <div className="w-full font-inter">
        <div className="container mx-auto">
          <div className="py-4 md:py-6 xl:py-[28px] 2xl:py-[32px]">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/cart">Cart</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>Checkout</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="pb-[32px] lg:pb-[55px] xl:pb-[60px] 2xl:pb-[65px]">
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-center xl:gap-10 2xl:gap-[60px]">
              <div className="bg-[#FBFBFB]  p-2 md:p-[18px] xl:basis-1/2 xl:p-5  2xl:p-8">
                <div className="mb-[14px] md:mb-4 xl:mb-[18px]">
                  <div className="mb-[4px] font-inter text-base font-semibold text-active md:text-[20px] md:leading-[30px] xl:mb-2 xl:text-base 2xl:text-[28px] 2xl:leading-[38px]">
                    Delivery Address
                  </div>
                  <div className="font-inter text-[12px] font-normal leading-4 text-inactive md:text-sm xl:text-base ">
                    Add your address to deliver the product without any hustle
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-8 lg:mb-10">
                  <AddressPopUp
                    addedAddresses={addedAddresses}
                    countries={countries}
                  />
                </div>
              </div>

              <div className=" border-border-[#E5E5E5] flex flex-col gap-5 rounded-md border px-3 py-4 md:gap-7 md:px-5 md:py-[18px] lg:flex-row lg:gap-5 xl:flex-col xl:px-[28px] xl:py-5 2xl:gap-7 2xl:px-10 2xl:py-8">
                <div className="border-border-[#E5E5E5] flex flex-col gap-4 rounded-md border xl:gap-5 2xl:gap-6 ">
                  <OverlayCartCard />
                </div>

                <OrderSummary text="Pay Now" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default CheckOut;

