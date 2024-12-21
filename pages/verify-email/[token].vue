<template></template>

<script setup lang="ts">

definePageMeta({
  layout: 'venue-management-new'
})

const { setSnackbar } = useLocal();
const { country } = useLocal();
const { role } = useRoute().query;
const { token } = useRoute().params;
const { verifyEmailToken } = useVerify();
try {
  const res: any = await verifyEmailToken(token as string)
  if (res && res.message == 'EMAIL_VERIFIED_SUCCESSFULLY') {
    setSnackbar({
      modal: true,
      text: "Email verified successfully!",
      color: "success",
    });
    if (role === "VENUE_OWNER") {
      navigateTo({ name: "country-login-venue", params: { country: country || 'sg' } });
    } else {
      navigateTo({ name: "country-login-user", params: { country: country || 'sg' } });
    }
  }

} catch (err: any) {
  console.log(err.code);
  const code = err?.code

  if (code == 'ERROR_EMAIL_VERIFICATION_FAILED') {
    setSnackbar({
      modal: true,
      text: "Invalid Token.",
      color: "error",
    });
  } else if (code == 'EMAIL_ALREADY_VERIFIED') {
    setSnackbar({
      modal: true,
      text: "Email already verified.",
      color: "info",
    });
    if (role === "VENUE_OWNER") {
      navigateTo({ name: "country-login-venue", params: { country: country || 'sg' } });
    } else {
      navigateTo({ name: "country-login-user", params: { country: country || 'sg' } });
    }
  } else {
    setSnackbar({
      modal: true,
      text: "Something went wrong. Please try again later.",
      color: "error",
    });
  }
}
</script>
