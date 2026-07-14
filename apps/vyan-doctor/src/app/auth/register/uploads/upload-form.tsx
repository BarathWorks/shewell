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
    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Uploads</h3>
      <form
        onSubmit={handleSubmit(onSubmit, errorHandler)}
        noValidate={true}
        className="space-y-6"
      >
        <div className="flex flex-col gap-6">
          {/* upload your image */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans mb-1">Upload Your Image*</UIFormLabel>
            <Controller
              control={control}
              name="mediaId"
              render={({ field }) => {
                return (
                  <Input
                    onChange={onSelectImage}
                    type="file"
                    style={{ border: "none" }}
                    className="w-full rounded-lg border-none bg-[#f1f5f9] py-2 px-3 font-sans text-sm text-slate-900 focus:bg-[#e2e8f0] file:bg-brand-teal file:text-white file:rounded-lg file:px-3 file:py-1 file:border-0 file:mr-3 file:hover:brightness-95 cursor-pointer file:cursor-pointer"
                  />
                );
              }}
            />
          </div>
          {fileUrl && (
            <div className="flex aspect-square w-[135px] items-center justify-center bg-[url('/images/doctor-bg.png')] bg-center bg-no-repeat rounded-full overflow-hidden shadow-sm">
              <div className="w-[116px]">
                <div className="relative aspect-square object-cover">
                  <Image
                    src={imageUrl}
                    alt="doctor-image"
                    className="rounded-full object-cover"
                    fill={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* upload-your-aadhar */}
          <div className="w-full">
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans mb-1">Upload Your Aadhar Card*</UIFormLabel>
            <Controller
              control={control}
              name="aadharCard"
              render={({ field }) => {
                return (
                  <Input
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      onSelectAadharCard(e, DocumentType.AADHAR_CARD);
                    }}
                    type="file"
                    style={{ border: "none" }}
                    className="w-full rounded-lg border-none bg-[#f1f5f9] py-2 px-3 font-sans text-sm text-slate-900 focus:bg-[#e2e8f0] file:bg-brand-teal file:text-white file:rounded-lg file:px-3 file:py-1 file:border-0 file:mr-3 file:hover:brightness-95 cursor-pointer file:cursor-pointer"
                  />
                );
              }}
            />
            {!aadharCard && (
              <p className="text-red-500 text-sm mt-1">Please upload your Aadhar Card</p>
            )}
            {aadharCard && (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-teal/10 text-brand-teal font-sans">
                  <span className="cursor-pointer hover:underline" onClick={() => {
                    const fileKey = aadharCard.fileKey;
                    downloadDocument({ fileKey }).then((url) => {
                      router.push(url!);
                    });
                  }}>
                    Aadhar Card
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      deleteDocumentFromKey(
                        professionalUserId,
                        aadharCard.fileKey,
                        aadharCard.id,
                      )
                    }
                    className="hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* upload-your-pan */}
          <div className="w-full">
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans mb-1">Upload Your Pan Card*</UIFormLabel>
            <Controller
              control={control}
              name="panCard"
              render={({ field }) => {
                return (
                  <Input
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      onSelectPanCard(e, DocumentType.PAN_CARD);
                    }}
                    type="file"
                    style={{ border: "none" }}
                    className="w-full rounded-lg border-none bg-[#f1f5f9] py-2 px-3 font-sans text-sm text-slate-900 focus:bg-[#e2e8f0] file:bg-brand-teal file:text-white file:rounded-lg file:px-3 file:py-1 file:border-0 file:mr-3 file:hover:brightness-95 cursor-pointer file:cursor-pointer"
                  />
                );
              }}
            />
            {!panCard && (
              <p className="text-red-500 text-sm mt-1">Please upload your Pan Card</p>
            )}
            {panCard && (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-teal/10 text-brand-teal font-sans">
                  <span className="cursor-pointer hover:underline" onClick={() => {
                    const fileKey = panCard.fileKey;
                    downloadDocument({ fileKey }).then((url) => {
                      router.push(url!);
                    });
                  }}>
                    Pan Card
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      deleteDocumentFromKey(
                        professionalUserId,
                        panCard.fileKey,
                        panCard.id,
                      )
                    }
                    className="hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* upload your documents */}
          {documentFields.map((field, index) => (
            <div
              key={field.id}
              className="flex w-full items-center gap-4"
            >
              <div className="w-full">
                <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans mb-1">Upload Your Document {index + 1}</UIFormLabel>
                <Controller
                  control={control}
                  name={`documents.${index}.documentId`}
                  render={({ field }) => {
                    return (
                      <Input
                        onChange={(
                          e: React.ChangeEvent<HTMLInputElement>,
                        ) => {
                          onSelectDocument(
                            e,
                            index,
                            DocumentType.OTHER_DOCUMENTS,
                          );
                        }}
                        type="file"
                        style={{ border: "none" }}
                        className="w-full rounded-lg border-none bg-[#f1f5f9] py-2 px-3 font-sans text-sm text-slate-900 focus:bg-[#e2e8f0] file:bg-brand-teal file:text-white file:rounded-lg file:px-3 file:py-1 file:border-0 file:mr-3 file:hover:brightness-95 cursor-pointer file:cursor-pointer"
                      />
                    );
                  }}
                />
              </div>

              {/* add/remove button */}
              <div className="self-end flex gap-2">
                {index === documentFields.length - 1 ? (
                  <>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="p-2.5 rounded-lg border border-solid border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center h-10 w-10"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        appendDocument({
                          documentId: "",
                        })
                      }
                      className="p-2.5 rounded-lg border border-solid border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center h-10 w-10"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="p-2.5 rounded-lg border border-solid border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center h-10 w-10"
                  >
                    <Trash2 className="size-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {documents.length < 1 && (
            <p className="text-red-500 text-sm mt-1">Please upload your documents</p>
          )}
          {documents.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {documents.map((item, index) => {
                return (
                  <span key={item.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-teal/10 text-brand-teal font-sans">
                    <span className="cursor-pointer hover:underline" onClick={() => {
                      const fileKey = item.fileKey;
                      downloadDocument({ fileKey }).then((url) => {
                        router.push(url!);
                      });
                    }}>
                      Document {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        deleteDocumentFromKey(
                          professionalUserId,
                          item.fileKey,
                          item.id,
                        )
                      }
                      className="hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans mb-1">About You*</UIFormLabel>
            <Controller
              control={control}
              name="aboutYou"
              render={({ field }) => {
                return (
                  <>
                    <textarea
                      className="w-full rounded-lg border-none bg-[#f1f5f9] px-4 py-3 text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal min-h-[120px]"
                      placeholder="Write about yourself"
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {errors && errors.aboutYou && (
                      <p className="text-red-500 text-sm mt-1">{errors.aboutYou.message}</p>
                    )}
                  </>
                );
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t">
            <p className="text-sm text-slate-500 font-sans">
              Already have an account?{" "}
              <Link
                className="text-brand-teal font-semibold hover:underline inline-flex items-center gap-1"
                href="/auth/login"
              >
                Login{" "}
                <svg className="h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </Link>
            </p>
            <button
              disabled={loadingState}
              className="bg-brand-teal text-white font-bold py-3.5 px-8 rounded-lg transition-all shadow-sm active:scale-[0.99] hover:brightness-95 flex items-center justify-center gap-2 w-full sm:w-[160px]"
              type="submit"
            >
              {loadingState && <LoadingSpinner width="20" height="20" />}
              {loadingState ? "Loading..." : "Next"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
