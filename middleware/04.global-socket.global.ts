export default defineNuxtRouteMiddleware(async (to, from) => {
    const { computeBadgeCount } = useNotification();
    const { loggedIn, currentUser, } = useLocalAuth();
    const { connect, removeAllListener} = useGlobalSocket();

   if(loggedIn.value && import.meta.client){
    await connect()
   } else {
    removeAllListener()
   }

})
