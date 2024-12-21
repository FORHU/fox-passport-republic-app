export default function useLocalRoute() {
  const routes = computed(() => {
    const items = [
      {
        text: "Dashboard",
        name: "dashboard",
        icon: "mdi-view-dashboard",
      },
    ];
    return items;
  });

  const services = computed(() => {
    const config = useRuntimeConfig().public;
    return [
      {
        text: "Account",
        to: `${config.SERVICE_ACCOUNT}/dashboard`,
        icon: "mdi-account",
        is_current: true,
      },
      {
        text: "Feedback",
        to: `${config.SERVICE_FEEDBACK}/dashboard`,
        icon: "mdi-comment-account",
      },
      {
        text: "ANPR",
        to: `${config.SERVICE_ANPR}/dashboard`,
        icon: "mdi-badge-account",
      },
      {
        text: "Skyi",
        to: `${config.SERVICE_SKY_I}/dashboard`,
        icon: "mdi-camera-wireless",
      },
      {
        text: "E-Guard - Virtual Patrol",
        to: `${config.SERVICE_E_GUARD}/dashboard`,
        icon: "mdi-shield-account-outline",
      },
    ];
  });

  return {
    routes,
    services,
  };
}
