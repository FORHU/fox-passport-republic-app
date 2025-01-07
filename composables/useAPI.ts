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
  let retry = 0;

  const defaults: UseFetchOptions<T> = {
    baseURL: "/api",
    key: url,
    headers: loggedIn.value ? { Authorization: `Bearer ${accessToken}` } : {},
    async onResponseError({ response }) {
      if (response.status === 401 && retry == 0) {
        retry += 1;
        const refreshToken = useCookie("refreshToken", cookieOptions).value;
        try {
          const { data, status } = await useFetch("/api/v1/auth/refresh-token", {
            method: "POST",
            body: { refreshToken: refreshToken },
            async onResponseError({ response }) { 
              const code = response?.status
              if(code == 403){
                clearCookies();
              }
           }
          });
          const res = data?.value as any;
          const newAccessToken = res?.data?.accessToken;
          if(newAccessToken){
            useCookie("accessToken", cookieOptions).value = newAccessToken;
            const params = defu(
              {
                ...options,
                headers: { Authorization: `Bearer ${newAccessToken}` },
              },
              defaults,
            );
            return useFetch(url, params);
          } else {
            throw new Error("Failed to refresh token log");
          }

        } catch (error: any) {
          console.error("Failed to refresh token:", error);
        }
      } else if (response.status == 403){
        clearCookies();
      }
    },
  };

  const params = defu(options, defaults);

  return useFetch(url, params);
}

// clear cookies them and logout when refreshToken failed
function clearCookies() {
  const { country } = useLocal();
  const { clearCookies } = useLocalAuth();
  const loggedIn = useCookie("user").value
  if (!loggedIn) return;
  clearCookies();
  console.log('cookies cleared');
  navigateTo(`/${country}`);
}
