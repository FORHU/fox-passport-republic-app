"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Globe2,
  Handshake,
  Images,
  Lock,
  MapPin,
  Megaphone,
  NotebookPen,
  PartyPopper,
  Send,
  Speaker,
  Star,
  Tag as TagIcon,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  PostType,
  PostVisibility,
  CreatePostPayload,
  MentionCandidate,
} from "@/features/republic/types";
import { createPost, searchMentionCandidates } from "@/shared/api/feed";
import {
  PhotoTagEditor,
  type PendingMediaTag,
} from "@/features/republic/components/PhotoTagEditor";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { isPartnerUser } from "@/shared/auth/roles";
import api from "@/shared/lib/axios";
import { fetchVenuesByHostId } from "@/features/venue/api/venues";
import { fetchAssetsByOwnerId } from "@/features/asset/api/assets";
import { fetchServicesByOwnerId } from "@/features/service/api/services";
import { fetchOrganizerEvents } from "@/features/event/api/events";

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".m4v"];
const isVideoUrl = (url: string) => {
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
};

interface PendingTag extends PendingMediaTag {
  mediaUrl: string;
}

interface ComposePostBoxProps {
  onPostCreated?: () => void;
  /** Rendered inside ComposePostModal, which already supplies the card
   * chrome (border, background, header) — drops this component's own so
   * they don't double up. */
  embedded?: boolean;
  /** Closes the containing modal after a successful post. Only meaningful
   * alongside `embedded`. */
  onClose?: () => void;
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

export function ComposePostBox({
  onPostCreated,
  embedded = false,
  onClose,
}: ComposePostBoxProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<PostType>("citizen_experience");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaTags, setMediaTags] = useState<PendingTag[]>([]);
  const [taggingUrl, setTaggingUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(embedded);
  const [resourceId, setResourceId] = useState("");
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionCandidates, setMentionCandidates] = useState<
    MentionCandidate[]
  >([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPosRef = useRef(0);

  useEffect(() => {
    if (mentionQuery === null) {
      setMentionCandidates([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      searchMentionCandidates(mentionQuery)
        .then((results) => {
          if (!cancelled) setMentionCandidates(results);
        })
        .catch(() => {
          if (!cancelled) setMentionCandidates([]);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [mentionQuery]);

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
            <Megaphone className="h-5 w-5" strokeWidth={2} />
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

  const postOptions: Array<{
    type: PostType;
    label: string;
    icon: LucideIcon;
  }> = [
    { type: "citizen_experience", label: "Citizen Story", icon: NotebookPen },
    { type: "review_share", label: "Share Review", icon: Star },
    ...(isVenueFoxer
      ? [
          {
            type: "venue_spotlight" as PostType,
            label: "Spotlight Venue",
            icon: MapPin,
          },
        ]
      : []),
    ...(isGearFoxer
      ? [
          {
            type: "gear_offering" as PostType,
            label: "Offer Gear",
            icon: Speaker,
          },
        ]
      : []),
    ...(isServiceFoxer
      ? [
          {
            type: "service_offering" as PostType,
            label: "Offer Service",
            icon: Wrench,
          },
        ]
      : []),
    ...(isEventFoxer
      ? [
          {
            type: "event_announcement" as PostType,
            label: "Announce Event",
            icon: PartyPopper,
          },
        ]
      : []),
    ...(isPartner
      ? [
          {
            type: "partner_announcement" as PostType,
            label: "Partner Backing",
            icon: Handshake,
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
      setError("Failed to upload media. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeMedia = (idx: number) => {
    const removedUrl = mediaUrls[idx];
    setMediaUrls((prev) => prev.filter((_, i) => i !== idx));
    setMediaTags((prev) => prev.filter((t) => t.mediaUrl !== removedUrl));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursor = e.target.selectionStart;
    setContent(value);
    cursorPosRef.current = cursor;

    const uptoCursor = value.slice(0, cursor);
    // {0,32}, not {1,32} — a bare "@" with nothing typed yet should still
    // open the picker (empty-query search), matching Facebook's mention
    // picker instead of waiting for the first letter.
    const match = uptoCursor.match(/@([a-zA-Z0-9_]{0,32})$/);
    setMentionQuery(match ? match[1] : null);
  };

  const insertMention = (username: string) => {
    const cursor = cursorPosRef.current;
    const before = content
      .slice(0, cursor)
      .replace(/@([a-zA-Z0-9_]{1,32})$/, `@${username} `);
    const after = content.slice(cursor);
    setContent(before + after);
    setMentionQuery(null);
    setMentionCandidates([]);
    textareaRef.current?.focus();
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
      visibility,
      ...(resourceConfig ? { [resourceConfig.field]: resourceId } : {}),
      ...(mediaTags.length > 0
        ? {
            mediaTags: mediaTags.map(({ mediaUrl, userId, x, y }) => ({
              mediaUrl,
              userId,
              x,
              y,
            })),
          }
        : {}),
    };

    try {
      await createPost(payload);
      setContent("");
      setMediaUrls([]);
      setMediaTags([]);
      setResourceId("");
      setVisibility("public");
      setIsExpanded(false);
      onPostCreated?.();
      onClose?.();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to publish post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={
        embedded
          ? "w-full"
          : "w-full rounded-2xl bg-zinc-900/90 border border-zinc-800/80 p-4 sm:p-5 shadow-xl"
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Post Type Selector Pills */}
        <div className="post-type-scrollbar flex items-center gap-1.5 overflow-x-auto pb-2 mb-3">
          {postOptions.map((opt) => {
            const isSelected = type === opt.type;
            return (
              <button
                type="button"
                key={opt.type}
                onClick={(e) => {
                  setType(opt.type);
                  setIsExpanded(true);
                  setResourceId("");
                  e.currentTarget.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "nearest",
                  });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-lime-400 text-black shadow-md"
                    : "bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700"
                }`}
              >
                <opt.icon className="h-[15px] w-[15px]" strokeWidth={2} />
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
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onFocus={() => setIsExpanded(true)}
            autoFocus={embedded}
            placeholder={
              type === "partner_announcement"
                ? "Share co-production opportunities, funding terms, or packages..."
                : type === "venue_spotlight"
                  ? "Tell citizens about your space, upcoming weekend slots, and amenities..."
                  : "What's happening in the Republic? Share an experience, tip, or story..."
            }
            rows={embedded ? 8 : isExpanded ? 3 : 2}
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400/60 transition-all resize-none"
          />

          {mentionQuery !== null && mentionCandidates.length > 0 && (
            <div className="absolute left-0 top-full z-20 mt-1 w-56 max-h-48 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl py-1">
              {mentionCandidates.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => insertMention(c.username || c.name)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-800 transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0 overflow-hidden">
                    {c.imgId ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.imgId}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      c.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {c.name}
                    </p>
                    {c.username && (
                      <p className="text-[10px] text-zinc-500 truncate">
                        @{c.username}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Media Preview Grid */}
        {mediaUrls.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2.5">
            {mediaUrls.map((url, idx) => {
              const tagCount = mediaTags.filter(
                (t) => t.mediaUrl === url,
              ).length;
              return (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-700 group"
                >
                  {isVideoUrl(url) ? (
                    <video
                      src={url}
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                  {/* Photo tagging isn't meaningful on video — FB only tags
                      people in photos, not a moving frame. */}
                  {!isVideoUrl(url) && (
                    <button
                      type="button"
                      onClick={() => setTaggingUrl(url)}
                      title="Tag people"
                      className={`absolute bottom-1 left-1 flex items-center gap-0.5 rounded-full bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white transition-opacity ${
                        tagCount > 0
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <TagIcon className="h-2.5 w-2.5" strokeWidth={2} />
                      {tagCount > 0 && tagCount}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {taggingUrl && (
          <PhotoTagEditor
            mediaUrl={taggingUrl}
            tags={mediaTags
              .filter((t) => t.mediaUrl === taggingUrl)
              .map(({ userId, x, y, name, username, imgId }) => ({
                userId,
                x,
                y,
                name,
                username,
                imgId,
              }))}
            onChange={(updated) => {
              const activeUrl = taggingUrl;
              setMediaTags((prev) => [
                ...prev.filter((t) => t.mediaUrl !== activeUrl),
                ...updated.map((t) => ({ ...t, mediaUrl: activeUrl })),
              ]);
            }}
            onClose={() => setTaggingUrl(null)}
          />
        )}

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/60">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*,video/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-lime-400 transition-colors py-1 px-2 rounded-lg hover:bg-zinc-800/60"
            >
              <Images className="h-[18px] w-[18px]" strokeWidth={2} />
              <span className="text-xs">
                {uploading ? "Uploading..." : "Add Photos"}
              </span>
            </button>

            {/* Visibility Selector */}
            <div className="flex items-center gap-1 text-xs text-zinc-400 py-1 px-2 rounded-lg bg-zinc-800/40">
              {visibility === "public" ? (
                <Globe2 className="h-3.5 w-3.5" strokeWidth={2} />
              ) : visibility === "followers" ? (
                <Users className="h-3.5 w-3.5" strokeWidth={2} />
              ) : (
                <Lock className="h-3.5 w-3.5" strokeWidth={2} />
              )}
              <select
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as PostVisibility)
                }
                className="bg-transparent text-xs text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="public">Public</option>
                <option value="followers">Followers</option>
                <option value="only_me">Only Me</option>
              </select>
            </div>

            {/* XP Award Pill */}
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              <Zap className="h-3 w-3" strokeWidth={2} />
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
            <Send className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
      </form>

      {/* globals.css hides scrollbars everywhere except .custom-scrollbar,
          which is itself tuned for light backgrounds — this pill row needs
          its own dark-theme thumb, horizontal (height, not width). */}
      <style jsx global>{`
        .post-type-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .post-type-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .post-type-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.18);
          border-radius: 20px;
        }
        .post-type-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(163, 230, 53, 0.4);
        }
        .post-type-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
        }
      `}</style>
    </div>
  );
}
