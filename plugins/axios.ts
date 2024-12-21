import axios from "axios";
import { useSessionStore } from "~/store/session";

export default defineNuxtPlugin((context) => {
  const sessionStore = useSessionStore();
  const customAxios = axios.create({
    baseURL: context.$config.public.SOCKET_URL as string,
  });

  const config2 = useRuntimeConfig().public;
  const cookieOptions = {
    domain: config2.DOMAIN,
    secure: true,
    maxAge: 30 * 24 * 60 * 60,
  };

  const accessToken = useCookie("accessToken", cookieOptions).value;

  customAxios.interceptors.request.use(
    (config) => {
      config.headers["scoped-auth"] = context.$config.public.SECRET_KEY;
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      console.error("Request error:", error);
      return Promise.reject(error);
    },
  );

  customAxios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      console.error("Response error:", error);
      const originalRequest = error.config;

      if (
        error.response &&
        error.response.status === 403 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          const { data } = await customAxios.post("/auth/refresh-token", {
            refreshToken: sessionStore.refreshToken,
          });
          sessionStore.setAuthToken(data.data.accessToken);
          sessionStore.setRefreshToken(data.data.refreshToken);
          return customAxios(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token error:", refreshError);
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );

  return {
    provide: {
      axios: customAxios,
    },
  };
});
