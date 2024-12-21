import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

interface SessionState {
  authToken: string | null;
  refreshToken: string | null;
  userData: any;
}

export const useSessionStore = defineStore({
  id: "session",

  state: (): SessionState => ({
    refreshToken: useLocalStorage("refreshToken", null) as any,
    authToken: useLocalStorage("authToken", null) as any,
    userData: null,
  }),
  actions: {
    async fetchUserData($axios: any) {
      try {
        const { data } = await $axios.get("/user/me");
        this.setUserData(data.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    setAuthToken(token: string) {
      this.authToken = token;
    },
    setRefreshToken(token: string) {
      this.refreshToken = token;
    },
    setUserData(user: any) {
      this.userData = user;
    },
    async clearSession() {
      this.authToken = null;
      this.refreshToken = null;
      this.userData = null;
    },
  },
  getters: {
    isAuthenticated(): boolean {
      return !!this.authToken;
    },
  },
});
