/**
 * What an upload may be: the formats and size caps every file picker offers
 * and checks before sending. A copy of the API's src/utils/file-signature.ts,
 * which has the final word (it reads the file's bytes, not its name) — change
 * both together.
 *
 * HEIC is not supported: the API can't decode it. Pickers only offer the
 * formats below, so a desktop .heic file is refused with a clear message
 * instead of failing at upload.
 */

const MB = 1024 * 1024;

const DOCX =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const TYPES = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  video: ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"],
  pdf: ["application/pdf"],
  word: ["application/msword", DOCX],
};

// Some systems give a Word file no type at all (Windows without Office), so
// the picker also lists extensions and a file with no type is read by its
// name. The API reads the bytes either way.
const WORD_TYPE_BY_EXTENSION: Record<string, string> = {
  doc: "application/msword",
  docx: DOCX,
};

/** Which formats each kind of upload takes. */
const PURPOSES = {
  /** Listing, venue, event and avatar photos (presigned upload). */
  image: TYPES.image,
  /** Post and chat attachments (upload-direct). */
  media: [...TYPES.image, ...TYPES.video],
  /** Identity documents (private bucket). */
  document: [...TYPES.image, ...TYPES.pdf],
  /** Portfolio / resume (private bucket): documents only, app#371. */
  portfolio: [...TYPES.pdf, ...TYPES.word],
};

export type UploadPurpose = keyof typeof PURPOSES;

/** For an `<input type="file" accept=…>`. */
export const UPLOAD_ACCEPT: Record<UploadPurpose, string> = {
  image: PURPOSES.image.join(","),
  media: PURPOSES.media.join(","),
  document: PURPOSES.document.join(","),
  portfolio: [".pdf", ".doc", ".docx", ...PURPOSES.portfolio].join(","),
};

/** What a picker of each kind says it takes, under "Click or drag to upload". */
export const UPLOAD_HINT: Record<UploadPurpose, string> = {
  image: "JPG, PNG, WebP or GIF",
  media: "JPG, PNG, WebP, GIF, MP4, MOV or WebM",
  document: "JPG, PNG, WebP, GIF or PDF",
  portfolio: "PDF, DOC or DOCX",
};

export const MAX_UPLOAD_SIZE = {
  image: 15 * MB,
  video: 100 * MB,
  pdf: 15 * MB,
  word: 15 * MB,
};

export const FILE_EMPTY = "This file is empty.";
export const FILE_UNSUPPORTED: Record<UploadPurpose, string> = {
  image: "Use a JPG, PNG, WebP or GIF image",
  media: "Use a JPG, PNG, WebP or GIF image, or an MP4, MOV or WebM video",
  document: "Use a JPG, PNG, WebP or GIF image, or a PDF",
  portfolio: "Use a PDF or Word document (.pdf, .doc, .docx)",
};
/** For a slot that only takes a PDF (the NBI clearance). */
export const FILE_PDF_ONLY = "Use a PDF";

const kindOf = (type: string): keyof typeof MAX_UPLOAD_SIZE =>
  TYPES.video.includes(type)
    ? "video"
    : TYPES.pdf.includes(type)
      ? "pdf"
      : TYPES.word.includes(type)
        ? "word"
        : "image";

/** The file's type, or for a typeless Word file the type its name implies. */
export function typeOfFile(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return WORD_TYPE_BY_EXTENSION[ext] ?? "";
}

/** Whether this kind of upload takes this file's type (size aside). */
export const acceptsFileType = (file: File, purpose: UploadPurpose) =>
  PURPOSES[purpose].includes(typeOfFile(file));

/** Whether this is a Word file, which a browser can't show inline. */
export const isWordFile = (file: File) => TYPES.word.includes(typeOfFile(file));

/**
 * Why this file can't be uploaded, as a message to show the user, or null if
 * it can. The API checks again from the file's bytes; this saves a round trip
 * and catches what a picker's `accept` lets through (drag and drop, "All
 * files").
 */
export function checkUploadFile(
  file: File,
  purpose: UploadPurpose,
): string | null {
  if (file.size === 0) return FILE_EMPTY;
  if (!acceptsFileType(file, purpose)) return FILE_UNSUPPORTED[purpose];
  const kind = kindOf(typeOfFile(file));
  if (file.size > MAX_UPLOAD_SIZE[kind]) {
    return `File size must be ${MAX_UPLOAD_SIZE[kind] / MB}MB or below`;
  }
  return null;
}
