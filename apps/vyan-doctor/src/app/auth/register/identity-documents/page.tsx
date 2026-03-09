import { db } from "~/server/db";
import { redirect } from "next/navigation";
import IdentityDocumentsForm from "./identity-documents-form";
import { getServerSession } from "next-auth";
import { DocumentType } from "@repo/database";
import React from "react";

const IdentityDocumentsPage = async () => {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const professionalUser = await db.professionalUser.findFirst({
    where: { email: session.user.email },
    select: {
      id: true,
      identity: true,
    },
  });

  if (!professionalUser) {
    redirect("/auth/register/account-setup");
  }

  const aadharCard = await db.professionalUser.findFirst({
    select: {
      documents: {
        select: { id: true, fileKey: true },
        where: { type: DocumentType.AADHAR_CARD },
      },
    },
    where: { email: session.user.email },
  });

  const panCard = await db.professionalUser.findFirst({
    select: {
      documents: {
        select: { id: true, fileKey: true },
        where: { type: DocumentType.PAN_CARD },
      },
    },
    where: { email: session.user.email },
  });

  const otherDocuments = await db.professionalUser.findFirst({
    select: {
      documents: {
        select: { id: true, fileKey: true },
        where: { type: DocumentType.OTHER_DOCUMENTS },
      },
    },
    where: { email: session.user.email },
  });

  return (
    <>
      <IdentityDocumentsForm
        professionalUserId={professionalUser.id}
        existingIdentity={professionalUser.identity}
        aadharCard={aadharCard?.documents[0]}
        panCard={panCard?.documents[0]}
        documents={otherDocuments?.documents || []}
      />
    </>
  );
};

export default IdentityDocumentsPage;
