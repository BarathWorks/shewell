-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "maxBookings" INTEGER;

-- CreateIndex
CREATE INDEX "AdditionalPatient_deletedAt_idx" ON "AdditionalPatient"("deletedAt");

-- CreateIndex
CREATE INDEX "Address_deletedAt_idx" ON "Address"("deletedAt");

-- CreateIndex
CREATE INDEX "AvailabilityTimings_availabilityId_idx" ON "AvailabilityTimings"("availabilityId");

-- CreateIndex
CREATE INDEX "AvailablePincodes_deletedAt_idx" ON "AvailablePincodes"("deletedAt");

-- CreateIndex
CREATE INDEX "Blog_deletedAt_idx" ON "Blog"("deletedAt");

-- CreateIndex
CREATE INDEX "BlogCategory_deletedAt_idx" ON "BlogCategory"("deletedAt");

-- CreateIndex
CREATE INDEX "Category_deletedAt_idx" ON "Category"("deletedAt");

-- CreateIndex
CREATE INDEX "Coupon_deletedAt_idx" ON "Coupon"("deletedAt");

-- CreateIndex
CREATE INDEX "HomeBanner_deletedAt_idx" ON "HomeBanner"("deletedAt");

-- CreateIndex
CREATE INDEX "LineItem_orderId_idx" ON "LineItem"("orderId");

-- CreateIndex
CREATE INDEX "LineItem_productVariantId_idx" ON "LineItem"("productVariantId");

-- CreateIndex
CREATE INDEX "MediaOnProducts_productId_idx" ON "MediaOnProducts"("productId");

-- CreateIndex
CREATE INDEX "Notification_deletedAt_idx" ON "Notification"("deletedAt");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_orderPlaced_idx" ON "Order"("orderPlaced");

-- CreateIndex
CREATE INDEX "Order_userId_status_idx" ON "Order"("userId", "status");

-- CreateIndex
CREATE INDEX "Patient_deletedAt_idx" ON "Patient"("deletedAt");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_deletedAt_idx" ON "Product"("deletedAt");

-- CreateIndex
CREATE INDEX "Product_active_idx" ON "Product"("active");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "ProductVariant_deletedAt_idx" ON "ProductVariant"("deletedAt");

-- CreateIndex
CREATE INDEX "ProfessionalSpecializationParentCategory_deletedAt_idx" ON "ProfessionalSpecializationParentCategory"("deletedAt");

-- CreateIndex
CREATE INDEX "ProfessionalSpecializations_deletedAt_idx" ON "ProfessionalSpecializations"("deletedAt");

-- CreateIndex
CREATE INDEX "ProfessionalUserRating_professionalUserId_idx" ON "ProfessionalUserRating"("professionalUserId");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_approved_idx" ON "Review"("approved");

-- CreateIndex
CREATE INDEX "Session_status_idx" ON "Session"("status");

-- CreateIndex
CREATE INDEX "Session_startAt_idx" ON "Session"("startAt");

-- CreateIndex
CREATE INDEX "Session_type_idx" ON "Session"("type");

-- CreateIndex
CREATE INDEX "Session_categoryId_idx" ON "Session"("categoryId");

-- CreateIndex
CREATE INDEX "Session_status_startAt_idx" ON "Session"("status", "startAt");

-- CreateIndex
CREATE INDEX "Session_status_type_idx" ON "Session"("status", "type");

-- CreateIndex
CREATE INDEX "SessionCategory_trimester_idx" ON "SessionCategory"("trimester");

-- CreateIndex
CREATE INDEX "SessionRegistration_userId_idx" ON "SessionRegistration"("userId");

-- CreateIndex
CREATE INDEX "SessionRegistration_sessionId_idx" ON "SessionRegistration"("sessionId");

-- CreateIndex
CREATE INDEX "SessionRegistration_paymentStatus_idx" ON "SessionRegistration"("paymentStatus");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
