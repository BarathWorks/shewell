// 'use server';

import { db } from '@/src/server/db';
import { Skeleton } from 'primereact/skeleton';
import { Suspense } from 'react';
import InventoryTable from './inventory-table';
export const revalidate = 0;

const InventoryPage = async () => {
  const inventoryData = await db.productVariant.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      product: {
        select: {
          id: true,
          name: true
        }
      },
      productVariantInventory: {
        select: {
          id: true,
          incoming: true,
          available: true,
          unavailable: true,
          onHand: true,
          commited: true,
          productVariantId: true,
          productVariantInventoryUpdates: {
            select: {
              id: true,
              quantity: true,
              reason: true,
              updateById: true,
              productVariantInventoryId: true,
              updateType: true
            }
          }
        }
      }
    },
    where: {
      product: {
        deletedAt: null
      },
      deletedAt: null
    }
  });

  console.log('');
  return (
    <>
      <Suspense fallback={<Skeleton width="100%" height="100px" />}>
        <InventoryTable inventoryData={inventoryData} />
      </Suspense>
    </>
  );
};

export default InventoryPage;
