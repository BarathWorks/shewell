-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_countryId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_stateId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_userId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_couponId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_addressId_fkey";

-- DropForeignKey
ALTER TABLE "LineItem" DROP CONSTRAINT "LineItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "LineItem" DROP CONSTRAINT "LineItem_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "AvailablePincodes" DROP CONSTRAINT "AvailablePincodes_stateId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "FAQ" DROP CONSTRAINT "FAQ_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductBenefit" DROP CONSTRAINT "ProductBenefit_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariantInventory" DROP CONSTRAINT "ProductVariantInventory_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariantInventoryUpdate" DROP CONSTRAINT "ProductVariantInventoryUpdate_updateById_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariantInventoryUpdate" DROP CONSTRAINT "ProductVariantInventoryUpdate_productVariantInventoryId_fkey";

-- DropForeignKey
ALTER TABLE "ProductStats" DROP CONSTRAINT "ProductStats_productId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_parentCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "MediaOnProducts" DROP CONSTRAINT "MediaOnProducts_productId_fkey";

-- DropForeignKey
ALTER TABLE "MediaOnProducts" DROP CONSTRAINT "MediaOnProducts_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_productId_fkey";

-- DropForeignKey
ALTER TABLE "_CouponToProduct" DROP CONSTRAINT "_CouponToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_CouponToProduct" DROP CONSTRAINT "_CouponToProduct_B_fkey";

-- DropForeignKey
ALTER TABLE "_CouponToUser" DROP CONSTRAINT "_CouponToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_CouponToUser" DROP CONSTRAINT "_CouponToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToUser" DROP CONSTRAINT "_ProductToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToUser" DROP CONSTRAINT "_ProductToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToCoupon" DROP CONSTRAINT "_CategoryToCoupon_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToCoupon" DROP CONSTRAINT "_CategoryToCoupon_B_fkey";

-- DropTable
DROP TABLE "Address";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "AppConfig";

-- DropTable
DROP TABLE "Coupon";

-- DropTable
DROP TABLE "LineItem";

-- DropTable
DROP TABLE "AvailablePincodes";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "FAQ";

-- DropTable
DROP TABLE "ProductBenefit";

-- DropTable
DROP TABLE "ProductVariant";

-- DropTable
DROP TABLE "ProductVariantInventory";

-- DropTable
DROP TABLE "ProductVariantInventoryUpdate";

-- DropTable
DROP TABLE "ProductStats";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "MediaOnProducts";

-- DropTable
DROP TABLE "Review";

-- DropTable
DROP TABLE "_CouponToProduct";

-- DropTable
DROP TABLE "_CouponToUser";

-- DropTable
DROP TABLE "_ProductToUser";

-- DropTable
DROP TABLE "_CategoryToCoupon";

-- DropEnum
DROP TYPE "OrderStatus";

-- DropEnum
DROP TYPE "ProductVariantInventoryUpdateType";

-- DropEnum
DROP TYPE "ProductCategory";

