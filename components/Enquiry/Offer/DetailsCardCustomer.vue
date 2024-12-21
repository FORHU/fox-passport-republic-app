<template>
  <v-card
    elevation="5"
    class="pa-7 py-10"
    rounded="lg"
    style="position: relative"
  >
    <v-icon
      v-if="closeButton"
      icon="mdi-close"
      size="30"
      style="position: absolute; top: 2%; right: 2%; z-index: 5"
      class="cursor-pointer"
      @click="emit('close-dialog')"
    ></v-icon>
    <v-row no-gutters align="center">
      <v-col cols="2" class="mr-2 mr-md-5">
        <ProfileAvatar
          :first_name="enquiry?.venue?.user?.first_name"
          :last_name="enquiry?.venue?.user?.last_name"
          size="50px"
        />
      </v-col>
      <v-col>
        <v-row
          no-gutters
          class="text-h6 text-md-h5 font-weight-bold"
          style="line-height: 1.2"
          >{{
            customerFullName ||
            enquiry?.venue?.user?.first_name +
              " " +
              enquiry?.venue?.user?.last_name
          }}</v-row
        >
        <v-row
          no-gutters
          class="text-medium-disabled text-subtitle-2"
          style="line-height: 1.2; opacity: 60%"
          >{{ enquiry?.venue?.user?.email }}</v-row
        >
      </v-col>
    </v-row>
    <v-row no-gutters class="my-7">
      <v-row no-gutters>
        <v-col cols="12" class="text-subtitle-1 text-md-h6 font-weight-black"
          >Space</v-col
        >
        <v-col
          cols="12"
          class="text-subtitle-1 text-md-h6 font-weight-regular cursor-pointer"
          @click="emit('go-to-space')"
          ><span class="font-weight-bold cursor-pointer">{{
            enquiry?.space?.name || ""
          }}</span>
          at
          <span class="">{{ enquiry?.venue?.name }}</span></v-col
        >
      </v-row>

      <v-row no-gutters v-if="!showSpaceDetailsOnly">
        <v-col
          cols="12"
          class="text-subtitle-1 text-md-h6 font-weight-black mt-5"
          >Event Details</v-col
        >
        <v-col cols="12" class="text-subtitle-1 font-weight-normal"
          ><v-icon
            icon="mdi-account-multiple-outline"
            class="mr-3"
            size="20"
          ></v-icon
          >{{ enquiry?.type || "" }}
          for
          {{ offer?.guests || 0 }} guests</v-col
        >

        <v-col
          cols="12"
          class="font-weight-regular text-subtitle-1"
          justify="center"
          ><v-icon
            icon="mdi-calendar-blank-outline"
            class="mr-3"
            size="20"
          ></v-icon>
          {{ longDateFormat(offer?.date?.date) }} at {{ offer?.date?.from }} -
          {{ offer?.date?.to }}</v-col
        >
      </v-row>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
const { convertTimeToAMPM, longDateFormat, timeStampDate } = useUtils();

defineProps({
  enquiry: {
    type: Object as TEnquiry,
    required: true,
  },
  offer: {
    type: Object as any,
    required: true,
  },
  closeButton: {
    type: Boolean,
    required: false,
  },
  showSpaceDetailsOnly: {
    type: Boolean,
    required: false,
  },
});

const emit = defineEmits(["close-dialog", "go-to-space"]);
</script>

<style scoped></style>
