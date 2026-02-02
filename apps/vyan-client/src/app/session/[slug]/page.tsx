import { notFound } from "next/navigation";
import { Metadata } from "next";
import { NavigationHeaderSection } from "@/components/NavigationHeaderSection";
import { CourseDetailHeaderSection } from "@/components/course-detail/CourseDetailHeaderSection";
import { SessionOverviewSection } from "@/components/course-detail/SessionOverviewSection";
import { CourseInfoSection } from "@/components/course-detail/CourseInfoSection";
import { BookingSection } from "@/components/course-detail/BookingSection";
import { FooterInfoSection } from "@/components/course-detail/FooterInfoSection";
import { SupportContactSection } from "@/components/course-detail/SupportContactSection";
import { MeetingLinkSection } from "@/components/course-detail/MeetingLinkSection";
import { api } from "~/trpc/server";
import { format } from "date-fns";
import { getServerAuthSession } from "~/server/auth";
import { PaymentStatus } from "@repo/database";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const session = await api.session.getSessionBySlug({ slug: params.slug });

    return {
      title: `${session.title} | Shewell`,
      description: session.overview || session.title,
    };
  } catch (error) {
    return {
      title: "Session Not Found",
    };
  }
}

// Main page component - now async like products page
export default async function SessionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  // Fetch session from database
  let session;
  try {
    session = await api.session.getSessionBySlug({ slug: params.slug });
  } catch (error) {
    notFound();
  }

  // Get current user session
  const userSession = await getServerAuthSession();
  const currentUserId = userSession?.user?.id;

  // Check if user is registered and has completed payment
  const userRegistration = session.registrations.find(
    (reg: any) =>
      reg.userId === currentUserId &&
      reg.paymentStatus === PaymentStatus.COMPLETED,
  );

  const canViewMeetingLink =
    session.type === "ONLINE" &&
    session.meetingLink &&
    userRegistration !== undefined;

  // Format dates
  const sessionDate = format(new Date(session.startAt), "dd MMM yyyy");
  const sessionTime = `${format(new Date(session.startAt), "h:mm a")} to ${format(new Date(session.endAt), "h:mm a")} IST`;

  // Static content for course details
  const whoIsItFor = [
    "Moms in their third trimester preparing for nursing",
    "New mothers within the first 6 months postpartum",
    "Moms facing latch or feeding challenges with their babies",
    "Parents looking for practical guidance and emotional support",
    "Families wanting to understand and support breastfeeding better",
  ];

  const whatYouLearn = [
    "Establishing a good latch and feeding position",
    "Maintaining milk supply and recognizing baby's hunger cues",
    "Expressing, storing, and feeding breast milk",
    "Managing common concerns and when to seek help",
    "Using formula when needed - without guilt",
    "Emotional and mental aspects of breastfeeding",
    "Live Q&A for personal questions",
  ];

  const terms = [
    "Class link shared on session day (join entry for tech checks).",
    "Fee is non-refundable and non-transferable.",
    "Active internet connection required.",
    "By continuing, you agree to share your info with Shewell & the course provider, as per data protection laws.",
  ];

  const supportItems = [
    "Live guidance from certified prenatal yoga instructors",
    "Email group format for personalized feedback",
    "24/7 chat support for scheduling/rescheduling",
    "Post-session tips to practice at home",
    "Reminders via email and WhatsApp",
  ];

  const contactItems = [
    "Live guidance from certified prenatal yoga instructors",
    "Email group format for personalized feedback",
    "24/7 chat support for scheduling/rescheduling",
    "Post-session tips to practice at home",
    "Reminders via email and WhatsApp",
  ];

  return (
    <main className="relative flex w-full flex-col items-center bg-white min-h-screen">
      <CourseDetailHeaderSection
        title={session.title}
        instructor="Expert Instructor"
        language={session.language || "English"}
        isOnline={session.type === "ONLINE"}
        hasRecording={session.type === "RECORDING"}
        date={sessionDate}
        time={sessionTime}
        banners={session.banners}
      />

      <SessionOverviewSection
        description={
          session.overview || session.category?.name || session.title
        }
      />

      <CourseInfoSection whoIsItFor={whoIsItFor} whatYouLearn={whatYouLearn} />

      {canViewMeetingLink && (
        <MeetingLinkSection
          meetingLink={session.meetingLink!}
          sessionTitle={session.title}
        />
      )}

      <BookingSection
        banners={session.banners}
        price={Number(session.price)}
        sessionId={session.id}
        isRegistered={userRegistration !== undefined}
        meetingLink={session.meetingLink}
      />
      
      <FooterInfoSection terms={terms} />

      <SupportContactSection
        supportTitle="Support"
        supportItems={supportItems}
        contactTitle="Contact"
        contactItems={contactItems}
      />
    </main>
  );
}
