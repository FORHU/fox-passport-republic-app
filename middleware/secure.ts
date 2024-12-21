export default defineNuxtRouteMiddleware(async (from) => {
  if (process.server) return;
  const { loggedIn } = useLocalAuth();
  if (!loggedIn.value && from.path !== "/callback/google") {
    navigateTo({ name: "index" });
  }
});
