import { describe, it, expect } from "vitest";
import { messagePreviewText } from "@/features/messages/messagePreview";

/** A post or file sent without a caption reads "Sent a post" / "Sent an
 * attachment" in the inbox, not a blank line (app#385). */
describe("messagePreviewText", () => {
  it("shows the text when there is some", () => {
    expect(
      messagePreviewText({ content: " look ", hasSharedPost: true }),
    ).toBe("look");
  });

  it("says what was sent when there's no caption", () => {
    expect(messagePreviewText({ content: "", hasSharedPost: true })).toBe(
      "Sent a post",
    );
    expect(messagePreviewText({ content: "  ", hasAttachments: true })).toBe(
      "Sent an attachment",
    );
  });

  it("stays empty for an older API that doesn't say", () => {
    expect(messagePreviewText({ content: "" })).toBe("");
  });
});
