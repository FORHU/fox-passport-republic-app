import React from "react";
import CreateInvestmentWizard from "@/features/investment/components/CreateInvestmentWizard";
import { requirePermission } from "@/shared/lib/server/auth";

export const dynamic = "force-dynamic";

// This wizard is for registering an investment stream once already an
// approved investor — it has no application form of its own. Several public
// Republic surfaces link here as a general "become a Partner Foxer" CTA, so
// without this guard a citizen who isn't an investor yet lands here with no
// application form and no way forward. Send them to apply instead.
export default async function CreateInvestmentPage() {
  await requirePermission("partnership:propose", "/foxer/apply-investor");
  return <CreateInvestmentWizard />;
}
