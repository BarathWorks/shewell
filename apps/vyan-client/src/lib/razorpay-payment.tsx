import { AppointmentType } from "@repo/database";
import CheckoutAction from "~/app/actions/checkout-action";
import VerifyPayment from "~/app/actions/verify-payment";

// function to dynamically load the Razorpay SDK script
export const initializeRazorpay = () => {
  return new Promise((resolve) => {
    // creating script element
    const script = document.createElement("script");
    // setting src of script to url of razorpay checkout SDK
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };

    // script element is appended to document body to initiate the loading process
    document.body.appendChild(script);
  });
};

interface IBookAppointmentDetailsProps {
  serviceMode: {
    taxedAmount: number;
    totalPriceInCents: number;
    serviceType: AppointmentType;
    priceInCents: number;
    description: string;
    planName: string;
  };
  professionalUser: {
    professionalUserId: string;
  };
  patient: {
    id: string;
    firstName: string;
    email: string;
    phoneNumber: string;
    message: string;
    additionalPatients: {
      firstName: string;
      email: string;
      phoneNumber: string;
    }[];
  };
  startingTime: Date;
  endingTime: Date;
}

// function to handle the payment initiation process
export const makePayment = async ({
  serviceMode,
  professionalUser,
  patient,
  startingTime,
  endingTime,
}: IBookAppointmentDetailsProps): Promise<{ success: boolean; message: string }> => {
  const res = await initializeRazorpay();
  if (!res) {
    throw new Error("Razorpay SDK failed to load");
  }

  const data: any = await CheckoutAction({
    serviceMode,
    professionalUser,
    patient,
    startingTime,
    endingTime,
  });

  if (data?.error) {
    throw new Error(data.error);
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      name: data?.name,
      currency: data?.currency,
      amount: data?.amount,
      order_id: data?.orderId,
      description: data?.description,
      image: data?.image,
      handler: async function (response: any) {
        console.log("paymentResponse", response);
        try {
          const resp = await VerifyPayment(
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            data?.orderId!
          );
          
          if (resp.message === "Payment is verified") {
            resolve({ success: true, message: "Appointment has been booked successfully" });
          } else {
            reject(new Error(resp.message || "Payment verification failed"));
          }
        } catch (err: any) {
          console.error("verifyPayment Error", err.message);
          reject(new Error(err.message || "Failed to verify payment"));
        }
      },
      modal: {
        ondismiss: function () {
          console.log("Checkout modal closed by user");
          reject(new Error("Payment cancelled. Your appointment is not booked."));
        },
      },
      prefill: {
        name: data?.user?.name,
        email: data?.user?.email,
      },
      theme: {
        color: "#3399cc",
      },
    };

    // @ts-ignore
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  });
};
