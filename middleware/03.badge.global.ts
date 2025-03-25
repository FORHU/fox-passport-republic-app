export default defineNuxtRouteMiddleware(async (to, from) => {
    const { computeBadgeCount } = useNotification();
    const { loggedIn } = useLocalAuth();

   if(loggedIn.value && import.meta.client){
     computeBadgeCount()
   }

})
