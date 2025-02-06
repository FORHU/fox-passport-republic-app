export default defineNuxtRouteMiddleware(async () => {
    const { currentUser } = useLocalAuth();
    const route = useRoute();
    const role = useCookie('role-type').value
    const allowed =  role == 'ADMIN';

      if (role && !allowed) {
        console.log('admin-only middle ware executed!');
        return navigateTo(`/${route.params.country}`);
      }
  });
  