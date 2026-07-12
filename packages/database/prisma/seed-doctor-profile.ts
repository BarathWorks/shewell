import { hash } from "bcryptjs";
import { PrismaClient, Day } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding doctor profile metadata...");

  // 1. Seed Placeholder Media for Specialization Categories
  console.log("Creating placeholder media...");
  const specMedia = await db.media.upsert({
    where: { id: "med_spec_placeholder" },
    update: {},
    create: {
      id: "med_spec_placeholder",
      fileKey: "specializations/placeholder.png",
      fileUrl: "https://shewell-temporary.s3.ap-south-1.amazonaws.com/specializations/placeholder.png",
      comments: "Specialization placeholder image",
      mimeType: "image/png",
    },
  });

  const profileMedia = await db.media.upsert({
    where: { id: "med_doctor_demo_profile" },
    update: {},
    create: {
      id: "med_doctor_demo_profile",
      fileKey: "professionalUser/doctor_demo/profile.png",
      fileUrl: "https://shewell-temporary.s3.ap-south-1.amazonaws.com/professionalUser/doctor_demo/profile.png",
      comments: "Doctor profile photo placeholder",
      mimeType: "image/png",
    },
  });

  // 2. Seed Specialization Categories & Specializations
  console.log("Creating specialization parent category...");
  const parentCategory = await db.professionalSpecializationParentCategory.upsert({
    where: { id: "cat_clinical_services" },
    update: {},
    create: {
      id: "cat_clinical_services",
      name: "Clinical Services",
      active: true,
      mediaId: specMedia.id,
    },
  });

  console.log("Creating specializations...");
  const specializationsData = [
    { id: "spec_obs_gyn", specialization: "Obstetrics & Gynecology", active: true, parentId: parentCategory.id },
    { id: "spec_gen_med", specialization: "General Medicine", active: true, parentId: parentCategory.id },
    { id: "spec_pediatrics", specialization: "Pediatrics", active: true, parentId: parentCategory.id },
    { id: "spec_dermatology", specialization: "Dermatology", active: true, parentId: parentCategory.id },
  ];

  for (const s of specializationsData) {
    await db.professionalSpecializations.upsert({
      where: { id: s.id },
      update: {
        specialization: s.specialization,
        active: s.active,
        professionalSpecializationParentCategoryId: s.parentId,
      },
      create: {
        id: s.id,
        specialization: s.specialization,
        active: s.active,
        professionalSpecializationParentCategoryId: s.parentId,
      },
    });
  }

  // 3. Seed Languages
  console.log("Creating languages...");
  const languagesData = [
    { id: "lang_english", language: "English", active: true },
    { id: "lang_hindi", language: "Hindi", active: true },
    { id: "lang_kannada", language: "Kannada", active: true },
    { id: "lang_tamil", language: "Tamil", active: true },
    { id: "lang_telugu", language: "Telugu", active: true },
    { id: "lang_spanish", language: "Spanish", active: true },
  ];

  for (const l of languagesData) {
    await db.professionalLanguages.upsert({
      where: { id: l.id },
      update: {
        language: l.language,
        active: l.active,
      },
      create: {
        id: l.id,
        language: l.language,
        active: l.active,
      },
    });
  }

  // 4. Seed Country, State, City
  console.log("Creating country, state, city...");
  const country = await db.country.upsert({
    where: { id: "country_india" },
    update: {},
    create: {
      id: "country_india",
      name: "India",
      iso3: "IND",
      iso2: "IN",
      phoneCode: "91",
      currency: "INR",
      currencyName: "Indian Rupee",
      currencySymbol: "₹",
      region: "Asia",
      active: true,
    },
  });

  const state = await db.state.upsert({
    where: { id: "state_karnataka" },
    update: {},
    create: {
      id: "state_karnataka",
      name: "Karnataka",
      stateCode: "KA",
      countryId: country.id,
    },
  });

  const city = await db.city.upsert({
    where: { id: "city_bangalore" },
    update: {},
    create: {
      id: "city_bangalore",
      name: "Bengaluru",
      countryId: country.id,
      stateId: state.id,
      latitude: 12.9716,
      longitude: 77.5946,
    },
  });

  // 5. Seed or Update Doctor Profile
  console.log("Creating or updating doctor profile for doctor@shewell.com...");
  const passwordHash = await hash("doctor@123", 10);
  
  const doctor = await db.professionalUser.upsert({
    where: { email: "doctor@shewell.com" },
    update: {
      firstName: "Demo",
      lastName: "Doctor",
      phoneNumber: "9000000000",
      dob: new Date("1990-01-01"),
      gender: "Male",
      userName: "doctor_demo",
      isapproved: true,
      aboutYou: "Experienced obstetrician and gynecologist with over 10 years of clinical practice, dedicated to women's comprehensive healthcare and wellness.",
      aboutEducation: "Graduated with MD in Obstetrics & Gynecology from Johns Hopkins University School of Medicine, followed by residency at Mayo Clinic.",
      displayQualificationId: "spec_obs_gyn",
      mediaId: profileMedia.id,
    },
    create: {
      id: "doc_1783436212644",
      email: "doctor@shewell.com",
      passwordHash,
      firstName: "Demo",
      lastName: "Doctor",
      phoneNumber: "9000000000",
      dob: new Date("1990-01-01"),
      gender: "Male",
      userName: "doctor_demo",
      isapproved: true,
      aboutYou: "Experienced obstetrician and gynecologist with over 10 years of clinical practice, dedicated to women's comprehensive healthcare and wellness.",
      aboutEducation: "Graduated with MD in Obstetrics & Gynecology from Johns Hopkins University School of Medicine, followed by residency at Mayo Clinic.",
      displayQualificationId: "spec_obs_gyn",
      mediaId: profileMedia.id,
    },
  });

  // 6. Connect Specializations to Doctor
  console.log("Connecting specializations to doctor...");
  await db.professionalUser.update({
    where: { id: doctor.id },
    data: {
      ProfessionalSpecializations: {
        set: [],
        connect: [
          { id: "spec_obs_gyn" },
          { id: "spec_gen_med" },
        ],
      },
      languages: {
        set: [],
        connect: [
          { id: "lang_english" },
          { id: "lang_hindi" },
        ],
      },
    },
  });

  // 7. Seed Doctor Degrees
  console.log("Creating doctor degrees...");
  await db.professionalDegree.deleteMany({
    where: { professionalUserId: doctor.id },
  });
  await db.professionalDegree.createMany({
    data: [
      {
        degree: "MD in Obstetrics & Gynecology (Johns Hopkins University)",
        collegeName: "Johns Hopkins University School of Medicine",
        completionDate: new Date("2016-05-15"),
        professionalUserId: doctor.id,
      },
      {
        degree: "MBBS",
        collegeName: "Bangalore Medical College",
        completionDate: new Date("2012-03-10"),
        professionalUserId: doctor.id,
      },
    ],
  });

  // 8. Seed Doctor Experiences
  console.log("Creating doctor experiences...");
  await db.professionalExperience.deleteMany({
    where: { professionalUserId: doctor.id },
  });
  await db.professionalExperience.createMany({
    data: [
      {
        startingYear: "2018",
        endingYear: "Present",
        department: "Obstetrics & Gynecology",
        position: "Senior Consultant OB-GYN",
        location: "Apollo Hospitals, Bangalore",
        professionalUserId: doctor.id,
      },
      {
        startingYear: "2016",
        endingYear: "2018",
        department: "Gynecology",
        position: "Junior Consultant",
        location: "Fortis La Femme, Bangalore",
        professionalUserId: doctor.id,
      },
    ],
  });

  // 9. Seed Doctor Address & Identity & Bank details
  console.log("Creating doctor address and identity...");
  await db.professionalAddress.upsert({
    where: { professionalUserId: doctor.id },
    update: {
      countryId: country.id,
      stateId: state.id,
      city: "Bengaluru",
      completeAddress: "123 Health Care Road, Jayanagar 4th Block",
      pincode: "560041",
    },
    create: {
      professionalUserId: doctor.id,
      countryId: country.id,
      stateId: state.id,
      city: "Bengaluru",
      completeAddress: "123 Health Care Road, Jayanagar 4th Block",
      pincode: "560041",
    },
  });

  await db.professionalIdentity.upsert({
    where: { professionalUserId: doctor.id },
    update: {
      panNumber: "ABCDE1234F",
      aadhaarNumber: "123456789012",
      licenseNumber: "KMC-12345",
      isVerified: true,
    },
    create: {
      professionalUserId: doctor.id,
      panNumber: "ABCDE1234F",
      aadhaarNumber: "123456789012",
      licenseNumber: "KMC-12345",
      isVerified: true,
    },
  });

  console.log("Updating doctor bank details...");
  await db.professionalUser.update({
    where: { id: doctor.id },
    data: {
      bankAccountHolderName: "Demo Doctor",
      bankAccountNumber: "987654321012",
      bankName: "HDFC Bank",
      bankBranch: "Jayanagar",
      bankIfscCode: "HDFC0000123",
      bankUpiId: "demodoctor@okhdfc",
      sessionMode: "BOTH",
      listing: "YES",
    },
  });

  // 10. Seed Consultation Prices
  console.log("Creating consultation prices...");
  await db.professionalUserAppointmentPrice.deleteMany({
    where: { professionalUserId: doctor.id },
  });
  await db.professionalUserAppointmentPrice.createMany({
    data: [
      {
        time: 30,
        priceInCentsForSingle: 50000, // 500 INR
        priceInCentsForCouple: 80000, // 800 INR
        professionalUserId: doctor.id,
      },
      {
        time: 60,
        priceInCentsForSingle: 90000,  // 900 INR
        priceInCentsForCouple: 150000, // 1500 INR
        professionalUserId: doctor.id,
      },
    ],
  });

  // 11. Seed Doctor Availability
  console.log("Creating doctor availability...");
  await db.availability.deleteMany({
    where: { professionalUserId: doctor.id },
  });

  const days = [Day.SUN, Day.MON, Day.TUE, Day.WED, Day.THU, Day.FRI, Day.SAT];
  for (const day of days) {
    const isWeekEnd = day === Day.SUN || day === Day.SAT;
    
    // Create availability record
    const availability = await db.availability.create({
      data: {
        available: true,
        day,
        professionalUserId: doctor.id,
      },
    });

    // Create timings for this availability
    const startHour = isWeekEnd ? 9 : 9;
    const endHour = isWeekEnd ? 13 : 18;

    // Create a time date starting at 0 hours
    const startingTime = new Date();
    startingTime.setHours(startHour, 0, 0, 0);

    const endingTime = new Date();
    endingTime.setHours(endHour, 0, 0, 0);

    await db.availabilityTimings.create({
      data: {
        startingTime,
        endingTime,
        availabilityId: availability.id,
      },
    });
  }

  console.log("Doctor profile database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
