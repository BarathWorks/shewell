"use server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import Razorpay from "razorpay";
import crypto from "crypto";
import { ICart, ICartLineItem } from "~/models/cart.model";
import { db } from "~/server/db";
import { calculateDiscountedPrice } from "./discountPrice";
import { recalculateCart } from "~/store/cart.store";
import { receiveMessageOnPort } from "worker_threads";
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

export const startBuyingProducts = async (cart: ICart) => {
  let messageError: string | null = null;

  const session = await getServerSession();

  if (!session) {
    return {
      error: "You need to signIn to buy products.",
    };
  }

  const user = await db.user.findFirst({
    where: {
      email: session.user.email!,
    },
  });

  //productvaraint ids of all the items in the cart
  const productVarinatIds = cart.lineItems.map((p) => p.productVariantId);

  //fetching the prices of all the productVariants in the cart
  const productVariants = await db.productVariant.findMany({
    where: {
      id: {
        in: productVarinatIds,
      },
    },
  });
  //updated cart line items
  const updatedCartLineItems: ICartLineItem[] = [];

  for (const i of cart.lineItems) {
    const variant = productVariants.find((p) => p.id === i.productVariantId);

    if (!variant) {
      continue;
    }

    const perUnitPriceInCent = calculateDiscountedPrice(
      variant.priceInCents,
      variant.discountInCents,
      variant.discountInPercentage,
      variant.discountEndDate,
      // variant.discountEndDate,
    );
    if (perUnitPriceInCent) {
      updatedCartLineItems.push({
        ...i,
        perUnitPriceInCent: perUnitPriceInCent,
        totalInCent: perUnitPriceInCent * i.quantity,
      });
    }
  }
  //reCalculated cart
  const recalCulatedCart = recalculateCart(cart, updatedCartLineItems);
  console.log("cart is", cart.totalInCent);

  console.log("reCalculated cart is", recalCulatedCart.totalInCent);
  if (recalCulatedCart.totalInCent != cart.totalInCent) {
    console.log("prices don't match");
    return {
      error: "Retry!!! Prices may have changed",
      url: "/cart",
    };
  }

  //created razorpay order
  const razorpayOrder = await createRazorpayOrder({
    amount: recalCulatedCart.totalInCent,
    currency: "INR",
    receipt: "SheWell Products",
    name: "SheWell",
  });

  console.log("razorpay order created", razorpayOrder);

  // Guard against undefined razorpay order
  if (!razorpayOrder || !razorpayOrder.id) {
    return {
      error: "Failed to create payment order. Please try again.",
    };
  }

  try {
    await db.order.create({
      data: {
        userId: user?.id!,
        status: "PAYMENT_PENDING",
        subTotalInCent: recalCulatedCart.subTotalInCent,
        taxesInCent: recalCulatedCart.taxesInCent,
        deliveryFeesInCent: recalCulatedCart.deliveryFeesInCent,
        totalInCent: recalCulatedCart.totalInCent,
        couponId: cart.coupon?.id,
        addressId: cart.address?.id!,
        orderPlaced: new Date(),
        razorpay_order_id: razorpayOrder.id,
        lineItems: {
          createMany: {
            data: recalCulatedCart.lineItems.map((lineItem) => ({
              productVariantId: lineItem.productVariantId,
              discountInCent: lineItem.discountInCent,
              perUnitPriceInCent: lineItem.perUnitPriceInCent,
              quantity: lineItem.quantity,
              totalInCent: lineItem.totalInCent,
              subTotalInCent: lineItem.subTotalInCent,
            })),
          },
        },
      },
    });
    revalidatePath("/profile/orders");
  } catch (err: any) {
    messageError: err.message;
  }

  const razorpayConfig = {
    user: {
      name: user?.name,
      email: user?.email,
    },
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    description: razorpayOrder.description,
  };
  return { error: messageError, razorpay: razorpayConfig };
};

export const updateProductStatus = async ({
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
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    return {
      message: "Payment is not verified",
    };
  }

  const razorpayInstance = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const orderDetails = await razorpayInstance.orders.fetch(razorpay_order_id);
  console.log("order details are", orderDetails);
  if (!orderDetails.amount_paid) {
    return {
      message: "Payment is not verified",
    };
  }
  try {
    await db.$transaction(async (tx) => {
      await tx.order.updateMany({
        data: {
          status: "PAYMENT_SUCCESSFUL",
          razorpay_payment_id: razorpay_payment_id,
          razorpay_signature: razorpay_signature,
        },
        where: {
          razorpay_order_id: razorpay_order_id,
        },
      });
      await tx.notification.create({
        data: {
          title: "Congratulations",
          userId: user.id,
          description: "Yayyy!! You have successfully placed the order.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });

    revalidatePath("/profile/orders");
    return {
      orderDetails,
      message: "Payment is verified",
    };
  } catch (error) {
    return {
      message: "Error updating the order status",
    };
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

  // Fetch session details to get price
  const sessionDetails = await db.session.findUnique({
    where: {
      id: bookingData.sessionId,
    },
  });

  if (!sessionDetails) {
    return {
      error: "Session not found.",
    };
  }

  // Convert price from decimal to paise (multiply by 100)
  const amountInPaise = Math.round(Number(sessionDetails.price) * 100);

  try {
    // Create Razorpay order
    console.log("Creating razorpay order for session booking",amountInPaise);
    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: "INR",
      receipt: `session_${bookingData.sessionId}_${Date.now()}`.slice(0, 36),
      name: "Shewell Session Booking",
    });

    console.log("Razorpay order created for session:", razorpayOrder);

    // Guard against null razorpay order
    if (!razorpayOrder || !razorpayOrder.id) {
      return {
        error: "Failed to create payment order. Please try again.",
      };
    }

    // Check for existing registration before creating a new one
    const existingRegistration = await db.sessionRegistration.findFirst({
      where: {
        userId: user.id,
        sessionId: bookingData.sessionId,
      },
    });

    if (existingRegistration) {
      // If already has a successful payment, don't create a new one
      if (existingRegistration.paymentStatus === "COMPLETED") {
        return {
          error: "You have already registered for this session.",
        };
      }

      // If pending, we can either reuse the razorpayOrderId or create a new one.
      // For simplicity, let's update the existing one with a new razorpayOrderId
      await db.sessionRegistration.update({
        where: { id: existingRegistration.id },
        data: {
          razorpayOrderId: razorpayOrder.id,
        },
      });
    } else {
      // Create pending SessionRegistration
      await db.sessionRegistration.create({
        data: {
          userId: user.id,
          sessionId: bookingData.sessionId,
          paymentStatus: "PENDING",
          amountPaid: sessionDetails.price,
          razorpayOrderId: razorpayOrder.id,
        },
      });
    }

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

    return { error: messageError, razorpay: razorpayConfig };
  } catch (err: any) {
    messageError = err.message;
    return {
      error: messageError,
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
