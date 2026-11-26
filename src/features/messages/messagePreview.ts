/**
 * The one-line preview of a message (inbox rows, message requests, the
 * new-message toast). A post or file sent without a caption has no text, so
 * it says what was sent instead of showing a blank line.
 */
export function messagePreviewText(message: {
  content?: string | null;
  hasSharedPost?: boolean;
  hasAttachments?: boolean;
}): string {
  const text = message.content?.trim();
  if (text) return text;
  if (message.hasSharedPost) return "Sent a post";
  if (message.hasAttachments) return "Sent an attachment";
  return "";
}
