-- CreateIndex
CREATE INDEX "Availability_professionalUserId_idx" ON "Availability"("professionalUserId");

-- CreateIndex
CREATE INDEX "Availability_day_idx" ON "Availability"("day");

-- CreateIndex
CREATE INDEX "BookAppointment_userId_idx" ON "BookAppointment"("userId");

-- CreateIndex
CREATE INDEX "BookAppointment_professionalUserId_idx" ON "BookAppointment"("professionalUserId");

-- CreateIndex
CREATE INDEX "BookAppointment_status_idx" ON "BookAppointment"("status");

-- CreateIndex
CREATE INDEX "BookAppointment_startingTime_idx" ON "BookAppointment"("startingTime");

-- CreateIndex
CREATE INDEX "BookAppointment_userId_status_idx" ON "BookAppointment"("userId", "status");

-- CreateIndex
CREATE INDEX "BookAppointment_userId_status_startingTime_idx" ON "BookAppointment"("userId", "status", "startingTime");

-- CreateIndex
CREATE INDEX "Patient_userId_idx" ON "Patient"("userId");

-- CreateIndex
CREATE INDEX "Patient_email_idx" ON "Patient"("email");

-- CreateIndex
CREATE INDEX "ProfessionalSpecializations_professionalSpecializationParen_idx" ON "ProfessionalSpecializations"("professionalSpecializationParentCategoryId");

-- CreateIndex
CREATE INDEX "ProfessionalSpecializations_active_idx" ON "ProfessionalSpecializations"("active");

-- CreateIndex
CREATE INDEX "ProfessionalUser_email_idx" ON "ProfessionalUser"("email");

-- CreateIndex
CREATE INDEX "ProfessionalUser_userName_idx" ON "ProfessionalUser"("userName");

-- CreateIndex
CREATE INDEX "ProfessionalUser_isapproved_idx" ON "ProfessionalUser"("isapproved");

-- CreateIndex
CREATE INDEX "ProfessionalUser_deletedAt_idx" ON "ProfessionalUser"("deletedAt");

-- CreateIndex
CREATE INDEX "ProfessionalUser_avgRating_idx" ON "ProfessionalUser"("avgRating");

-- CreateIndex
CREATE INDEX "ProfessionalUser_displayQualificationId_idx" ON "ProfessionalUser"("displayQualificationId");

-- CreateIndex
CREATE INDEX "UnAvailableDay_professionalUserId_idx" ON "UnAvailableDay"("professionalUserId");

-- CreateIndex
CREATE INDEX "UnAvailableDay_date_idx" ON "UnAvailableDay"("date");

-- CreateIndex
CREATE INDEX "UnAvailableDay_professionalUserId_date_idx" ON "UnAvailableDay"("professionalUserId", "date");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_verifiedAt_idx" ON "User"("verifiedAt");
