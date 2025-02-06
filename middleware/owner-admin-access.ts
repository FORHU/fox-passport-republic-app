export default defineNuxtRouteMiddleware(async () => {
    const { currentUser } = useLocalAuth();
    const route = useRoute();
    const role = useCookie('role-type').value
    const allowed = role == 'VENUE_OWNER' || role == 'VENUE_LISTER' || role == 'ADMIN';
    
    if (role && !allowed) {
      console.log('owner-admin-access middle ware executed!');
      return navigateTo(`/${route.params.country}`);
    }
  });
  