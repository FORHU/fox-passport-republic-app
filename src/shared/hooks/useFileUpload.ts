"use client";

import { useState } from "react";
import axios from "axios"; // Used for direct S3 upload
import api from "@/shared/lib/axios"; // Used for backend API calls
import { toast } from "sonner";
import { checkUploadFile } from "@/shared/lib/uploadRules";

export interface UploadResult {
  fileId: string;
  url: string;
  key: string;
}

/**
 * useFileUpload Hook - "Best Practice" Direct-to-S3 Flow
 * 1. Request presigned URL from Backend (signed to this file's type and size)
 * 2. Upload directly to S3 from Browser
 * 3. Register it in Backend by key; the API checks the bytes and builds the URL
 */
export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File): Promise<UploadResult | null> => {
    const problem = checkUploadFile(file, "image");
    if (problem) {
      toast.error(problem);
      return null;
    }
    setIsUploading(true);

    try {
      console.log(
        `[useFileUpload] Starting Best-Practice upload for ${file.name}...`,
      );

      // STEP 1 & 2: Get Presigned URL from Backend
      const { data: presignedData } = await api.post(`/s3/get-presigned-url`, {
        originalFilename: file.name,
        contentType: file.type,
        sizeOfFile: file.size,
      });

      const { url: uploadUrl, key } = presignedData;

      // STEP 4: Upload directly to S3. The URL is signed to this Content-Type
      // and size, so both must match what was declared above.
      // We use raw axios to ensure we don't send auth tokens or custom baseURL to S3
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      console.log(
        `[useFileUpload] S3 Upload successful, registering metadata...`,
      );

      // STEP 5: Register in Backend. Only the key: the API reads the object's
      // first bytes, refuses (and deletes) anything that isn't a real image,
      // and builds the public URL itself.
      const { data: registerData } = await api.post(`/files/create`, {
        key,
        name: file.name,
      });

      return {
        fileId: registerData.file.id,
        url: registerData.file.url,
        key: key,
      };
    } catch (error: any) {
      console.error(
        "[useFileUpload] Direct Upload error:",
        error.response?.data || error.message,
      );
      const msg =
        error.response?.data?.message ||
        "Upload failed. Please check your connection.";
      toast.error(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * An identity document (ID, clearance, proof of funds): sent through the
   * API into the private bucket. There is no URL to get back — admins open
   * it through a short-lived link the API makes when they review it.
   */
  const uploadPrivateFile = async (
    file: File,
  ): Promise<{ fileId: string } | null> => {
    const problem = checkUploadFile(file, "document");
    if (problem) {
      toast.error(problem);
      return null;
    }
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/files/upload-private", form);
      return { fileId: data.fileId };
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Upload failed. Please check your connection.",
      );
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, uploadPrivateFile, isUploading };
};
