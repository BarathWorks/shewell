import { PaymentStatus } from '@repo/database';

export interface IRegistration {
  id: string;
  sessionId: string;
  userId: string;
  paymentStatus: PaymentStatus;
  amountPaid?: number | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  createdAt: Date;

  // Relations
  user?: {
    id: string;
    name: string;
    email: string;
  };
  session?: {
    id: string;
    title: string;
    slug: string;
    price: number;
    startAt: Date;
  };
}
