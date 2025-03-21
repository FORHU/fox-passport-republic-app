<template>
  <v-row no-gutters>
    <!-- <v-col v-if="isUser" cols="12" md="6" lg="3">
    <EnquiryChatList />
  </v-col>
  <v-col v-else>
    <EnquiryListVenueOwner />
  </v-col> -->
    <v-col cols="12" md="6" lg="3">
      <EnquiryChatList />
    </v-col>
  </v-row>
  <DialogCompleteAccountDetails />
</template>

<script setup lang="ts">
const { enquiries } = useEnquiry();
const { country } = useLocal();
const { currentUser } = useLocalAuth();
import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp, lgAndUp } = useDisplay();

definePageMeta({
  layout: 'enquiry-chat-new'
})


const isUser = computed(() => {
  return currentUser.value?.role === 'USER';
})




//  go to Chat page on medium breakpoint
watchEffect(() => {
  // if (mdAndUp.value == true && isUser.value) {
  if (mdAndUp.value == true) {
    if (enquiries.value.length > 0 && enquiries.value[0] && enquiries.value[0]?._id) {
      navigateTo({
        name: "country-enquiries-message-id",
        params: { country, id: enquiries.value[0]?._id },
      });
    }
  }


})



</script>

<style scoped></style>