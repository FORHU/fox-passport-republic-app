export default defineNuxtRouteMiddleware(async () => {
  if (process.server) return;
  const { loggedIn, getCurrentUser, currentUser } = useLocalAuth();
  if (loggedIn.value) {
    const account: any = await getCurrentUser();
    currentUser.value = account;
  }
});
