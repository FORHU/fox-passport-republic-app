"use client";

import Link from "next/link";
import type { ReactNode } from "react";

// Matches the backend's mention pattern for post/comment text — see
// feed.service.ts MENTION_PATTERN, kept in sync by character set since a
// raw @handle here is always a username, resolved via the public profile
// route which accepts either an id or a username (/users/profile/:idOrUsername).
// Hashtags aren't stored/tokenized server-side — a tapped tag just seeds the
// existing feed search box with the literal "#tag" substring, since Post
// content search is already a case-insensitive `contains` match.
const TOKEN_PATTERN = /([@#])([a-zA-Z0-9_]{2,32})/g;

/** Renders @username mentions and #hashtags in post/comment text — mentions
 * link to /user/:username, hashtags to a feed search for that tag. */
export function renderUsernameMentions(
  text: string,
  className = "font-bold text-lime-400 hover:underline",
): ReactNode[] {
  const parts: Array<string | { kind: "@" | "#"; value: string }> = [];
  let lastIndex = 0;
  for (const match of text.matchAll(TOKEN_PATTERN)) {
    const start = match.index ?? 0;
    if (start > lastIndex) parts.push(text.slice(lastIndex, start));
    parts.push({ kind: match[1] as "@" | "#", value: match[2] });
    lastIndex = start + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return parts.map((part, i) => {
    if (typeof part === "string") return <span key={i}>{part}</span>;
    const href =
      part.kind === "@"
        ? `/user/${part.value}`
        : `/republic?hashtag=${encodeURIComponent(part.value)}`;
    return (
      <Link
        key={i}
        href={href}
        onClick={(e) => e.stopPropagation()}
        className={className}
      >
        {part.kind}
        {part.value}
      </Link>
    );
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface MentionableUser {
  id: string;
  name: string;
}

/**
 * Renders @Name mentions in a chat message against a closed set of
 * conversation participants — chat messages have no username field to key
 * off of (unlike posts/comments), so this matches literal display names
 * instead. Longest names are tried first so "John Smith" wins over "John".
 */
export function renderNamedMentions(
  text: string,
  candidates: MentionableUser[],
  className = "font-bold text-lime-400 hover:underline",
): ReactNode[] {
  if (candidates.length === 0) return [text];

  const byName = new Map(candidates.map((c) => [c.name, c.id]));
  const sortedNames = [...byName.keys()].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(
    `@(${sortedNames.map(escapeRegExp).join("|")})\\b`,
    "g",
  );

  const parts: Array<string | { name: string; id: string }> = [];
  let lastIndex = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > lastIndex) parts.push(text.slice(lastIndex, start));
    const name = match[1];
    parts.push({ name, id: byName.get(name)! });
    lastIndex = start + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return parts.map((part, i) =>
    typeof part === "string" ? (
      <span key={i}>{part}</span>
    ) : (
      <Link
        key={i}
        href={`/user/${part.id}`}
        onClick={(e) => e.stopPropagation()}
        className={className}
      >
        @{part.name}
      </Link>
    ),
  );
}
