import { defineStore } from "pinia";

export const useFileStore = defineStore({
  id: "files",
  actions: {
    async uploadFileToS3($axios: any, payload: any) {
      try {
        const formData = new FormData();
        formData.append("file", payload.file);
        const { data } = await $axios.post(`/files`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return data;
      } catch (error) {
        console.error("File upload error:", error);
        throw error;
      }
    },
  },
});
