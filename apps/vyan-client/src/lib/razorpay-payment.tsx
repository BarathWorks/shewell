import { AppointmentType } from "@repo/database";
import CheckoutAction from "~/app/actions/checkout-action";
import VerifyPayment from "~/app/actions/verify-payment";
import { useToast } from "@repo/ui/src/@/components/use-toast";

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
}: IBookAppointmentDetailsProps) => {
  const res = await initializeRazorpay();
  // const { toast } = useToast();
  if (!res) {
    alert("Razorpay SDK failed to load");
    return;
  }

  console.log(
    "checkout&RazorpayData",
    serviceMode,
    professionalUser,
    patient,
    startingTime,
    endingTime,
  );

  console.log("startingTime", startingTime);
  // Make API call to initiate the checkout process on the server with the provided bookAppointmentId
  try {
    await CheckoutAction({
      serviceMode,
      professionalUser,
      patient,
      startingTime,
      endingTime,
    }).then((data: any) => {
      if (data?.error) {
        throw new Error(data.error);
      }
      var options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        name: data?.name,
        currency: data?.currency,
        amount: data?.amount,
        order_id: data?.orderId,
        description: data?.description,
        image: data?.image,
        //   callback function to handle payment response
        handler: function (response: any) {
          console.log("paymentResponse", response);
          VerifyPayment(
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            data?.orderId!,
          )
            .then((resp: { message: string }) => {
              // toast({
              //   title: resp?.message,
              //   variant: "success",
              // });
              console.log("verifyPayment", resp.message);
            })
            .catch((err: Error) => {
              // toast({
              //   variant: "destructive",
              //   title: err.message,
              // });
              console.log("verifyPayment", err.message);
            });
        },
        //   prefill user information
        prefill: {
          name: data?.user?.name,
          email: data?.user?.email,
        },
      };

      // @ts-ignore
      //  Creating a new Razorpay object with the configure options and call its "open" method to display the payment modal to the user
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    });
    return {
      message: "Appointment has booked",
    };
  } catch (error) {
    console.log("razorpayError", error);
    throw error;
  }
};
