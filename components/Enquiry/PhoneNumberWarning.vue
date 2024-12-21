<template>
  <!-- <v-tooltip v-model="showToolTip" location="end">
    <v-row no-gutters>
        <v-alert title="Always communicate through Venue4use" border="top" closable type="warning" variant="elevated"  prominent max-width="500px" :text="message" style="white-space: pre-wrap">
        </v-alert>
    </v-row>
</v-tooltip> -->

  <v-dialog v-model="showAlert" max-width="500">
    <v-alert
      density="compact"
      title=""
      type="warning"
      variant="elevated"
      border="start"
      closable
      @click:close="showAlert = false"
      max-width="500px"
      :text="message"
      border-color="warning"
      style="white-space: pre-wrap"
      class="bg-white pa-5"
    >
      <template v-slot:title>
        <v-row
          no-gutters
          class="font-weight-bold mb-5"
          style="line-height: 1.2"
        >
          Always communicate through Venue4use
        </v-row>
      </template>
    </v-alert>
  </v-dialog>
</template>

<script setup lang="ts">
const { currentUser } = useLocalAuth();
const showAlert = defineModel({ default: false });

const message = computed(() => {
  if (currentUser.value.role == "USER") {
    return "To maintain the integrity of our platform and ensure a secure and streamlined booking process, please refrain from sharing or requesting external contact numbers when communicating with venue owners. Keeping all discussions within the platform not only protects your privacy but also helps us maintain high standards of user experience and trust. If you need to discuss details over the phone, kindly initiate the conversation through our messaging system first. Thank you for your cooperation.";
  } else {
    return "Keeping enquiries on the platform and demonstrating excellent user experience is your way of showing us that your venue is suitable for the enquiries you aim to receive. \n\nUsing the platform to communicate with the customer, arranging viewings and finalizing bookings increases trust and makes you rank higher for the event types you are tag for. \n\nIf the customer prefers to communicate via phone call, they can display your phone number on their cabinet. After the phone call with the customer, please continue the conversation through the platform.";
  }
});
</script>

<style scoped>
.v-alert :deep(.v-icon) {
  color: orange !important;
}
</style>
