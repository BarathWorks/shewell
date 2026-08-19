"use server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import Razorpay from "razorpay";
import crypto from "crypto";
import { db } from "~/server/db";

interface IRazorPayDetails {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const createRazorpayOrder = async ({
  amount,
  currency,
  receipt,
}: {
  amount: number;
  currency: string;
  receipt: string;
  name: string;
}) => {
  try {
    // Validate environment variables
    if (
      !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === "" ||
      process.env.RAZORPAY_KEY_SECRET === ""
    ) {
      console.error(
        "Razorpay credentials are not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      );
      return null;
    }

    const razorpayInstance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    return await razorpayInstance.orders.create({
      amount,
      currency,
      receipt,
    });
  } catch (error) {
    console.error("Failed to create Razorpay order:", error);
    return null;
  }
};

// ============================================
// SESSION BOOKING PAYMENT ACTIONS
// ============================================

interface ISessionBookingData {
  sessionId: string;
  name: string;
  email: string;
  mobile: string;
  isPregnant?: boolean;
  trimester?: string;
  dueDate?: string;
  isNewMom?: boolean;
  babyDob?: string;
  languages?: string[];
  timeSlot?: string;
}

export const createSessionOrder = async (bookingData: ISessionBookingData) => {
  let messageError: string | null = null;
 
  const session = await getServerSession();
 
  if (!session) {
    return {
      error: "Sign in to proceed",
    };
  }
 
  const user = await db.user.findFirst({
    where: {
      email: session.user.email!,
    },
  });
 
  if (!user) {
    return {
      error: "User not found.",
    };
  }
 
  try {
    // Phase 1: Atomic Reservation within a transaction
    const sessionDetails = await db.$transaction(async (tx) => {
      // Lock the session row to prevent race conditions
      await tx.$executeRaw`SELECT * FROM "Session" WHERE id = ${bookingData.sessionId} FOR UPDATE`;
 
      const details = await tx.session.findUnique({
        where: { id: bookingData.sessionId },
        select: {
          id: true,
          price: true,
          title: true,
          slug: true,
          maxBookings: true,
        },
      });
 
      if (!details) {
        throw new Error("Session not found.");
      }
 
      // Check Capacity
      if (details.maxBookings) {
        const activeRegistrations = await tx.sessionRegistration.count({
          where: {
            sessionId: bookingData.sessionId,
            OR: [
              { paymentStatus: "COMPLETED" },
              {
                paymentStatus: "PENDING",
                createdAt: {
                  // Count pending registrations from the last 15 minutes as "reserving" a slot
                  gte: new Date(Date.now() - 15 * 60 * 1000),
                },
              },
            ],
          },
        });
 
        if (activeRegistrations >= details.maxBookings) {
          throw new Error("Session is full. Please try again later.");
        }
      }
 
      // Check for existing registration before creating a new one
      const existingRegistration = await tx.sessionRegistration.findFirst({
        where: {
          userId: user.id,
          sessionId: bookingData.sessionId,
        },
      });
 
      if (existingRegistration && existingRegistration.paymentStatus === "COMPLETED") {
        throw new Error("You have already registered for this session.");
      }
 
      // Upsert pending registration to "reserve" the slot early
      if (existingRegistration) {
        await tx.sessionRegistration.update({
          where: { id: existingRegistration.id },
          data: {
            paymentStatus: "PENDING",
            amountPaid: details.price,
            createdAt: new Date(), // Refresh the 15-minute reservation timer
          },
        });
      } else {
        await tx.sessionRegistration.create({
          data: {
            userId: user.id,
            sessionId: bookingData.sessionId,
            paymentStatus: "PENDING",
            amountPaid: details.price,
          },
        });
      }
 
      return details;
    }, { timeout: 10000 });
 
    // Phase 2: Create Razorpay order (outside of DB transaction to avoid long-held locks)
    const amountInPaise = Math.round(Number(sessionDetails.price) * 100);
    console.log("Creating razorpay order for session booking", amountInPaise);
    
    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: "INR",
      receipt: `session_${bookingData.sessionId}_${Date.now()}`.slice(0, 36),
      name: "Shewell Session Booking",
    });
 
    if (!razorpayOrder || !razorpayOrder.id) {
      return {
        error: "Failed to create payment order. Please try again.",
      };
    }
 
    // Phase 3: Update registration with the real Razorpay order ID
    await db.sessionRegistration.update({
      where: {
        sessionId_userId: {
          sessionId: bookingData.sessionId,
          userId: user.id,
        },
      },
      data: {
        razorpayOrderId: razorpayOrder.id,
      },
    });
 
    revalidatePath(`/session/${sessionDetails.slug}`);
 
    const razorpayConfig = {
      user: {
        name: bookingData.name || user.name,
        email: bookingData.email || user.email,
      },
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      description: `Booking for ${sessionDetails.title}`,
    };
 
    return { error: null, razorpay: razorpayConfig };
  } catch (err: any) {
    console.error("Error in createSessionOrder:", err);
    return {
      error: err.message || "An unexpected error occurred",
    };
  }
};

export const verifySessionPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}: IRazorPayDetails) => {
  const session = await getServerSession();
  const user = await db.user.findFirst({
    where: {
      email: session?.user.email || "",
    },
  });

  if (!user) {
    return {
      error: "Unauthorized",
    };
  }

  // Verify signature
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    return {
      message: "Payment verification failed - invalid signature",
    };
  }

  // Fetch order from Razorpay to confirm payment
  const razorpayInstance = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const orderDetails = await razorpayInstance.orders.fetch(razorpay_order_id);
  console.log("Order details for session:", orderDetails);

  if (!orderDetails.amount_paid) {
    return {
      message: "Payment not completed",
    };
  }

  try {
    // Update SessionRegistration status
    const registration = await db.sessionRegistration.updateMany({
      data: {
        paymentStatus: "COMPLETED",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      where: {
        razorpayOrderId: razorpay_order_id,
        userId: user.id,
      },
    });

    // Get session details for revalidation
    const sessionReg = await db.sessionRegistration.findFirst({
      where: {
        razorpayOrderId: razorpay_order_id,
      },
      include: {
        session: true,
      },
    });

    if (sessionReg?.session) {
      revalidatePath(`/session/${sessionReg.session.slug}`);
      
      // Send confirmation email
      try {
        const { sendEmail } = await import("@repo/mail");
        const { getSessionBookingEmailTemplate } = await import("./email-templates");
        
        const emailTemplate = getSessionBookingEmailTemplate({
          userName: user.name || "User",
          userEmail: user.email!,
          sessionTitle: sessionReg.session.title,
          sessionDate: sessionReg.session.startAt,
          sessionTime: `${sessionReg.session.startAt.toLocaleTimeString()} - ${sessionReg.session.endAt.toLocaleTimeString()}`,
          amountPaid: orderDetails.amount_paid,
          paymentId: razorpay_payment_id,
        });
        
        await sendEmail({
          from: process.env.FROM_EMAIL!,
          to: [user.email!],
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
      } catch (emailError) {
        console.error("Failed to send session booking email:", emailError);
        // Don't fail the payment verification if email fails
      }
    }

    return {
      orderDetails,
      message: "Payment verified successfully!",
      success: true,
    };
  } catch (error) {
    console.error("Error updating session registration:", error);
    return {
      message: "Error updating registration status",
    };
  }
};
