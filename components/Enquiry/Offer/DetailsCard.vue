<template>
  <v-card width="100%" flat rounded="lg" border="secondary sm" class="pa-7 text-secondary">
    <v-row no-gutters class="w-100">
      <ReviewSpaceDetails :enquiry="enquiry" :space="enquiry?.space" :max-letters-truncate="30"/>
    </v-row>
    <v-divider v-if="!showSpaceDetailsOnly" class="my-5"></v-divider>
    <v-row v-if="!showSpaceDetailsOnly" no-gutters class="w-100 text-16px d-flex flex-column ga-3">
      <v-col cols="12" class="d-flex ga-5 flex-wrap justify-space-between align-start">
        <span>Date</span>
        <span>{{ computedOffer?.date || offer?.date?.date }}</span>
      </v-col>
      <v-col cols="12" class="d-flex ga-5 flex-wrap justify-space-between align-start">
        <span>Check-in</span>
        <span>{{ convertTimeToAMPM(computedOffer?.from || offer?.date?.from as string) }}</span>
      </v-col>
      <v-col cols="12" class="d-flex ga-5 flex-wrap justify-space-between align-start">
        <span>Check-out</span>
        <span>{{ convertTimeToAMPM(computedOffer?.to || offer?.date?.to as string) }}</span>
      </v-col>
      <v-col cols="12" class="d-flex ga-5 flex-wrap justify-space-between align-start">
        <span>Guests</span>
        <span>{{ computedOffer?.guests || offer?.guests  }}</span>
      </v-col>
     
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
const { convertTimeToAMPM, longDateFormat, timeStampDate } = useUtils();

defineProps<{
  enquiry: TEnquiry;
  computedOffer?: TComputedOffer;
  offer?: TOffer;
  customerFullName: string;
  closeButton?: boolean;
  showSpaceDetailsOnly?: boolean;
}>();

const emit = defineEmits(["close-dialog", "go-to-space"]);
</script>

<style scoped></style>
