import { defineStore } from "pinia";

export const useInboxStore = defineStore({
  id: "inboxes",
  actions: {
    async getInboxes(
      $axios: any,
      query?: { page?: number; limit?: number; room_id?: string },
    ) {
      try {
        const data = await $axios.get(`/message-inbox`, {
          params: query,
        });

        return data.data;
      } catch (error) {
        console.error("File upload error:", error);
        throw error;
      }
    },
  },
});
