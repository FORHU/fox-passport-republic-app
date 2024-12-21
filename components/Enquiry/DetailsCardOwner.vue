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
      style="position: absolute; top: 2%; right: 2%; z-index: 22"
      class="cursor-pointer"
      @click="emit('close')"
    ></v-icon>

    <v-row no-gutters align="center">
      <v-col cols="2" class="mr-5 mr-lg-2">
        <ProfileAvatar
          :first_name="enquiry.user.first_name"
          :last_name="enquiry.user.last_name"
          :img-src="enquiry.user.profile_picture"
          size="50px"
        />
      </v-col>
      <v-col>
        <v-row
          no-gutters
          class="text-subtitle-1 text-lg-h5 font-weight-bold"
          style="line-height: 1.2"
          >{{
            customerFullName ||
            enquiry?.user?.first_name + " " + enquiry?.user?.last_name
          }}</v-row
        >
        <v-row
          no-gutters
          class="text-medium-disabled text-subtitle-2"
          style="line-height: 1.2; opacity: 60%"
          >{{ enquiry?.user.email }}</v-row
        >
      </v-col>
    </v-row>
    <v-row no-gutters class="d-flex flex-column ga-5 my-7">
      <v-col
        cols="12"
        class="text-subtitle-2 text-lg-subtitle-1 font-weight-black"
        >Event Details</v-col
      >
      <v-col
        cols="12"
        class="text-subtitle-2 text-lg-subtitle-1 font-weight-black"
        >{{ enquiry.type || "" }} for {{ enquiry.guests || 0 }} guests</v-col
      >
      <v-row no-gutters>
        <v-col
          cols="12"
          class="text-subtitle-2 text-lg-subtitle-1 font-weight-black"
          >Space</v-col
        >
        <v-col
          cols="12"
          class="text-subtitle-2 text-lg-subtitle-1 font-weight-regular"
          ><span
            class="font-weight-black cursor-pointer"
            @click="emit('go-to-space')"
            >{{ enquiry.space.name || "" }}</span
          >
          at <span class="">{{ enquiry.venue?.name }}</span></v-col
        >
      </v-row>
      <v-row no-gutters>
        <v-col
          cols="12"
          class="text-subtitle-2 text-lg-subtitle-1 font-weight-black"
          >Date and Time</v-col
        >
        <v-col
          cols="12"
          class="text-subtitle-2 text-lg-subtitle-1 font-weight-regular"
          >{{ longDateFormat(enquiry.date.date) }}
          at
          {{ convertTimeToAMPM(enquiry.date.from) }}-{{
            convertTimeToAMPM(enquiry.date.to)
          }}</v-col
        >
      </v-row>
      <v-row no-gutters v-if="enquiry.own_catering || enquiry.require_catering">
        <v-col
          cols="12"
          class="text-subtitle-2 text-lg-subtitle-1 font-weight-black"
          >Catering</v-col
        >
        <v-col
          v-if="enquiry.own_catering"
          cols="12"
          class="text-subtitle-2 text-lg-subtitle-1 font-weight-regular"
          >I want to bring my own catering</v-col
        >
        <v-col
          v-if="enquiry.require_catering"
          cols="12"
          class="text-subtitle-2 text-lg-subtitle-1 font-weight-regular"
        >
          <v-row no-gutters>I require catering</v-row>
          <v-row no-gutters class="text-subtitle-2">{{
            cateringOptionsList
          }}</v-row>
        </v-col>
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
  customerFullName: {
    type: String,
    required: true,
  },
  closeButton: {
    type: Boolean,
    required: false,
  },
});

const emit = defineEmits(["close", "go-to-space"]);
</script>

<style scoped></style>
