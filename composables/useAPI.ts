import type { UseFetchOptions } from "nuxt/app";
import { defu } from "defu";

export function useAPI<T>(url: string, options: UseFetchOptions<T> = {}) {
  const { loggedIn } = useLocalAuth();
  const config = useRuntimeConfig();
  const cookieOptions = {
    domain: config.public.DOMAIN,
    secure: true,
    maxAge: 30 * 24 * 60 * 60,
  };
  const accessToken = useCookie("accessToken", cookieOptions).value;
  const retry = 0;

  const defaults: UseFetchOptions<T> = {
    baseURL: "/api",
    key: url,
    headers: loggedIn.value ? { Authorization: `Bearer ${accessToken}` } : {},
    async onResponseError({ response }) {
      if (response.status === 401 && !retry) {
        const refreshToken = useCookie("refreshToken", cookieOptions).value;
        try {
          const data = await useFetch("/api/v1/auth/refresh-token", {
            method: "POST",
            body: { refreshToken: refreshToken },
          });
          const res = data.data.value as any;
          useCookie("accessToken", cookieOptions).value = res.data.accessToken;
          const params = defu(
            {
              ...options,
              headers: { Authorization: `Bearer ${res.data.accessToken}` },
            },
            defaults,
          );
          return useFetch(url, params);
        } catch (error) {
          console.error("Failed to refresh token:", error);
          clearCookies();
        }
      }
    },
  };

  const params = defu(options, defaults);

  return useFetch(url, params);
}

// clear cookies them and logout when refreshToken failed
function clearCookies() {
  const { loggedIn } = useLocalAuth();
  const { country } = useLocal();
  if (!loggedIn.value) return;
  useCookie("accessToken").value = null;
  useCookie("accessToken").value = null;
  useCookie("user").value = null;
  navigateTo(`/${country}`);
}
