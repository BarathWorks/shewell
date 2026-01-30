export const revalidate = 0;

import { db } from '@/src/server/db';
import OrderTable from './orders-table';
import { Suspense } from 'react';
import { Skeleton } from 'primereact/skeleton';
const Orders = async () => {
  const orders = await db.order.findMany({
    select: {
      id: true,
      userId: true,
      status: true,
      subTotalInCent: true,
      taxesInCent: true,
      deliveryFeesInCent: true,
      totalInCent: true,
      discountInCent:true,
      couponId: true,
      addressId: true,
      expectedDelivery: true,
      orderPlaced: true,
      cancelledDate: true,
  shiprocket_order_id:true,
      lineItems: {
        select: {
          id:true,
          orderId:true,
          productVariantId:true,
          perUnitPriceInCent:true,
          quantity:true,
          subTotalInCent:true,
          discountInCent:true,
          totalInCent:true,
          productVariant: {
            include:{
              product:{
                select: {
                  id: true,
                  name: true,
                  media: {
                    select: {
                      media: {
                        select: {
                          id: true,
                          fileKey: true,
                          fileUrl: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      address:true,
    },

  });
  return(
    <>
      <Suspense fallback={<Skeleton width="100%" height="100px" />}>
    <OrderTable orders={orders}/>
    </Suspense>
    </>
  )
};

export default Orders;
