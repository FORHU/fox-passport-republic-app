import { defineStore } from "pinia";

export const useUserStore = defineStore({
  id: "user",
  actions: {
    async updateUser($axios: any, payload: any) {
      try {
        const { data } = await $axios.patch(`/user`, payload);
        return data;
      } catch (error) {
        console.error("Login error:", error);
      }
    },
  },
});
