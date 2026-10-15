import React from "react";
import ResubmitDocumentsClient from "@/features/role-application/components/ResubmitDocumentsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fix Application Documents | FoxPassport",
  description: "Resubmit the documents flagged on your role application.",
};

export default async function ResubmitDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ResubmitDocumentsClient requestId={id} />;
}
