<template></template>

<script setup lang="ts">
const { setSnackbar } = useLocal();
const { cookieOptions } = useLocalAuth();
const { country } = useLocal();

const { code } = useRoute().query;

try {
  const { data: googleData } = await useAPI(`/v1/auth/callback/google`, {
    method: "GET",
    query: {
      code: code,
    },
  });

  if (googleData) {
    const temp = googleData.value as any;
    useCookie("accessToken", cookieOptions).value = temp.data.accessToken;
    useCookie("refreshToken", cookieOptions).value = temp.data.refreshToken;
    useCookie("user", cookieOptions).value = temp.data.email;
    navigateTo({ name: "country", params: { country } });
  }
} catch (err) {
  // console.log('error', err)
  setSnackbar({
    modal: true,
    text: "Invalid Email.",
    color: "error",
  });
  navigateTo({ name: "country-login", params: { country } });
}
</script>

<style scoped></style>
