"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "@repo/ui/src/@/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/src/@/components/dialog";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import AddPatientUserAction, { IPatientProps } from "./edit-patient-user-action";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
const schema = z.object({
  firstName: z
    .string({
      required_error: "Please enter the first name",
    })
    .min(1, { message: "Please enter the first name" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z
    .string()
    .min(10, { message: "Please Enter the Phone Number" })
    .max(10, { message: "Phone Number can have maximum 10 digits" })
    .regex(new RegExp(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/), {
      message: "only Numeric Digits are allowed",
    }),
  email: z
    .string()
    .min(1, { message: "Email is Required" })
    .email({ message: "Please enter a valid Email address" })
    .regex(new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i), {
      message: "Invalid Email",
    }),
  message: z.string().optional().nullable(),
  additionalPatients: z.array(
    z.object({
      firstName: z
        .string({
          required_error: "Please enter the first name",
        })
        .min(1, { message: "Please enter the first name" }),
      lastName: z.string().optional().nullable(),
      phoneNumber: z
        .string()
        .min(10, { message: "Please Enter the Phone Number" })
        .max(10, { message: "Phone Number can have maximum 10 digits" })
        .regex(
          new RegExp(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/),
          {
            message: "only Numeric Digits are allowed",
          },
        ),
      email: z
        .string()
        .min(1, { message: "Email is Required" })
        .email({ message: "Please enter a valid Email address" })
        .regex(new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i), {
          message: "Invalid Email",
        }),
      message: z.string().optional().nullable(),
    }),
  ),
});

const EditPatient = ({
  open,
  onOpenChange,
  patientId,
  setIsCouple
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  patientId: string;
  setIsCouple : (value : boolean) => void;
}) => {

  const { data } = api.searchPatientForEdit.searchPatientForEdit.useQuery({
    patientId: patientId,
  });

  // console.log(data?.patient.length);
 
  
  const defaultValues = data?.patient
    ? {
        firstName: data.patient.firstName,
        lastName: data.patient.lastName!,
        phoneNumber: data.patient.phoneNumber,
        email: data.patient.email,
        message: data.patient.message!,
        additionalPatients: data.patient.additionalPatients.map((item) => ({
          firstName: item.firstName,
          lastName: item.lastName!,
          phoneNumber: item.phoneNumber,
          email: item.email,
          message: item.message!,
        })),
      }
    : {
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        message: "",
        additionalPatients: [
          {
            firstName: "",
            lastName: "",
            phoneNumber: "",
            email: "",
            message: "",
          },
        ],
      };
 
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof schema>>({
    defaultValues: defaultValues,
    resolver: zodResolver(schema),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalPatients",
  });
  const { toast } = useToast();

  useEffect(() => {
   
    if (data?.patient) {
      reset({
        firstName: data.patient.firstName,
        lastName: data.patient.lastName!,
        phoneNumber: data.patient.phoneNumber,
        email: data.patient.email,
        message: data.patient.message!,
        additionalPatients: data.patient.additionalPatients.map((item) => ({
          firstName: item.firstName,
          lastName: item.lastName!,
          phoneNumber: item.phoneNumber,
          email: item.email,
          message: item.message!,
        })),
      });
    }
  }, [data, reset]);

  const patientsId = patientId
  const onSubmit = (formData: z.infer<typeof schema>) => {
    const actionData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      message: formData.message,
      additionalPatients: formData.additionalPatients.map((p) => ({
        firstName: p.firstName,
        lastName: p.lastName,
        phoneNumber: p.phoneNumber,
        email: p.email,
        message: p.message,
      })),
    };

    AddPatientUserAction(actionData, { patientsId })
      .then((resp) => {
        console.log(resp.message);
        if (formData.additionalPatients.length > 0) {
          setIsCouple(true);
        } else {
          setIsCouple(false);
        }
        toast({
          description: "Successfully added the Personal-Info",
          variant: "default",
        });
        setClose(false);
        onOpenChange(false);
      })
      .catch((error) => {
        console.log(error);
        toast({
          description: "Failed to save the patient-info",
          variant: "destructive",
        });
      });
  };
  const [close, setClose] = useState<boolean>();
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
       
        <DialogContent className="w-full xs:max-w-[300px] sm:max-w-[393px] p-[30px] lg:max-w-[904px] xl:max-w-[1100px] 2xl:max-w-[1280px] overflow-y-auto h-[90vh]">
         

          <div className="mb-[18px] text-center font-inter text-[20px] font-semibold leading-[30px]">
            Couple Information{" "}
            <span className="text-base font-medium">
              ( please enter the information of couple for whom you want to book
              the appointment)
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <div className="mb-[12px] font-inter text-base font-semibold text-primary md:text-[18px] md:leading-[28px]">
                Patient 1 
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex w-full flex-col gap-6 lg:flex-row">
                  <div className="w-full">
                    <UIFormLabel>Partner 1 name*</UIFormLabel>
                    <Controller
                      control={control}
                      name="firstName"
                      render={({ field }) => {
                        return (
                          <>
                            <UIFormInput
                              type="text"
                              placeholder="Enter partner's name"
                              value={field.value}
                              onChange={field.onChange}
                            />
                            {errors && errors.firstName && (
                              <p className="text-red-500">
                                {errors.firstName.message}
                              </p>
                            )}
                          </>
                        );
                      }}
                    />
                  </div>
                  <div className="w-full">
                    <UIFormLabel>Partner last name</UIFormLabel>
                    <Controller
                      control={control}
                      name="lastName"
                      render={({ field }) => {
                        return (
                          <>
                            <UIFormInput
                              type="text"
                              placeholder="Enter partner's name"
                              value={field.value!}
                              onChange={field.onChange}
                            />
                            {errors && errors.lastName && (
                              <p className="text-red-500">
                                {errors.lastName.message}
                              </p>
                            )}
                          </>
                        );
                      }}
                    />
                  </div>
                </div>

                <div className="flex w-full flex-col gap-6 lg:flex-row">
                  <div className="w-full">
                    <UIFormLabel>Phone no*</UIFormLabel>
                    <Controller
                      control={control}
                      name="phoneNumber"
                      render={({ field }) => {
                        return (
                          <>
                            <UIFormInput
                              type="text"
                              placeholder="Enter phone number"
                              value={field.value}
                              onChange={field.onChange}
                            />
                            {errors && errors.phoneNumber && (
                              <p className="text-red-500">
                                {errors.phoneNumber.message}
                              </p>
                            )}
                          </>
                        );
                      }}
                    />
                  </div>
                  <div className="w-full">
                    <UIFormLabel>Email Id*</UIFormLabel>
                    <Controller
                      control={control}
                      name="email"
                      render={({ field }) => {
                        return (
                          <>
                            <UIFormInput
                              type="text"
                              placeholder="Enter partner's email"
                              value={field.value}
                              onChange={field.onChange}
                            />
                            {errors && errors.email && (
                              <p className="text-red-500">
                                {errors.email.message}
                              </p>
                            )}
                          </>
                        );
                      }}
                    />
                  </div>
                </div>

                <div>
                  <UIFormLabel>Any message</UIFormLabel>
                  <Controller
                    control={control}
                    name="message"
                    render={({ field }) => {
                      return (
                        <>
                          <textarea
                            className="w-full rounded-md border py-3 pl-4 outline-primary  placeholder:font-inter placeholder:text-sm placeholder:font-normal placeholder:text-placeholder-color"
                            value={field.value!}
                            onChange={field.onChange}
                            placeholder="Type your message here"
                          />
                          {/* {errors && errors.additionalPatients && <p>{errors.additionalPatients[index]?.message?.message}</p>} */}
                        </>
                      );
                    }}
                  />
                </div>

               
              </div>
              {fields.map((field, index) => (
                <>
                 <div className="flex justify-between">
                 <div className="mb-[12px] font-inter text-base font-semibold text-primary md:text-[18px] md:leading-[28px]">
                    Patient {index + 1}
                  </div>
                  <Button
                        className="w-fit bg-red-600 hover:bg-red-600"
                        type="button"
                        onClick={() => remove(index)}
                      >
                        Delete
                      </Button>
                 </div>
                  <div key={field.id} className="flex flex-col gap-6">
                    <div className="flex w-full flex-col gap-6 lg:flex-row">
                      <div className="w-full">
                        <UIFormLabel>Partner {index + 1} name*</UIFormLabel>
                        <Controller
                          control={control}
                          name={`additionalPatients.${index}.firstName`}
                          render={({ field }) => {
                            return (
                              <>
                                <UIFormInput
                                  type="text"
                                  placeholder="Enter partner's name"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                                {errors && errors.additionalPatients && (
                                  <p className="text-red-500">
                                    {
                                      errors.additionalPatients[index]
                                        ?.firstName?.message
                                    }
                                  </p>
                                )}
                              </>
                            );
                          }}
                        />
                      </div>
                      <div className="w-full">
                        <UIFormLabel>Partner last name</UIFormLabel>
                        <Controller
                          control={control}
                          name={`additionalPatients.${index}.lastName`}
                          render={({ field }) => {
                            return (
                              <>
                                <UIFormInput
                                  type="text"
                                  placeholder="Enter partner's name"
                                  value={field.value!}
                                  onChange={field.onChange}
                                />
                                {errors && errors.additionalPatients && (
                                  <p className="text-red-500">
                                    {
                                      errors.additionalPatients[index]?.lastName
                                        ?.message
                                    }
                                  </p>
                                )}
                              </>
                            );
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-6 lg:flex-row">
                      <div className="w-full">
                        <UIFormLabel>Phone no*</UIFormLabel>
                        <Controller
                          control={control}
                          name={`additionalPatients.${index}.phoneNumber`}
                          render={({ field }) => {
                            return (
                              <>
                                <UIFormInput
                                  type="text"
                                  placeholder="Enter phone number"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                                {errors && errors.additionalPatients && (
                                  <p className="text-red-500">
                                    {
                                      errors.additionalPatients[index]
                                        ?.phoneNumber?.message
                                    }
                                  </p>
                                )}
                              </>
                            );
                          }}
                        />
                      </div>
                      <div className="w-full">
                        <UIFormLabel>Email Id*</UIFormLabel>
                        <Controller
                          control={control}
                          name={`additionalPatients.${index}.email`}
                          render={({ field }) => {
                            return (
                              <>
                                <UIFormInput
                                  type="text"
                                  placeholder="Enter partner's email"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                                {errors && errors.additionalPatients && (
                                  <p className="text-red-500">
                                    {
                                      errors.additionalPatients[index]?.email
                                        ?.message
                                    }
                                  </p>
                                )}
                              </>
                            );
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <UIFormLabel>Any message</UIFormLabel>
                      <Controller
                        control={control}
                        name={`additionalPatients.${index}.message`}
                        render={({ field }) => {
                          return (
                            <>
                              <textarea
                                className="w-full rounded-md border py-3 pl-4 outline-primary  placeholder:font-inter placeholder:text-sm placeholder:font-normal placeholder:text-placeholder-color"
                                value={field.value!}
                                onChange={field.onChange}
                                placeholder="Type your message here"
                              />
                              {/* {errors && errors.additionalPatients && <p>{errors.additionalPatients[index]?.message?.message}</p>} */}
                            </>
                          );
                        }}
                      />
                    </div>

                    {fields.length > 1 && (
                      <Button
                        className="w-fit bg-red-600 hover:bg-red-600"
                        type="button"
                        onClick={() => remove(index)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </>
              ))}
            </div>

            <Button
              className="mt-4 bg-primary hover:bg-secondary"
              type="button"
              onClick={() =>
                append({
                  email: "",
                  message: "",
                  firstName: "",
                  phoneNumber: "",
                  lastName: "",
                })
              }
            >
              Add Patient
            </Button>

            <Button
              className="mt-4 w-full bg-secondary hover:bg-secondary "
              type="submit"
            >
              Submit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default EditPatient;
