export default defineNuxtRouteMiddleware(async () => {
  if (process.server) return;
  const { loggedIn, getCurrentUser, currentUser, cookieOptions } = useLocalAuth();
  if (loggedIn.value) {
    const account: any = await getCurrentUser();
    currentUser.value = account;    
    useCookie('role-type', cookieOptions).value = currentUser.value?.role
  }
});
