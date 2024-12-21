import { defineStore } from "pinia";

export const useEnquiriesStore = defineStore({
  id: "enquiries",
  actions: {
    async getEnquiries(
      $axios: any,
      query?: { page?: number; limit?: number; enquiry_id?: string },
    ) {
      try {
        const { data } = await $axios.get(`/enquiries`, {
          params: query,
        });
        return data;
      } catch (error) {
        console.error("File upload error:", error);
        throw error;
      }
    },
  },
});
