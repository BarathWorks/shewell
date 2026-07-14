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
      toast({
        description: resp?.message,
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
    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Identity & Documents</h3>
      <form
        onSubmit={handleSubmit(onSubmit, errorHandler)}
        noValidate={true}
        className="space-y-6"
      >
        <div className="flex flex-col gap-6">
          <p className="text-sm text-slate-500 font-sans">
            All fields on this page are optional. You can skip this step.
          </p>

          {/* PAN Number */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">PAN Number</UIFormLabel>
            <Controller
              name="panNumber"
              control={control}
              render={({ field }) => (
                <>
                  <UIFormInput
                    type="text"
                    placeholder="e.g. ABCDE1234F"
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                    style={{ border: "none" }}
                    className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                  />
                  {errors?.panNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.panNumber.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Aadhaar Number */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Aadhaar Number</UIFormLabel>
            <Controller
              name="aadhaarNumber"
              control={control}
              render={({ field }) => (
                <>
                  <UIFormInput
                    type="text"
                    placeholder="12-digit Aadhaar number"
                    value={field.value || ""}
                    onChange={field.onChange}
                    style={{ border: "none" }}
                    className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                  />
                  {errors?.aadhaarNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.aadhaarNumber.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* License Number */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">License Number</UIFormLabel>
            <Controller
              name="licenseNumber"
              control={control}
              render={({ field }) => (
                <>
                  <UIFormInput
                    type="text"
                    placeholder="Enter your license number"
                    value={field.value || ""}
                    onChange={field.onChange}
                    style={{ border: "none" }}
                    className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                  />
                </>
              )}
            />
          </div>

          {/* Upload Aadhaar Card */}
          <div className="w-full">
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Upload Aadhaar Card</UIFormLabel>
            <Controller
              control={control}
              name="aadharCard"
              render={({ field }) => (
                <Input
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    onSelectAadharCard(e, DocumentType.AADHAR_CARD);
                  }}
                  type="file"
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-teal file:text-white hover:file:brightness-95 border border-dashed border-[#c0c8cc] rounded-lg p-2 bg-[#f1f5f9] w-full cursor-pointer h-auto"
                />
              )}
            />
          </div>
          {aadharCard && (
            <div className="flex items-center justify-between bg-[#f1f5f9] p-3 rounded-lg border border-solid border-slate-200">
              <button
                type="button"
                onClick={() => {
                  downloadDocument({ fileKey: aadharCard.fileKey }).then(
                    (url) => router.push(url!),
                  );
                }}
                className="cursor-pointer font-sans text-sm font-medium text-brand-teal hover:underline text-left flex-grow"
              >
                📄 Aadhaar Card (Uploaded)
              </button>
              <button
                type="button"
                onClick={() =>
                  deleteDocumentFromKey(
                    professionalUserId,
                    aadharCard.fileKey,
                    aadharCard.id,
                  )
                }
                className="cursor-pointer p-1.5 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="text-red-500 size-4" />
              </button>
            </div>
          )}

          {/* Upload PAN Card */}
          <div className="w-full">
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Upload PAN Card</UIFormLabel>
            <Controller
              control={control}
              name="panCard"
              render={({ field }) => (
                <Input
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    onSelectPanCard(e, DocumentType.PAN_CARD);
                  }}
                  type="file"
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-teal file:text-white hover:file:brightness-95 border border-dashed border-[#c0c8cc] rounded-lg p-2 bg-[#f1f5f9] w-full cursor-pointer h-auto"
                />
              )}
            />
          </div>
          {panCard && (
            <div className="flex items-center justify-between bg-[#f1f5f9] p-3 rounded-lg border border-solid border-slate-200">
              <button
                type="button"
                onClick={() => {
                  downloadDocument({ fileKey: panCard.fileKey }).then((url) =>
                    router.push(url!),
                  );
                }}
                className="cursor-pointer font-sans text-sm font-medium text-brand-teal hover:underline text-left flex-grow"
              >
                📄 PAN Card (Uploaded)
              </button>
              <button
                type="button"
                onClick={() =>
                  deleteDocumentFromKey(
                    professionalUserId,
                    panCard.fileKey,
                    panCard.id,
                  )
                }
                className="cursor-pointer p-1.5 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="text-red-500 size-4" />
              </button>
            </div>
          )}

          {/* Other Documents (Dynamic) */}
          {documentFields.map((field, index) => (
            <div
              key={field.id}
              className="flex w-full items-center gap-4"
            >
              <div className="w-full">
                <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Upload Document {index + 1}</UIFormLabel>
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
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-teal file:text-white hover:file:brightness-95 border border-dashed border-[#c0c8cc] rounded-lg p-2 bg-[#f1f5f9] w-full cursor-pointer h-auto"
                    />
                  )}
                />
              </div>
              <div className="self-end pb-1.5">
                {index === documentFields.length - 1 ? (
                  <div className="flex gap-2">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="h-10 w-10 border border-solid border-red-500 text-red-500 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => appendDocument({ documentId: "" })}
                      className="h-10 w-10 border border-solid border-slate-700 text-slate-700 flex items-center justify-center rounded-lg hover:bg-slate-50 transition-colors font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="h-10 w-10 border border-solid border-red-500 text-red-500 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {documents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between bg-[#f1f5f9] p-3 rounded-lg border border-solid border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      downloadDocument({ fileKey: item.fileKey }).then(
                        (url) => router.push(url!),
                      );
                    }}
                    className="cursor-pointer font-sans text-sm font-medium text-brand-teal hover:underline text-left flex-grow"
                  >
                    📄 Document {index + 1}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      deleteDocumentFromKey(
                        professionalUserId,
                        item.fileKey,
                        item.id,
                      )
                    }
                    className="cursor-pointer p-1.5 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="text-red-500 size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
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

export default IdentityDocumentsForm;
