import type { BackendAsset, BackendService } from "@/shared/lib/api-types";
import type { InventoryItem, ServiceItem } from "@/features/dashboard/data/dashboardData";

function normalizeStatus(status: unknown): string {
  const raw = String(status ?? "").toLowerCase();
  if (!raw) return "available";
  return raw;
}

function formatPeso(value: unknown): string {
  const num =
    typeof value === "string" ? parseFloat(value) :
      typeof value === "number" ? value :
        NaN;
  if (!Number.isFinite(num)) return "₱0";
  return `₱${num.toLocaleString()}`;
}

export function mapBackendAssetToInventoryItem(asset: BackendAsset): InventoryItem {
  const category =
    typeof asset.category === "string"
      ? asset.category
      : "Uncategorized";

  const statusRaw = normalizeStatus(asset.status);
  const status =
    statusRaw === "published"
      ? "Available"
      : statusRaw
        ? statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1)
        : "Available";

  const img =
    asset.images?.[0]?.url ||
    asset.images?.[0]?.imageUrl ||
    "/placeholder-inventory.jpg";

  return {
    id: asset.id,
    name: asset.name,
    category,
    status,
    img,
  };
}

export function mapBackendServiceToServiceItem(service: BackendService): ServiceItem {
  const statusRaw = normalizeStatus(service.status);
  const status =
    statusRaw === "published"
      ? "Active"
      : statusRaw
        ? statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1)
        : "Active";

  // Try to infer a category slug/name for icon+color mapping
  const slug =
    typeof service.category === "string"
      ? service.category.toLowerCase()
      : "other";

  const iconMap: Record<string, string> = {
    planning: "event_note",
    decoration: "brush",
    catering: "restaurant",
    photography: "camera_alt",
    videography: "videocam",
    entertainment: "music_note",
    coordination: "groups",
    other: "room_service",
  };

  const colorMap: Record<string, string> = {
    planning: "text-accent bg-accent/20",
    decoration: "text-pink-400 bg-pink-500/20",
    catering: "text-orange-400 bg-orange-500/20",
    photography: "text-blue-400 bg-blue-500/20",
    videography: "text-blue-400 bg-blue-500/20",
    entertainment: "text-purple-400 bg-purple-500/20",
    coordination: "text-accent bg-accent/20",
    other: "text-accent bg-accent/20",
  };

  const price = formatPeso(service.price);
  const unit = service.billingRate;
  const displayPrice = unit ? `${price} ${unit}` : price;

  return {
    id: service.id,
    name: service.name,
    price: displayPrice,
    status,
    icon: iconMap[slug] || "room_service",
    color: colorMap[slug] || "text-accent bg-accent/20",
  };
}

