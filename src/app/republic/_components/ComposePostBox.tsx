"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PostType, CreatePostPayload } from "@/features/republic/types";
import { createPost } from "@/shared/api/feed";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { isPartnerUser } from "@/shared/auth/roles";
import api from "@/shared/lib/axios";
import { fetchVenuesByHostId } from "@/features/venue/api/venues";
import { fetchAssetsByOwnerId } from "@/features/asset/api/assets";
import { fetchServicesByOwnerId } from "@/features/service/api/services";
import { fetchOrganizerEvents } from "@/features/event/api/events";

interface ComposePostBoxProps {
  onPostCreated?: () => void;
}

interface ResourceOption {
  id: string | number;
  name?: string;
  title?: string;
}

// Commercial post types embed a specific listing the author owns — the feed
// API validates ownership of this id server-side (feed.service.ts), so this
// only needs to help the user pick a valid one from what they actually have.
const RESOURCE_CONFIG: Partial<
  Record<
    PostType,
    {
      field: "venueId" | "assetId" | "serviceId" | "eventId";
      label: string;
      createHref: string;
      emptyMessage: string;
      fetcher: (ownerId: string) => Promise<ResourceOption[]>;
    }
  >
> = {
  venue_spotlight: {
    field: "venueId",
    label: "Venue",
    createHref: "/venue-foxer/create-venue",
    emptyMessage: "You don't have any venues yet.",
    fetcher: fetchVenuesByHostId,
  },
  gear_offering: {
    field: "assetId",
    label: "Gear",
    createHref: "/foxer/create-listing",
    emptyMessage: "You don't have any gear listings yet.",
    fetcher: fetchAssetsByOwnerId,
  },
  service_offering: {
    field: "serviceId",
    label: "Service",
    createHref: "/foxer/create-service",
    emptyMessage: "You don't have any service listings yet.",
    fetcher: fetchServicesByOwnerId,
  },
  event_announcement: {
    field: "eventId",
    label: "Event",
    createHref: "/foxer/create-event",
    emptyMessage:
      "No scheduled events yet — they appear here once someone books your event template.",
    fetcher: fetchOrganizerEvents,
  },
};

export function ComposePostBox({ onPostCreated }: ComposePostBoxProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<PostType>("citizen_experience");
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [resourceId, setResourceId] = useState("");

  // Looked up and fetched unconditionally (rules of hooks) even before the
  // `!user` early return below — `enabled` gates the actual network call.
  const resourceConfig = RESOURCE_CONFIG[type];
  const { data: resourceOptions = [], isLoading: resourceLoading } = useQuery({
    queryKey: ["compose-resource", resourceConfig?.field, user?.id],
    queryFn: () => resourceConfig!.fetcher(user!.id),
    enabled: !!user?.id && !!resourceConfig,
    staleTime: 30_000,
  });

  if (!user) {
    return (
      <div className="w-full rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-800 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400">
            <span className="material-symbols-outlined text-[20px]">
              campaign
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Join Republic Foxer
            </h4>
            <p className="text-xs text-zinc-400">
              Share your venue experiences, gear offerings, and earn Passport
              XP.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/auth/login")}
          className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs transition-all shadow-md shrink-0"
        >
          Sign In to Post
        </button>
      </div>
    );
  }

  const roleTypes = user.roleType ?? [];
  const isPartner = isPartnerUser(user);
  const isVenueFoxer = isPartner || roleTypes.includes("venueFoxer");
  const isGearFoxer = isPartner || roleTypes.includes("gearFoxer");
  const isServiceFoxer = isPartner || roleTypes.includes("serviceFoxer");
  const isEventFoxer = isPartner || roleTypes.includes("eventFoxer");

  const postOptions: Array<{ type: PostType; label: string; icon: string }> = [
    { type: "citizen_experience", label: "Citizen Story", icon: "edit_note" },
    { type: "review_share", label: "Share Review", icon: "reviews" },
    ...(isVenueFoxer
      ? [
          {
            type: "venue_spotlight" as PostType,
            label: "Spotlight Venue",
            icon: "location_on",
          },
        ]
      : []),
    ...(isGearFoxer
      ? [
          {
            type: "gear_offering" as PostType,
            label: "Offer Gear",
            icon: "speaker",
          },
        ]
      : []),
    ...(isServiceFoxer
      ? [
          {
            type: "service_offering" as PostType,
            label: "Offer Service",
            icon: "handyman",
          },
        ]
      : []),
    ...(isEventFoxer
      ? [
          {
            type: "event_announcement" as PostType,
            label: "Announce Event",
            icon: "festival",
          },
        ]
      : []),
    ...(isPartner
      ? [
          {
            type: "partner_announcement" as PostType,
            label: "Partner Backing",
            icon: "handshake",
          },
        ]
      : []),
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post("/files/upload-direct", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data.file?.url || res.data.url;
      });

      const uploaded = await Promise.all(uploadPromises);
      const validUrls = uploaded.filter(Boolean) as string[];
      setMediaUrls((prev) => [...prev, ...validUrls]);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeMedia = (idx: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    if (resourceConfig && !resourceId) {
      setError(`Select a ${resourceConfig.label.toLowerCase()} to spotlight.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: CreatePostPayload = {
      type,
      content: content.trim(),
      mediaUrls,
      ...(resourceConfig ? { [resourceConfig.field]: resourceId } : {}),
    };

    try {
      await createPost(payload);
      setContent("");
      setMediaUrls([]);
      setResourceId("");
      setIsExpanded(false);
      onPostCreated?.();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to publish post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-zinc-900/90 border border-zinc-800/80 p-4 sm:p-5 shadow-xl">
      <form onSubmit={handleSubmit}>
        {/* Post Type Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {postOptions.map((opt) => {
            const isSelected = type === opt.type;
            return (
              <button
                type="button"
                key={opt.type}
                onClick={() => {
                  setType(opt.type);
                  setIsExpanded(true);
                  setResourceId("");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-lime-400 text-black shadow-md"
                    : "bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {opt.icon}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Resource Picker — commercial post types must attach one of the
            author's own listings; the feed API validates ownership server-side. */}
        {resourceConfig && (
          <div className="mb-3">
            {resourceLoading ? (
              <p className="text-xs text-zinc-500 px-1">
                Loading your {resourceConfig.label.toLowerCase()} listings…
              </p>
            ) : resourceOptions.length === 0 ? (
              <div className="flex items-center justify-between gap-2 text-xs bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-3 py-2.5">
                <span className="text-zinc-400">
                  {resourceConfig.emptyMessage}
                </span>
                <Link
                  href={resourceConfig.createHref}
                  className="text-lime-400 font-bold hover:underline shrink-0"
                >
                  Create one
                </Link>
              </div>
            ) : (
              <select
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400/60 transition-all"
              >
                <option value="">
                  Select a {resourceConfig.label.toLowerCase()} to spotlight…
                </option>
                {resourceOptions.map((r) => (
                  <option key={String(r.id)} value={String(r.id)}>
                    {r.name || r.title || String(r.id)}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Text Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder={
            type === "partner_announcement"
              ? "Share co-production opportunities, funding terms, or packages..."
              : type === "venue_spotlight"
                ? "Tell citizens about your space, upcoming weekend slots, and amenities..."
                : "What's happening in the Republic? Share an experience, tip, or story..."
          }
          rows={isExpanded ? 3 : 2}
          className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400/60 transition-all resize-none"
        />

        {/* Media Preview Grid */}
        {mediaUrls.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2.5">
            {mediaUrls.map((url, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-700 group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeMedia(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/60">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-lime-400 transition-colors py-1 px-2 rounded-lg hover:bg-zinc-800/60"
            >
              <span className="material-symbols-outlined text-[18px]">
                photo_library
              </span>
              <span className="text-xs">
                {uploading ? "Uploading..." : "Add Photos"}
              </span>
            </button>

            {/* XP Award Pill */}
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[12px]">
                bolt
              </span>
              +15 XP for posting
            </span>
          </div>

          <button
            type="submit"
            disabled={
              !content.trim() ||
              submitting ||
              uploading ||
              !!(resourceConfig && (resourceLoading || !resourceId))
            }
            className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold text-xs transition-all shadow-md flex items-center gap-1.5"
          >
            {submitting ? "Publishing..." : "Post to Republic"}
            <span className="material-symbols-outlined text-[14px]">send</span>
          </button>
        </div>

        {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
      </form>
    </div>
  );
}
