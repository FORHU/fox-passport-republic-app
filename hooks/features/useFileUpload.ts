"use client";

import { useState } from "react";
import axios from "axios"; // Used for direct S3 upload
import api from "@/lib/axios"; // Used for backend API calls
import { toast } from "sonner";

export interface UploadResult {
  fileId: string;
  url: string;
  key: string;
}

/**
 * useFileUpload Hook - "Best Practice" Direct-to-S3 Flow
 * 1. Request presigned URL from Backend
 * 2. Upload directly to S3 from Browser
 * 3. Register metadata in Backend
 */
export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File): Promise<UploadResult | null> => {
    setIsUploading(true);

    try {
      console.log(`[useFileUpload] Starting Best-Practice upload for ${file.name}...`);

      // STEP 1 & 2: Get Presigned URL from Backend
      const { data: presignedData } = await api.post(
        `/s3/get-presigned-url`,
        {
          originalFilename: file.name,
          contentType: file.type,
          sizeOfFile: file.size,
        }
      );

      const { url: uploadUrl, key } = presignedData;

      // STEP 4: Upload directly to S3
      // We use raw axios to ensure we don't send auth tokens or custom baseURL to S3
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      console.log(`[useFileUpload] S3 Upload successful, registering metadata...`);

      // Get the accessible CloudFront URL for the uploaded file
      const { data: urlData } = await api.get(`/s3/get-cloudfront-url`, { params: { key } });

      // STEP 5 & 6: Register metadata in Backend
      const { data: registerData } = await api.post(
        `/files/create`,
        {
          url: urlData.url,
          name: file.name,
          type: file.type,
        }
      );

      return {
        fileId: registerData.file.id,
        url: registerData.file.url,
        key: key,
      };
    } catch (error: any) {
      console.error("[useFileUpload] Direct Upload error:", error.response?.data || error.message);
      const msg = error.response?.data?.message || "Upload failed. Please check your connection.";
      toast.error(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
};
