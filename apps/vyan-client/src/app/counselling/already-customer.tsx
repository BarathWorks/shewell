import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/src/@/components/button";
import { Label } from "@repo/ui/src/@/components/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/src/@/components/radio-group";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  customer: z.enum(["new-customer", "already-a-customer"], {
    required_error: "You need to select one option",
  }),
});

const onSubmit = (data: z.infer<typeof schema>) => {
  console.log(data);
};

const AlreadyCustomer = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  return (
    <>
      <form
        className="flex flex-col gap-8 p-3"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Controller
          control={control}
          name="customer"
          render={({ field }) => {
            return (
              <>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col gap-[52px]"
                >
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value="new-customer" />
                    <div className="flex-col gap-1">
                      <Label className="font-inter text-base font-medium">
                        Are you a new customer to vyan counseling?
                      </Label>
                      <div className="font-inter text-sm font-normal text-muted">
                        Get 15 minute free counseling for new customer.{" "}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <RadioGroupItem value="already-a-customer" />
                    <div className="flex-col gap-1">
                      <Label className="font-inter text-base font-medium">
                        Already a existing patient of counseling?
                      </Label>
                      <div className="font-inter text-sm font-normal text-muted">
                        Get a offline appointment with vyan's premium membership
                      </div>
                    </div>
                  </div>
                </RadioGroup>
                {errors && errors.customer && (
                  <p className="text-red-500">{errors.customer.message}</p>
                )}
              </>
            );
          }}
        />
        <Button
          type="submit"
          className="self-end rounded-md bg-secondary px-[30px] py-2 font-inter text-base font-medium hover:bg-secondary"
        >
          Next
        </Button>
      </form>
    </>
  );
};
export default AlreadyCustomer;
