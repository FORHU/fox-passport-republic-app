<template></template>

<script setup lang="ts">
definePageMeta({
  layout: "venue-management-new",
});

const { setSnackbar } = useLocal();
const { country } = useLocal();
const { transfer_request } = useRoute().query as { transfer_request: string };
const { token } = useRoute().params;
const { existingVenueOwnerTransfer } = useVenue();
try {
  if (transfer_request) {
    const res: any = await existingVenueOwnerTransfer(token as string);
    if (res && res.message === "TRANSFER_SUCCESS") {
      setSnackbar({
        modal: true,
        text: "Venue Transferred Successfully!",
        color: "success",
      });
      navigateTo({
        name: "country",
        params: { country },
      });
    }
  }
} catch (err: any) {
  setSnackbar({
    modal: true,
    text: "Something went wrong. Please try again later.",
    color: "error",
  });
}
</script>
