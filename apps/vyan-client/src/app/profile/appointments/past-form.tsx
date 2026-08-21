import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { Button } from "@repo/ui/src/@/components/button";
import AddReviewRatingUserAction from "./add-review-and-rating-user-action";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import React from "react";
import { api } from "~/trpc/react";

// interface IPastForm{
//     id: string,
//     startingTime : Date,
//     endingTime: Date,
//     priceInCents : Number,
//     professionalUser : {
//         id: string,
//         firstName: string
//     },

// }
const PastForm = ({
  professionalUserId,
  bookAppointmentId,
  reviewExist,
}: {
  professionalUserId: string;
  bookAppointmentId: string;
  reviewExist: boolean;
}) => {
  const schema = z.object({
    rating: z.number({ required_error: "Please select the rating" }),
    review: z.string({ required_error: "Please add the review" }),
  });
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const StarDrawing = (
    <path d="M15.1533 1.24496C14.6395 0.359428 13.3607 0.359425 12.8468 1.24496L9.2281 7.48137C8.97427 7.91882 8.53553 8.21734 8.03545 8.29287L1.2537 9.31717C0.114654 9.48921 -0.284892 10.9274 0.602182 11.6623L5.6543 15.8479C6.12196 16.2354 6.34185 16.8465 6.22825 17.4431L4.90669 24.3833C4.69778 25.4804 5.8495 26.3328 6.8377 25.8125L13.2236 22.4501C13.7096 22.1941 14.2905 22.1941 14.7766 22.4501L21.1625 25.8125C22.1507 26.3328 23.3024 25.4804 23.0935 24.3833L21.7719 17.4431C21.6583 16.8465 21.8782 16.2354 22.3459 15.8479L27.398 11.6623C28.285 10.9274 27.8855 9.48921 26.7465 9.31717L19.9647 8.29287C19.4646 8.21734 19.0259 7.91882 18.7721 7.48137L15.1533 1.24496Z" />
  );
  const customStyles = {
    itemShapes: StarDrawing,
    inactiveFillColor: "#ECECEC",
    activeFillColor: "#00898F",
  };
  const trpcContext = api.useUtils();

  const { toast } = useToast();
  const onSubmit = (data: z.infer<typeof schema>) => {
    const rating = data.rating;
    const review = data.review;

    AddReviewRatingUserAction({
      rating,
      review,
      bookAppointmentId,
      professionalUserId,
    })
      .then((resp) => {
        // The action returns `{ error }` on a rejected review and `{ message }` on
        // success. Reading only `message` meant every rejection showed an empty
        // toast — which is what hid the fact that this never worked at all.
        if (resp?.error) {
          toast({ description: resp.error, variant: "destructive" });
          return;
        }
        toast({
          description: resp?.message,
          variant: "default",
        });
        trpcContext.invalidate();
        reset();
        setValue("rating", 0),
        setValue("review", "")
      })
      .catch((err) => {
        console.log(err);
        toast({
          description: err.message,
          variant: "destructive",
        });
      });
  };

  return (
    <>
      {reviewExist ? (
        ""
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-[85px] lg:gap-[93px]">
            <div className="flex flex-col gap-[6px] lg:gap-[8px]">
              <div className="font-inter text-sm font-medium text-active">
                Give us your feedback
              </div>
              <Controller
                control={control}
                name="rating"
                render={({ field }) => {
                  return (
                    <>
                      <div>
                        <Rating
                          style={{ maxWidth: 150 }}
                          // value={
                          //   rating! || item.professionalRating?.rating!
                          // }
                          value={field.value}
                          onChange={field.onChange}
                          // onChange={handleChangeRating}
                          itemStyles={customStyles}
                        />
                        {errors && errors.rating && (
                          <p className="text-red-500">
                            {errors.rating.message}
                          </p>
                        )}
                      </div>
                    </>
                  );
                }}
              />
            </div>
            <div className="flex w-full flex-col gap-2 md:basis-[450px] lg:basis-[562px] xl:basis-[413px] 2xl:basis-[625px]">
              <div className="w-full font-inter text-sm font-medium text-active">
                Add a review of your experience
              </div>
              <Controller
                control={control}
                name="review"
                render={({ field }) => {
                  return (
                    <>
                      <div className="w-full">
                        <input
                          value={field.value}
                          onChange={field.onChange}
                          type="text"
                          className={`w-full rounded border py-[11px] pl-4 font-inter text-xs font-normal outline-primary `}
                          placeholder="add a review"
                        />
                          {errors && errors.review && <p className="text-red-500">{errors.review.message}</p>}
                      </div>
                    </>
                  );
                }}
              />
            </div>
            <Button>Add</Button>
          </div>
        </form>
      )}
    </>
  );
};
export default PastForm;
