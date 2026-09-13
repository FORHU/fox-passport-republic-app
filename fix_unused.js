const fs = require("fs");

function removeLineContaining(file, pattern) {
  if (!fs.existsSync(file)) { console.log("Not found:", file); return; }
  let c = fs.readFileSync(file, "utf8");
  const orig = c;
  const lines = c.split("\n");
  const filtered = lines.filter(l => !pattern.test(l));
  c = filtered.join("\n");
  if (c !== orig) { fs.writeFileSync(file, c, "utf8"); console.log("Fixed:", file, pattern); }
}

function removeFromImport(file, name) {
  if (!fs.existsSync(file)) { console.log("Not found:", file); return; }
  let c = fs.readFileSync(file, "utf8");
  const orig = c;
  // Remove from destructured import: ", name" or "name, " or standalone
  c = c.replace(new RegExp(",\\s*" + name + "(?=[,}\\s])"), "");
  c = c.replace(new RegExp("(?<=[{,]\\s*)" + name + "\\s*,\\s*"), "");
  c = c.replace(new RegExp("\\{\\s*" + name + "\\s*\\}"), "{}");
  if (c !== orig) { fs.writeFileSync(file, c, "utf8"); console.log("Removed import:", name, "from", file); }
  else { console.log("Pattern not matched for:", name, "in", file); }
}

// stripe-connect/session/route.ts - 'stripe' assigned but never used
removeLineContaining(
  "src/app/api/stripe-connect/session/route.ts",
  /const stripe\s*=/
);

// AssetBookingClient.tsx - 'today' unused
removeLineContaining(
  "src/app/booking/_components/AssetBookingClient.tsx",
  /const today\s*=/
);

// OccupancySection.tsx - 'statusColor' unused
removeLineContaining(
  "src/app/creator-dashboard/_components/OccupancySection.tsx",
  /const statusColor\s*=/
);

// assets/[id]/edit/page.tsx - 'setCategory' destructure unused
// Need to see this one more carefully
// partnerships/page.tsx - 'useAuthStore' unused
removeFromImport("src/app/creator-dashboard/partnerships/page.tsx", "useAuthStore");

// EventDetailView.tsx - 'useRouter' unused
removeFromImport("src/app/event/[eventId]/_components/EventDetailView.tsx", "useRouter");

// create-service/page.tsx - 'activeType' unused
removeLineContaining(
  "src/app/foxer/create-service/page.tsx",
  /const \[activeType\s*,/
);

// AdminCitizenTable.tsx - 'role' unused
removeLineContaining(
  "src/features/admin/components/AdminCitizenTable.tsx",
  /^\s*const role\s*=/
);

// AdminVenuesTable.tsx - 'useEffect', 'PAGE_SIZE' unused
removeFromImport("src/features/admin/components/AdminVenuesTable.tsx", "useEffect");
removeLineContaining(
  "src/features/admin/components/AdminVenuesTable.tsx",
  /const PAGE_SIZE\s*=/
);

// AssetDetailClient.tsx - 'user' unused
removeLineContaining(
  "src/features/asset/components/AssetDetailClient.tsx",
  /const \{?\s*user\s*\}?\s*=\s*use/
);

// ListingSidebar.tsx - 'state' unused
removeLineContaining(
  "src/features/asset/components/listing-builder/ListingSidebar.tsx",
  /const state\s*=/
);

// useHostAssetEdit.ts - 'useMemo', 'toast', 'STATUSES', 'INVENTORY_UNITS' unused
removeFromImport("src/features/asset/hooks/useHostAssetEdit.ts", "useMemo");
removeFromImport("src/features/asset/hooks/useHostAssetEdit.ts", "toast");
removeLineContaining("src/features/asset/hooks/useHostAssetEdit.ts", /const STATUSES\s*=/);
removeLineContaining("src/features/asset/hooks/useHostAssetEdit.ts", /const INVENTORY_UNITS\s*=/);

// FulfillmentPassClient.tsx - 'user' unused
removeLineContaining(
  "src/features/booking/components/FulfillmentPassClient.tsx",
  /const \{?\s*user\s*\}?\s*=/
);

// CheckoutSuccessClient.tsx - useMemo no longer needed
removeFromImport("src/features/booking/components/CheckoutSuccessClient.tsx", "useMemo");
// VenueBookingSuccessClient.tsx
removeFromImport("src/features/booking/components/VenueBookingSuccessClient.tsx", "useMemo");
// ItemSuccessClient.tsx
removeFromImport("src/features/booking/components/ItemSuccessClient.tsx", "useMemo");

// TrendingSection.tsx - 'i' in map
removeLineContaining(
  "src/features/category/components/detail/TrendingSection.tsx",
  /,\s*i\)\s*=>/
);

// EventPaymentPanel.test.tsx - 'waitFor' unused
removeFromImport(
  "src/features/event/components/__tests__/EventPaymentPanel.test.tsx",
  "waitFor"
);

// EventBlueprint.tsx - 'ResourceItem' unused
removeFromImport(
  "src/features/event/components/event-builder/EventBlueprint.tsx",
  "ResourceItem"
);

// useHostEventEdit.ts - 'normalizeEventStatusToBackend', 'existingEndDatetime'
removeLineContaining(
  "src/features/event/hooks/useHostEventEdit.ts",
  /function normalizeEventStatusToBackend/
);
// existingEndDatetime - remove state setter usage entirely if state is never read
// Actually just the setExistingEndDatetime call line & state declaration need to go
// Let's just remove the state declaration - the set call is harmless
removeLineContaining(
  "src/features/event/hooks/useHostEventEdit.ts",
  /const \[existingEndDatetime, setExistingEndDatetime\]/
);

// useEventBuilderStore.ts - '_file' in fn signature
// PassportStamp.tsx - 'stampYear' unused
removeLineContaining(
  "src/features/gamification/components/PassportStamp.tsx",
  /const stampYear\s*=/
);

// ProgressDashboard.tsx - '_selectedPath' unused
removeLineContaining(
  "src/features/gamification/components/ProgressDashboard.tsx",
  /const \[_selectedPath\s*,/
);

// UserJourney.tsx - 'navigateToPassport' unused
removeLineContaining(
  "src/features/gamification/components/UserJourney.tsx",
  /const navigateToPassport\s*=/
);

// FoxerLandingPage.tsx - 'featuredTemplates' unused
removeLineContaining(
  "src/features/landing/components/FoxerLandingPage.tsx",
  /const featuredTemplates\s*=/
);

// FoxerApplicationClient.tsx - 'FileUploader' unused
removeFromImport(
  "src/features/role-application/components/FoxerApplicationClient.tsx",
  "FileUploader"
);
removeLineContaining(
  "src/features/role-application/components/FoxerApplicationClient.tsx",
  /import.*FileUploader/
);

// MayorApplicationClient.tsx - 'FileUploader' unused
removeFromImport(
  "src/features/role-application/components/MayorApplicationClient.tsx",
  "FileUploader"
);
removeLineContaining(
  "src/features/role-application/components/MayorApplicationClient.tsx",
  /import.*FileUploader/
);

// useHostServiceEdit.ts - 'toast', 'SERVICE_STATUSES', 'SERVICE_UNITS' unused
removeFromImport("src/features/service/hooks/useHostServiceEdit.ts", "toast");
removeLineContaining("src/features/service/hooks/useHostServiceEdit.ts", /const SERVICE_STATUSES\s*=/);
removeLineContaining("src/features/service/hooks/useHostServiceEdit.ts", /const SERVICE_UNITS\s*=/);

// useServicesBuilder.ts - 'categoryMap', 'isUploading', 'stringHostId' unused
removeLineContaining("src/features/service/hooks/useServicesBuilder.ts", /const categoryMap\s*=/);
removeLineContaining("src/features/service/hooks/useServicesBuilder.ts", /const stringHostId\s*=/);

// UserHeader.tsx - 'avatarUrl', 'initial' unused
removeLineContaining("src/features/user/components/citizen/UserHeader.tsx", /const avatarUrl\s*=/);
removeLineContaining("src/features/user/components/citizen/UserHeader.tsx", /const initial\s*=/);

// useVenueDetail.ts - 'router' unused
removeLineContaining("src/features/venue/hooks/useVenueDetail.ts", /const router\s*=/);

// useVenueDetailStore.ts - 'get' unused
removeLineContaining("src/features/venue/store/useVenueDetailStore.ts", /^\s*get\s*[,=]/);

// useSessionManager.ts - 'api', 'IDLE_LOGOUT_MS' unused
removeFromImport("src/shared/auth/useSessionManager.ts", "api");
removeLineContaining("src/shared/auth/useSessionManager.ts", /const IDLE_LOGOUT_MS\s*=/);

// data.ts - '_userId' unused
// (it's a param, just prefix)

console.log("Done!");
