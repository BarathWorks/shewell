"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import {
  useForm,
  SubmitHandler,
  Controller,
  useFieldArray,
} from "react-hook-form";
import { z } from "zod";
import { Button } from "@repo/ui/src/@/components/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/src/@/components/dialog";
import UploadsUserAction from "./uploads-user-action";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { useSession } from "next-auth/react";
import { redirect, usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Input } from "@repo/ui/src/@/components/input";
import Image from "next/image";
import { DocumentType } from "@repo/database";
import { Trash2 } from "lucide-react";


import { IMedia } from "~/models/media-model";
import { useEffect, useRef, useState } from "react";
import LoadingSpinner from "~/app/components/loading-spinner";
import uploadProductImage from "~/(main)/upload-image-actions";
import uploadProfessionalUserImage from "~/(main)/upload-image-actions";
import uploadProfessionalUserDocument, {
  deleteDocumentFromKey,
} from "~/(main)/upload-document-actions";
import { getPrivateFileUrl, getUploadPresignedUrl } from "@repo/aws/index";

import DownloadDocument from "./download-document";
import downloadDocument from "./download-document";
import React from "react";
import uploadAadharAction from "~/(main)/upload-aadhar-action";
import uploadAadharPanAction from "~/(main)/upload-aadhar-action";
import uploadPanAction from "~/(main)/upload-pan-action";


const uploadSchema = z.object({
  mediaId: z.string({ required_error: "Please Select the Image" }),
  aboutYou: z.string({
    required_error: "Please write about yourself",
    invalid_type_error: "Please write about yourself",
  }),
  aadharCard: z.string().optional(),
  panCard: z.string().optional(),
  documents: z.array(
    z.object({
      documentId: z.string({
      }),
    }),
  ),
});
interface IDocuments {
  id: string;
  fileKey: string;
}
const UploadForm = ({
  aboutYou,
  professionalUserId,
  mediaId,
  fileUrl,
  documents,
  aadharCard,
  panCard,
}: {
  aboutYou: string;
  professionalUserId: string;
  mediaId: string | null;
  fileUrl: string | null;
  documents: IDocuments[];
  aadharCard: IDocuments | null | undefined;
  panCard: IDocuments | null | undefined;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    handleSubmit,
    control,
    setValue,

    watch,
    formState: { errors },
  } = useForm<z.infer<typeof uploadSchema>>({
    defaultValues: {
      aboutYou: aboutYou,
      mediaId: mediaId!,
      documents: [
        {
          documentId: "",
        },
      ],
      aadharCard: aadharCard?.id || "",
      panCard: panCard?.id || "",
    },
    resolver: zodResolver(uploadSchema),
  });

  const {
    fields: documentFields,
    append: appendDocument,
    remove: removeDocument,
  } = useFieldArray({
    control,
    name: "documents",
  });
  const { toast } = useToast();
  const [loadingState, setLoadingState] = useState<boolean>(false);
  const [uploadingState, setUploadingState] = useState<0 | 1 | 2>(0);
  const [imageUrl, setImageUrl] = useState<string>(fileUrl!);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  console.log("url", pathname)
  useEffect(() => {
    params.set("step", "5");
    window.history.pushState(null,"", `${pathname}?${params.toString()}` )
  }, []);

  const onSubmit = (data: z.infer<typeof uploadSchema>) => {
    setLoadingState(true);
    console.log(data);
    UploadsUserAction({
      aboutYou: data.aboutYou,
      mediaId: data.mediaId,
      documents: data.documents.filter(doc => doc.documentId), // Filter out empty documentIds
      aadharCard: data.aadharCard,
      panCard: data.panCard,
    })
      .then((resp) => {
        setLoadingState(false);
        // These actions report failure by RETURNING `{ success: false, error }`
        // rather than throwing, so the `.catch` below never sees it. Without this
        // check a failed save showed a success toast and advanced to the next
        // registration step, silently discarding what the practitioner entered.
        if (!resp?.success) {
          toast({
            title: "Could not save",
            description: resp?.error ?? "Please try again",
            variant: "destructive",
          });
          return;
        }

        console.log("Uploads", resp?.message);
        toast({
          title: "Successfully saved uploads",
          variant: "default",
        });
        router.push(`/auth/register/bank-details/?step=6`);
      })
      .catch((err) => {
        setLoadingState(false);
        console.log(err);
        toast({
          title: "Can not save uploads",
          variant: "destructive",
        });
      });
  };
  const errorHandler = (e: any) => {
    console.log("Form validation errors:", e);
    // Show the first validation error as a toast
    const firstErrorKey = Object.keys(e)[0];
    if (firstErrorKey) {
      const errorMessage = e[firstErrorKey]?.message || e[firstErrorKey]?.root?.message || `Please fill in the ${firstErrorKey} field`;
      toast({
        title: "Validation Error",
        description: String(errorMessage),
        variant: "destructive",
      });
    }
  };
  const router = useRouter();
  const session = useSession();

  if (!session) {
    router.push("/auth/login");
  }

  const onSelectImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    if (event.target.files.length! > 0) {
      for (const image of event.target.files) {
        setUploadingState(1);
        const arrayOfKeys = image.name.split(".");
        uploadProfessionalUserImage(
          professionalUserId,
          `professionalUser/${professionalUserId}/profile.${arrayOfKeys[arrayOfKeys.length - 1]}`,
          image.name,
          image.type,
        )
          .then(async (resp) => {
            const { id, fileUrl, presignedUrl } = resp;
            const requestOptions = {
              method: "PUT",
              headers: {
                "Content-Type": image.type,
              },
              body: image,
            };
            const res = await fetch(presignedUrl!, requestOptions);
            console.log(res, presignedUrl, id);
            if (res.ok) {
              setValue("mediaId", id!);
              setImageUrl(fileUrl!);
              fileInputRef.current?.value;
            }
          })
          .catch((error) => {
            fileInputRef.current?.value;
            console.log("error while uploading image", error);
          });
      }
    }
  };

  const onSelectAadharCard = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: DocumentType,
  ) => {
    if (!event.target.files) {
      return;
    }
    if (event.target.files.length! > 0) {
      for (const document of event.target.files) {
        setUploadingState(1);
        // const arrayOfKeys = document.name.split(".");
        uploadAadharAction(
          professionalUserId,
          `professionalUser/${professionalUserId}/documents/${new Date().getTime()}-${document.name}`,
          document.name,
          document.type,
          type,
        )
          .then(async (resp) => {
            const { id, fileUrl, presignedUrl } = resp;
            const requestOptions = {
              method: "PUT",
              headers: {
                "Content-Type": document.type,
              },
              body: document,
            };
            const res = await fetch(presignedUrl!, requestOptions);
            console.log(res, presignedUrl, id);
            if (res.ok) {
              setValue(`aadharCard`, id!);
              // setImageUrl(fileUrl);
              fileInputRef.current?.value;
            }
          })
          .catch(() => {
            fileInputRef.current?.value;
          });
      }
    }
  };
  const onSelectPanCard = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: DocumentType,
  ) => {
    if (!event.target.files) {
      return;
    }
    if (event.target.files.length! > 0) {
      for (const document of event.target.files) {
        setUploadingState(1);
        // const arrayOfKeys = document.name.split(".");
        uploadPanAction(
          professionalUserId,
          `professionalUser/${professionalUserId}/documents/${new Date().getTime()}-${document.name}`,
          document.name,
          document.type,
          type,
        )
          .then(async (resp) => {
            const { id, fileUrl, presignedUrl } = resp;
            const requestOptions = {
              method: "PUT",
              headers: {
                "Content-Type": document.type,
              },
              body: document,
            };
            const res = await fetch(presignedUrl!, requestOptions);
            console.log(res, presignedUrl, id);
            if (res.ok) {
              setValue(`panCard`, id!);
              // setImageUrl(fileUrl);
              fileInputRef.current?.value;
            }
          })
          .catch(() => {
            fileInputRef.current?.value;
          });
      }
    }
  };
  const onSelectDocument = async (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
    type: DocumentType,
  ) => {
    if (!event.target.files) {
      return;
    }
    if (event.target.files.length! > 0) {
      for (const document of event.target.files) {
        setUploadingState(1);
        // const arrayOfKeys = document.name.split(".");
        uploadProfessionalUserDocument(
          professionalUserId,
          `professionalUser/${professionalUserId}/documents/${new Date().getTime()}-${document.name}`,
          document.name,
          document.type,
          type,
        )
          .then(async (resp) => {
            const { id, fileUrl, presignedUrl } = resp;
            const requestOptions = {
              method: "PUT",
              headers: {
                "Content-Type": document.type,
              },
              body: document,
            };
            const res = await fetch(presignedUrl!, requestOptions);
            console.log(res, presignedUrl, id);
            if (res.ok) {
              setValue(`documents.${index}.documentId`, id!);
              // setImageUrl(fileUrl);
              fileInputRef.current?.value;
            }
          })
          .catch(() => {
            fileInputRef.current?.value;
          });
      }
    }
  };
  return (
    <>
      {/* <div className="mb-6 text-center  font-inter text-2xl font-semibold md:mb-8  xl:mb-9 2xl:mb-[50px] 2xl:text-3xl">
        Create your free account
      </div> */}
      <form
        onSubmit={handleSubmit(onSubmit, errorHandler)}
        noValidate={true}
        className="rounded-md border-2 border-primary p-4 md:p-6 "
      >
        <div className="flex flex-col gap-[18px] md:gap-5 xl:gap-6 ">
          {/* upload your image */}
          <div>
            <UIFormLabel>Upload Your Image</UIFormLabel>

            <Controller
              control={control}
              name="mediaId"
              render={({ field }) => {
                return (
                  <>
                    {" "}
                    <Input
                      // value={field.value}
                      onChange={onSelectImage}
                      type="file"
                    />
                  </>
                );
              }}
            />
          </div>
          {fileUrl && (
            <div className=" flex aspect-square w-[135px] items-center justify-center  bg-[url('/images/doctor-bg.png')] bg-center bg-no-repeat">
              {" "}
              <div className="w-[116px]">
                <div className="relative  aspect-square object-cover">
                  <Image
                    src={imageUrl}
                    alt="doctor-image"
                    className=" rounded-full  object-cover"
                    fill={true}
                  />
                </div>
              </div>
            </div>

            // <Image src={imageUrl!} alt="image-preview" width={150} height={150} />
          )}

          {/* upload-your-aadhar */}
          <div className="w-full">
            <UIFormLabel>Upload Your Aadhar Card</UIFormLabel>

            <Controller
              control={control}
              name="aadharCard"
              render={({ field }) => {
                return (
                  <>
                    {" "}
                    <Input
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        onSelectAadharCard(e, DocumentType.AADHAR_CARD),
                          console.log("field.value", field.value);
                      }}
                      type="file"
                    />
                  </>
                );
              }}
            />
          </div>

          {!aadharCard && (
            <p className="text-red-500">Please upload your Aadhar Card</p>
          )}
          {aadharCard && (
            <div className="flex flex-wrap gap-2 items-center">
              <div
                onClick={() => {
                  const fileKey = aadharCard.fileKey;
                  downloadDocument({ fileKey }).then((url) => {
                    router.push(url!);
                  });
                }}
                className="cursor-pointer"
              >
                Aadhar Card
              </div>
              <div
                onClick={() =>
                  deleteDocumentFromKey(
                    professionalUserId,
                    aadharCard.fileKey,
                    aadharCard.id,
                  )
                }
                className="cursor-pointer"
              >
                <Trash2 className="text-red-500 size-4" />
              </div>
            </div>
          )}

          {/* upload-your-pan */}
          <div className="w-full">
            <UIFormLabel>Upload Your Pan Card</UIFormLabel>

            <Controller
              control={control}
              name="panCard"
              render={({ field }) => {
                return (
                  <>
                    {" "}
                    <Input
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        onSelectPanCard(e, DocumentType.PAN_CARD);
                        console.log("field.value", field.value);
                      }}
                      type="file"
                    />
                  </>
                );
              }}
            />
          </div>

          {!panCard && (
            <p className="text-red-500">Please upload your Pan Card</p>
          )}
          {panCard && (
            <div className="flex flex-wrap gap-2 items-center">
              <div
                onClick={() => {
                  const fileKey = panCard.fileKey;
                  downloadDocument({ fileKey }).then((url) => {
                    router.push(url!);
                  });
                }}
                className="cursor-pointer"
              >
                Pan Card
              </div>
              <div
                onClick={() =>
                  deleteDocumentFromKey(
                    professionalUserId,
                    panCard.fileKey,
                    panCard.id,
                  )
                }
                className="cursor-pointer"
              >
                <Trash2 className="text-red-500 size-4" />
              </div>
            </div>
          )}

          {/* upload your documents */}
          {documentFields.map((field, index) => (
            <div
              key={field.documentId}
              className="flex w-full items-center gap-2"
            >
              <div className="w-full">
                <UIFormLabel>Upload Your Document {index + 1}</UIFormLabel>

                <Controller
                  control={control}
                  name={`documents.${index}.documentId`}
                  render={({ field }) => {
                    return (
                      <>
                        {" "}
                        <Input
                          // value={field.value}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            onSelectDocument(
                              e,
                              index,
                              DocumentType.OTHER_DOCUMENTS,
                            ),
                              console.log("field.value", field.value);
                          }}
                          type="file"
                        />
                      </>
                    );
                  }}
                />
              </div>

              {/* add/remove button */}
              <div className="self-end">
                {index === documentFields.length - 1 ? (
                  <div className="flex gap-2 ">
                    {" "}
                    {index > 0 && (
                      <svg
                        onClick={() => removeDocument(index)}
                        width="36"
                        height="36"
                        viewBox="0 0 36 36"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="0.5"
                          y="0.5"
                          width="35"
                          height="35"
                          rx="5.5"
                          stroke="#CA0000"
                        />
                        <path
                          d="M10.5 13H12.1667H25.5"
                          stroke="#CA0000"
                          stroke-width="1.25"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M14.6719 13.0003V11.3337C14.6719 10.8916 14.8475 10.4677 15.16 10.1551C15.4726 9.84259 15.8965 9.66699 16.3385 9.66699H19.6719C20.1139 9.66699 20.5378 9.84259 20.8504 10.1551C21.1629 10.4677 21.3385 10.8916 21.3385 11.3337V13.0003M23.8385 13.0003V24.667C23.8385 25.109 23.6629 25.5329 23.3504 25.8455C23.0378 26.1581 22.6139 26.3337 22.1719 26.3337H13.8385C13.3965 26.3337 12.9726 26.1581 12.66 25.8455C12.3475 25.5329 12.1719 25.109 12.1719 24.667V13.0003H23.8385Z"
                          stroke="#CA0000"
                          stroke-width="1.25"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M16.3281 17.167V22.167"
                          stroke="#CA0000"
                          stroke-width="1.25"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M19.6719 17.167V22.167"
                          stroke="#CA0000"
                          stroke-width="1.25"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    )}
                    <svg
                      onClick={() =>
                        appendDocument({
                          documentId: "",
                        })
                      }
                      width="36"
                      height="36"
                      viewBox="0 0 36 36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="cursor-pointer"
                    >
                      <rect
                        x="0.5"
                        y="0.5"
                        width="35"
                        height="35"
                        rx="5.5"
                        stroke="#181818"
                      />
                      <path
                        d="M18 12.167V23.8337"
                        stroke="#121212"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12.1641 18H23.8307"
                        stroke="#121212"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ) : (
                  <svg
                    onClick={() => removeDocument(index)}
                    width="36"
                    height="36"
                    viewBox="0 0 36 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width="35"
                      height="35"
                      rx="5.5"
                      stroke="#CA0000"
                    />
                    <path
                      d="M10.5 13H12.1667H25.5"
                      stroke="#CA0000"
                      stroke-width="1.25"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M14.6719 13.0003V11.3337C14.6719 10.8916 14.8475 10.4677 15.16 10.1551C15.4726 9.84259 15.8965 9.66699 16.3385 9.66699H19.6719C20.1139 9.66699 20.5378 9.84259 20.8504 10.1551C21.1629 10.4677 21.3385 10.8916 21.3385 11.3337V13.0003M23.8385 13.0003V24.667C23.8385 25.109 23.6629 25.5329 23.3504 25.8455C23.0378 26.1581 22.6139 26.3337 22.1719 26.3337H13.8385C13.3965 26.3337 12.9726 26.1581 12.66 25.8455C12.3475 25.5329 12.1719 25.109 12.1719 24.667V13.0003H23.8385Z"
                      stroke="#CA0000"
                      stroke-width="1.25"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M16.3281 17.167V22.167"
                      stroke="#CA0000"
                      stroke-width="1.25"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M19.6719 17.167V22.167"
                      stroke="#CA0000"
                      stroke-width="1.25"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
          ))}
          {documents.length < 1 && (
            <p className="text-red-500">Please upload your documents</p>
          )}
          {documents.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center ">
              {documents.map((item, index) => {
                return (
                  <>
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => {
                          const fileKey = item.fileKey;
                          downloadDocument({ fileKey }).then((url) => {
                            router.push(url!);
                          });
                        }}
                        className="cursor-pointer"
                      >
                        Document {index + 1}
                      </div>
                      <div
                        onClick={() =>
                          deleteDocumentFromKey(
                            professionalUserId,
                            item.fileKey,
                            item.id,
                          )
                        }
                        className="cursor-pointer"
                      >
                        <Trash2 className="text-red-500 size-4" />
                      </div>
                    </div>
                  </>
                );
              })}
            </div>
          )}

          <div>
            <UIFormLabel>About You</UIFormLabel>
            <Controller
              control={control}
              name="aboutYou"
              render={({ field }) => {
                return (
                  <>
                    <textarea
                      className="w-full rounded-md border border-border-color py-3 pl-4 outline-primary  placeholder:font-inter placeholder:text-sm placeholder:font-normal placeholder:text-placeholder-color "
                      placeholder="Write about Youself"
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {errors && errors.aboutYou && (
                      <p className="text-red-500">{errors.aboutYou.message}</p>
                    )}
                  </>
                );
              }}
            />
          </div>



          <div className="flex flex-col items-center justify-center gap-4 ">
            <Button
              disabled={loadingState}
              className="w-[260px] sm:w-[325px]"
              variant="OTP"
              type="submit"
              onClick={() => {
                handleSubmit(onSubmit, errorHandler);
              }}
            >
              {loadingState && <LoadingSpinner width="20" height="20" />}
              {loadingState ? "Loading..." : " Next"}
            </Button>
            <div className=" font-inter text-base font-normal">
              Already have a account?{" "}
              <Link
                className="ml-3 font-poppins text-base  font-medium text-primary"
                href="/auth/login"
              >
                Login{" "}
                <svg
                  className="inline"
                  width="15"
                  height="8"
                  viewBox="0 0 15 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.13634 3.36357L12.3273 3.36357L10.2318 1.26807C9.98332 1.01959 9.98332 0.616643 10.2318 0.368122C10.4803 0.119643 10.8833 0.119643 11.1318 0.368122L14.3136 3.54994C14.5621 3.79842 14.5621 4.20136 14.3136 4.44989L11.1318 7.6317C11.0075 7.75596 10.8447 7.81812 10.6818 7.81812C10.5189 7.81812 10.3561 7.75596 10.2318 7.6317C9.98332 7.38322 9.98332 6.98028 10.2318 6.73176L12.3273 4.6363L1.13634 4.6363C0.7849 4.6363 0.499979 4.35138 0.499979 3.99993C0.499979 3.64849 0.7849 3.36357 1.13634 3.36357Z"
                    fill="#00898F"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default UploadForm;
