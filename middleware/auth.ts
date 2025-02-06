export default defineNuxtRouteMiddleware(async () => {
    const { loggedIn } = useLocalAuth();
    const route = useRoute();
    
    if (!loggedIn.value) {
      console.log('auth middle ware executed!');
      return navigateTo(`/${route.params.country}`);
    }

    
  });
  