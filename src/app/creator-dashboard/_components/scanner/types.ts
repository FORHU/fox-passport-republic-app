export type ScanState =
  "idle" | "scanning" | "success" | "error" | "already_checked_in";

export type ModeTab = "manual" | "camera" | "upload";

export interface ScanResult {
  ticketCode: string;
  message?: string;
}
