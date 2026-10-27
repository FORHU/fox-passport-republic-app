/**
 * The listing builders hold a picked image as a `data:` URL until the listing
 * is saved. This turns it back into a File for `useFileUpload`, named after
 * its real type (a PNG used to be uploaded as `.jpg`).
 */
export async function imageUrlToFile(
  src: string,
  baseName: string,
): Promise<File> {
  const blob = await (await fetch(src)).blob();
  const ext = blob.type.split("/")[1] || "jpg";
  return new File([blob], `${baseName}-${Date.now()}.${ext}`, {
    type: blob.type,
  });
}

/** What the API's presigned upload accepts (`s3.controller.ts`), minus the
 * formats no listing photo should be. */
export const LISTING_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
