import { defineStore } from "pinia";
import { useSessionStore } from "./session";

export const useAuthStore = defineStore({
  id: "auth",
  state: () => ({
    accessToken: null,
    refreshToken: null,
  }),
  actions: {
    async login($axios: any, email: string, password: string, role: string) {
      try {
        const { data } = await $axios.post(`api/v1/auth/login`, {
          email,
          password,
          role,
        });

        if (data) {
          const accessToken = data.data.accessToken;
          const refreshToken = data.data.refreshToken;
          this.setAuthToken(accessToken);
          this.setRefreshToken(refreshToken);
        }
      } catch (error) {
        throw error;
      }
    },
    async registerViaEmail($axios: any, payload: Object) {
      try {
        const { data } = await $axios.post(`api/v1/auth/registration`, payload);
        if (data) {
          const accessToken = data.data.accessToken;
          const refreshToken = data.data.refreshToken;
          this.setAuthToken(accessToken);
          this.setRefreshToken(refreshToken);
        }
      } catch (error) {
        throw error;
      }
    },
    async forgotPasswordMailSend($axios: any, email: Object) {
      try {
        const { data } = await $axios.post(`/api/v1/auth/account-recovery`, {
          email,
        });
        return data.data;
      } catch (error) {
        throw error;
      }
    },
    async passwordReset(
      $axios: any,
      email: string,
      password: string,
      token: string,
    ) {
      try {
        const { data } = await $axios.patch(`/api/v1/auth/password-reset`, {
          email,
          password,
          token,
        });
        return data.data;
      } catch (error) {
        throw error;
      }
    },
    async signInWithGoogle($axios: any) {
      try {
        const { data } = await $axios.get(`api/v1/auth/google`);
        const googleAuthUrl = data.data;
        window.location = googleAuthUrl;
      } catch (error) {
        throw error;
      }
    },
    async updatePassword($axios: any, password: string) {
      try {
        const { data } = await $axios.patch(`api/v1/auth/update-password`, {
          password,
        });
        return data.data;
      } catch (error) {
        throw error;
      }
    },
    async logout($axios: any) {
      try {
        const { data } = await $axios.post(`api/v1/auth/logout`);
        return data.data;
      } catch (error) {
        throw error;
      }
    },
    setAuthToken(token: string) {
      const sessionStore = useSessionStore();
      sessionStore.setAuthToken(token);
    },
    setRefreshToken(token: string) {
      const sessionStore = useSessionStore();
      sessionStore.setRefreshToken(token);
    },
  },
});
