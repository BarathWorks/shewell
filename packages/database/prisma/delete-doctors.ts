import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting doctor cleanup script...");

  try {
    // 1. Delete AppointmentPaymentPayout
    console.log("Deleting AppointmentPaymentPayout...");
    await prisma.appointmentPaymentPayout.deleteMany({});

    // 2. Delete Payout
    console.log("Deleting Payout...");
    await prisma.payout.deleteMany({});

    // 3. Delete AppointmentPayment
    console.log("Deleting AppointmentPayment...");
    await prisma.appointmentPayment.deleteMany({});

    // 4. Delete ProfessionalUserRating
    console.log("Deleting ProfessionalUserRating...");
    await prisma.professionalUserRating.deleteMany({});

    // 5. Delete Comment
    console.log("Deleting Comment...");
    await prisma.comment.deleteMany({});

    // 6. Delete BookAppointment
    console.log("Deleting BookAppointment...");
    await prisma.bookAppointment.deleteMany({});

    // 7. Delete AvailabilityTimings
    console.log("Deleting AvailabilityTimings...");
    await prisma.availabilityTimings.deleteMany({});

    // 8. Delete Availability
    console.log("Deleting Availability...");
    await prisma.availability.deleteMany({});

    // 9. Delete UnAvailableDay
    console.log("Deleting UnAvailableDay...");
    await prisma.unAvailableDay.deleteMany({});

    // 10. Delete ProfessionalNotification
    console.log("Deleting ProfessionalNotification...");
    await prisma.professionalNotification.deleteMany({});

    // 11. Delete professionalUserAppointmentPrice
    console.log("Deleting professionalUserAppointmentPrice...");
    await prisma.professionalUserAppointmentPrice.deleteMany({});

    // 12. Delete ProfessionalDegree
    console.log("Deleting ProfessionalDegree...");
    await prisma.professionalDegree.deleteMany({});

    // 13. Delete ProfessionalExperience
    console.log("Deleting ProfessionalExperience...");
    await prisma.professionalExperience.deleteMany({});

    // 14. Delete ProfessionalQualifications
    console.log("Deleting ProfessionalQualifications...");
    await prisma.professionalQualifications.deleteMany({});

    // 15. Delete ProfessionalAddress
    console.log("Deleting ProfessionalAddress...");
    await prisma.professionalAddress.deleteMany({});

    // 16. Delete ProfessionalIdentity
    console.log("Deleting ProfessionalIdentity...");
    await prisma.professionalIdentity.deleteMany({});

    // 17. Delete Document
    console.log("Deleting Document...");
    await prisma.document.deleteMany({});

    // 18. Delete AuthSession (Auth sessions specifically for doctors)
    // Note: Since ProfessionalUser is separate, this will clear all professional sessions.
    console.log("Deleting AuthSession...");
    await prisma.authSession.deleteMany({});

    // 19. Finally, delete all ProfessionalUsers
    console.log("Deleting all ProfessionalUsers (Doctors)...");
    const { count } = await prisma.professionalUser.deleteMany({});

    console.log(`Successfully deleted ${count} doctor(s) and all their related data.`);
    console.log("Admin and Patient users were NOT affected.");

  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
