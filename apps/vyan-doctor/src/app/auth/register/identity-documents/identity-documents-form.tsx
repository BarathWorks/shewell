"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@repo/ui/src/@/components/button";
import Link from "next/link";
import { Input } from "@repo/ui/src/@/components/input";
import { Trash2 } from "lucide-react";
import IdentityDocumentsUserAction from "./identity-documents-user-action";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LoadingSpinner from "~/app/components/loading-spinner";
import { DocumentType } from "@repo/database";
import uploadAadharAction from "~/(main)/upload-aadhar-action";
import uploadPanAction from "~/(main)/upload-pan-action";
import uploadProfessionalUserDocument, {
  deleteDocumentFromKey,
} from "~/(main)/upload-document-actions";
import downloadDocument from "../uploads/download-document";
import React from "react";

interface IDocuments {
  id: string;
  fileKey: string;
}

const identityDocumentsSchema = z.object({
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "PAN format: ABCDE1234F")
    .optional()
    .or(z.literal("")),
  aadhaarNumber: z
    .string()
    .regex(/^\d{12}$/, "Aadhaar must be 12 digits")
    .optional()
    .or(z.literal("")),
  licenseNumber: z.string().optional(),
  aadharCard: z.string().optional(),
  panCard: z.string().optional(),
  documents: z.array(
    z.object({
      documentId: z.string({}),
    }),
  ),
});

const IdentityDocumentsForm = ({
  professionalUserId,
  existingIdentity,
  aadharCard,
  panCard,
  documents,
}: {
  professionalUserId: string;
  existingIdentity?: {
    panNumber: string | null;
    aadhaarNumber: string | null;
    licenseNumber: string | null;
  } | null;
  aadharCard: IDocuments | null | undefined;
  panCard: IDocuments | null | undefined;
  documents: IDocuments[];
}) => {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof identityDocumentsSchema>>({
    defaultValues: {
      panNumber: existingIdentity?.panNumber || "",
      aadhaarNumber: existingIdentity?.aadhaarNumber || "",
      licenseNumber: existingIdentity?.licenseNumber || "",
      aadharCard: aadharCard?.id || "",
      panCard: panCard?.id || "",
      documents: [{ documentId: "" }],
    },
    resolver: zodResolver(identityDocumentsSchema),
  });

  const {
    fields: documentFields,
    append: appendDocument,
    remove: removeDocument,
  } = useFieldArray({
    control,
    name: "documents",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingState, setLoadingState] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  useEffect(() => {
    params.set("step", "4");
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
  }, []);

  const onSelectAadharCard = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: DocumentType,
  ) => {
    if (!event.target.files) return;
    if (event.target.files.length > 0) {
      for (const document of event.target.files) {
        uploadAadharAction(
          professionalUserId,
          `professionalUser/${professionalUserId}/documents/${new Date().getTime()}-${document.name}`,
          document.name,
          document.type,
          type,
        )
          .then(async (resp) => {
            const { id, presignedUrl } = resp;
            const requestOptions = {
              method: "PUT",
              headers: { "Content-Type": document.type },
              body: document,
            };
            const res = await fetch(presignedUrl!, requestOptions);
            if (res.ok) {
              setValue("aadharCard", id!);
            }
          })
          .catch(() => {});
      }
    }
  };

  const onSelectPanCard = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: DocumentType,
  ) => {
    if (!event.target.files) return;
    if (event.target.files.length > 0) {
      for (const document of event.target.files) {
        uploadPanAction(
          professionalUserId,
          `professionalUser/${professionalUserId}/documents/${new Date().getTime()}-${document.name}`,
          document.name,
          document.type,
          type,
        )
          .then(async (resp) => {
            const { id, presignedUrl } = resp;
            const requestOptions = {
              method: "PUT",
              headers: { "Content-Type": document.type },
              body: document,
            };
            const res = await fetch(presignedUrl!, requestOptions);
            if (res.ok) {
              setValue("panCard", id!);
            }
          })
          .catch(() => {});
      }
    }
  };

  const onSelectDocument = async (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
    type: DocumentType,
  ) => {
    if (!event.target.files) return;
    if (event.target.files.length > 0) {
      for (const document of event.target.files) {
        uploadProfessionalUserDocument(
          professionalUserId,
          `professionalUser/${professionalUserId}/documents/${new Date().getTime()}-${document.name}`,
          document.name,
          document.type,
          type,
        )
          .then(async (resp) => {
            const { id, presignedUrl } = resp;
            const requestOptions = {
              method: "PUT",
              headers: { "Content-Type": document.type },
              body: document,
            };
            const res = await fetch(presignedUrl!, requestOptions);
            if (res.ok) {
              setValue(`documents.${index}.documentId`, id!);
            }
          })
          .catch(() => {});
      }
    }
  };

  const onSubmit = async (
    data: z.infer<typeof identityDocumentsSchema>,
  ) => {
    setLoadingState(true);
    try {
      const resp = await IdentityDocumentsUserAction({
        panNumber: data.panNumber || undefined,
        aadhaarNumber: data.aadhaarNumber || undefined,
        licenseNumber: data.licenseNumber || undefined,
      });
      setLoadingState(false);

      // Reports failure by returning `{ success: false }` rather than throwing, so
      // the catch below never sees it.
      if (!resp?.success) {
        toast({
          title: "Could not save",
          description: resp?.error ?? "Please try again",
          variant: "destructive",
        });
        return;
      }

      toast({
        description: resp.message,
        variant: "default",
      });
      router.push(`/auth/register/education/?step=5`);
    } catch (err: any) {
      setLoadingState(false);
      toast({
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const errorHandler = (e: any) => {
    console.log(e);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit, errorHandler)}
        noValidate={true}
        className="rounded-md border-2 border-primary p-4 md:p-6"
      >
        <div className="flex flex-col gap-[18px] md:gap-5 xl:gap-6">
          <p className="text-sm text-gray-500">
            All fields on this page are optional. You can skip this step.
          </p>

          {/* PAN Number */}
          <div>
            <UIFormLabel>PAN Number</UIFormLabel>
            <Controller
              name="panNumber"
              control={control}
              render={({ field }) => (
                <>
                  <UIFormInput
                    type="text"
                    placeholder="e.g. ABCDE1234F"
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                  {errors?.panNumber && (
                    <p className="text-red-500 text-sm">
                      {errors.panNumber.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Aadhaar Number */}
          <div>
            <UIFormLabel>Aadhaar Number</UIFormLabel>
            <Controller
              name="aadhaarNumber"
              control={control}
              render={({ field }) => (
                <>
                  <UIFormInput
                    type="text"
                    placeholder="12-digit Aadhaar number"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {errors?.aadhaarNumber && (
                    <p className="text-red-500 text-sm">
                      {errors.aadhaarNumber.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* License Number */}
          <div>
            <UIFormLabel>License Number</UIFormLabel>
            <Controller
              name="licenseNumber"
              control={control}
              render={({ field }) => (
                <>
                  <UIFormInput
                    type="text"
                    placeholder="Enter your license number"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </>
              )}
            />
          </div>

          {/* Upload Aadhaar Card */}
          <div className="w-full">
            <UIFormLabel>Upload Aadhaar Card</UIFormLabel>
            <Controller
              control={control}
              name="aadharCard"
              render={({ field }) => (
                <Input
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    onSelectAadharCard(e, DocumentType.AADHAR_CARD);
                  }}
                  type="file"
                />
              )}
            />
          </div>
          {aadharCard && (
            <div className="flex flex-wrap gap-2 items-center">
              <div
                onClick={() => {
                  downloadDocument({ fileKey: aadharCard.fileKey }).then(
                    (url) => router.push(url!),
                  );
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

          {/* Upload PAN Card */}
          <div className="w-full">
            <UIFormLabel>Upload PAN Card</UIFormLabel>
            <Controller
              control={control}
              name="panCard"
              render={({ field }) => (
                <Input
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    onSelectPanCard(e, DocumentType.PAN_CARD);
                  }}
                  type="file"
                />
              )}
            />
          </div>
          {panCard && (
            <div className="flex flex-wrap gap-2 items-center">
              <div
                onClick={() => {
                  downloadDocument({ fileKey: panCard.fileKey }).then((url) =>
                    router.push(url!),
                  );
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

          {/* Other Documents (Dynamic) */}
          {documentFields.map((field, index) => (
            <div
              key={field.documentId}
              className="flex w-full items-center gap-2"
            >
              <div className="w-full">
                <UIFormLabel>Upload Document {index + 1}</UIFormLabel>
                <Controller
                  control={control}
                  name={`documents.${index}.documentId`}
                  render={({ field }) => (
                    <Input
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        onSelectDocument(
                          e,
                          index,
                          DocumentType.OTHER_DOCUMENTS,
                        );
                      }}
                      type="file"
                    />
                  )}
                />
              </div>
              <div className="self-end">
                {index === documentFields.length - 1 ? (
                  <div className="flex gap-2">
                    {index > 0 && (
                      <svg
                        onClick={() => removeDocument(index)}
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
                          stroke="#CA0000"
                        />
                        <path
                          d="M10.5 13H12.1667H25.5"
                          stroke="#CA0000"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14.6719 13.0003V11.3337C14.6719 10.8916 14.8475 10.4677 15.16 10.1551C15.4726 9.84259 15.8965 9.66699 16.3385 9.66699H19.6719C20.1139 9.66699 20.5378 9.84259 20.8504 10.1551C21.1629 10.4677 21.3385 10.8916 21.3385 11.3337V13.0003M23.8385 13.0003V24.667C23.8385 25.109 23.6629 25.5329 23.3504 25.8455C23.0378 26.1581 22.6139 26.3337 22.1719 26.3337H13.8385C13.3965 26.3337 12.9726 26.1581 12.66 25.8455C12.3475 25.5329 12.1719 25.109 12.1719 24.667V13.0003H23.8385Z"
                          stroke="#CA0000"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <svg
                      onClick={() => appendDocument({ documentId: "" })}
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
                    className="cursor-pointer"
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
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14.6719 13.0003V11.3337C14.6719 10.8916 14.8475 10.4677 15.16 10.1551C15.4726 9.84259 15.8965 9.66699 16.3385 9.66699H19.6719C20.1139 9.66699 20.5378 9.84259 20.8504 10.1551C21.1629 10.4677 21.3385 10.8916 21.3385 11.3337V13.0003M23.8385 13.0003V24.667C23.8385 25.109 23.6629 25.5329 23.3504 25.8455C23.0378 26.1581 22.6139 26.3337 22.1719 26.3337H13.8385C13.3965 26.3337 12.9726 26.1581 12.66 25.8455C12.3475 25.5329 12.1719 25.109 12.1719 24.667V13.0003H23.8385Z"
                      stroke="#CA0000"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
          ))}

          {documents.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {documents.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div
                    onClick={() => {
                      downloadDocument({ fileKey: item.fileKey }).then(
                        (url) => router.push(url!),
                      );
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
              ))}
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col items-center justify-center gap-4 xl:flex-row xl:justify-between">
            <Button
              disabled={loadingState}
              className="w-[260px] xl:order-last xl:w-[164px]"
              variant="OTP"
              type="submit"
            >
              {loadingState && <LoadingSpinner width="20" height="20" />}
              {loadingState ? "Loading..." : " Next"}
            </Button>
            <div className=" font-inter text-sm font-normal sm:text-base">
              Already have a account?{" "}
              <Link
                className="ml-3 font-poppins text-base font-medium text-primary"
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

export default IdentityDocumentsForm;
