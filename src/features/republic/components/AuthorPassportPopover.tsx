import Link from "next/link";
import type { ReactNode } from "react";
import { Award } from "lucide-react";
import { FeedAuthor } from "../types";
import { isPartnerUser } from "@/shared/auth/roles";
import { Badge } from "@/shared/components/ui/badge";
import { useAuthStore } from "@/shared/auth/useAuthStore";

interface AuthorPassportPopoverProps {
  author: FeedAuthor;
  createdAt: string;
  isFollowingAuthor?: boolean;
  followersCount?: number;
  /** Rendered at the end of the badges/follow row — the post-level "..."
   * menu (Edit/Delete/Save/Report), kept as a slot here so it sits in the
   * same header row as everything else instead of floating separately. */
  optionsMenu?: ReactNode;
  followButtonSlot?: ReactNode;
  messageButtonSlot?: ReactNode;
}

export function AuthorPassportPopover({
  author,
  createdAt,
  followersCount,
  optionsMenu,
  followButtonSlot,
  messageButtonSlot,
}: AuthorPassportPopoverProps) {
  const citizenPath = author.passport?.paths?.find((p) => p.path === "user");
  const citizenLevel = citizenPath?.level ?? 1;

  const rawImg = author.imgId;
  const avatarUrl = rawImg
    ? rawImg.startsWith("http://") || rawImg.startsWith("https://")
      ? rawImg
      : `https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${rawImg}`
    : null;

  const initial = author.name ? author.name.charAt(0).toUpperCase() : "?";

  const isPartner = isPartnerUser(author);

  const dateFormatted = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const badges = author.passport?.userBadges?.map((ub) => ub.badge) ?? [];
  const stampsCount = author.passport?.stamps?.length ?? 0;

  const currentUserId = useAuthStore((state) => state.user?.id);
  const isSelf = currentUserId === author.id;

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <Link href={`/user/${author.id}`} className="relative group block">
          <div
            className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-105 ${
              isPartner
                ? "ring-2 ring-amber-400 bg-amber-950/40 text-amber-300"
                : "ring-2 ring-lime-400/40 bg-zinc-800 text-lime-400"
            }`}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
          {/* Level indicator bubble */}
          <span className="absolute -bottom-1 -right-1 bg-zinc-900 border border-zinc-700 text-[10px] font-extrabold text-lime-400 px-1.5 py-0.2 rounded-full shadow">
            L{citizenLevel}
          </span>
        </Link>

        {/* Name and Metadata */}
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={`/user/${author.id}`}
              className="font-bold text-white text-sm hover:text-lime-400 hover:underline transition-colors"
            >
              {author.name}
            </Link>
            {isPartner && <Badge variant="partner">Partner Foxer</Badge>}
            {!isPartner && author.roleType?.length > 0 && (
              <Badge variant="neutral">
                {author.roleType[0].replace("Foxer", " Foxer")}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
            <span>{author.username ? `@${author.username}` : "Citizen"}</span>
            <span>•</span>
            <span>{dateFormatted}</span>

            {typeof followersCount === "number" && (
              <>
                <span>•</span>
                <span>
                  {followersCount}{" "}
                  {followersCount === 1 ? "Follower" : "Followers"}
                </span>
              </>
            )}

            {stampsCount > 0 && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                  <Award className="h-[13px] w-[13px]" strokeWidth={2} />
                  {stampsCount} {stampsCount === 1 ? "Stamp" : "Stamps"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Badges preview & Follow */}
      <div className="flex items-center gap-4">
        {badges.length > 0 && (
          <div className="hidden sm:flex items-center gap-2.5">
            {badges.slice(0, 2).map((b) => (
              <span
                key={b.id}
                title={b.name}
                className="flex items-center justify-center text-amber-400"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {b.icon || "star"}
                </span>
              </span>
            ))}
          </div>
        )}
        {!isSelf && messageButtonSlot}
        {followButtonSlot}
        {optionsMenu}
      </div>
    </div>
  );
}
