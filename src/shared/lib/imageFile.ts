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
