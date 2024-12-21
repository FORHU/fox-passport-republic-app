<template>
  <!-- ARCHIVE ENQUIRY DIALOG -->
  <v-dialog v-model="cancelBookingDialog" max-width="700">
    <template v-slot:default="{ isActive }">
      <v-card rounded="lg" class="pa-5">
        <v-card-title class="d-flex justify-space-between align-center">
          <div style="margin: auto" class="text-h5 text-center ps-2">
            Archive Enquiry
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="isActive.value = false"
          ></v-btn>
        </v-card-title>
        <v-card-text>
          <div class="mb-4">
            Your inquiry will be archived. This helps us keep track of your
            concerns and ensures we can refer back to it if needed, providing
            you with better support. Thank you for your understanding.
          </div>
          <div class="mb-1 font-weight-bold">
            Why are you archiving the enquiry?
          </div>
          <v-radio-group class="mt-3">
            <v-radio label="The client didn’t respond" value="one"></v-radio>
            <v-radio
              label="The client changed their mind"
              value="two"
            ></v-radio>
            <v-radio
              label="The space isn’t available on the selected date"
              value="three"
            ></v-radio>
            <v-radio
              label="Our Venue doesn’t host this type of event"
              value="four"
            ></v-radio>
            <v-radio label="Other" value="five"></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions class="my-2 d-flex justify-end">
          <v-btn
            class="text-none"
            text="CANCEL"
            @click="isActive.value = false"
            variant="outlined"
          ></v-btn>
          <v-btn
            class="text-none"
            color="red"
            text="ARCHIVE ENQUIRY"
            variant="flat"
            @click="isActive.value = false"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup>
const cancelBookingDialog = defineModel("review", { default: false });
</script>
