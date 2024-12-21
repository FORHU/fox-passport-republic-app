<template>
  <v-card
    elevation="5"
    class="pa-4 pa-lg-7 py-5 py-lg-10"
    rounded="lg"
    style="position: relative"
  >
    <v-row no-gutters justify="end">
      <v-icon
        v-if="closeButton"
        icon="mdi-close"
        size="30"
        class="cursor-pointer"
        @click="emit('close')"
      ></v-icon>
    </v-row>
    <v-row no-gutters>
      <v-col cols="12">
        <v-carousel hide-delimiters :height="lgAndUp ? '250px' : '180px'">
          <template v-for="x in spaceImageArray" :key="x">
            <v-carousel-item :src="x" cover rounded="lg"></v-carousel-item>
          </template>
        </v-carousel>
      </v-col>
    </v-row>
    <br />
    <v-row
      no-gutters
      class="font-weight-bold text-subtitle-1 text-lg-h6 cursor-pointer"
      style="line-height: 1.2"
      @click="emit('go-to-space')"
      >{{ enquiry.space?.name }}</v-row
    >
    <v-row
      no-gutters
      class="mb-2 font-weight-bold text-subtitle-2 text-lg-subtitle-1"
      style="line-height: 1.2"
      >at {{ enquiry.venue.name }}</v-row
    >
    <v-row no-gutters align="center" class="mt-5">
      <v-col cols="2" class="mr-3 mr-lg-7">
        <ProfileAvatar
          :first_name="enquiry.venue.user.first_name"
          :last_name="enquiry.venue.user.last_name"
          :img-src="enquiry.venue.user.profile_picture"
          size="50px"
        />
      </v-col>
      <v-col>
        <v-row
          no-gutters
          class="text-h6 text-lg-h5 font-weight-bold"
          style="line-height: 1.2"
          >{{ ownerFullName }}</v-row
        >
        <v-row
          no-gutters
          class="text-medium-disabled text-subtitle-2"
          align="center"
          style="line-height: 1.2; opacity: 60%"
          ><v-icon icon="mdi-phone" class="mr-2" size="15"></v-icon
          >{{ enquiry?.venue?.user?.phone_number
          }}<v-btn
            v-if="enquiry?.venue?.user?.phone_number.includes('*') && !isAdmin"
            variant="text"
            class="pa-0 px-2 ma-0"
            density="compact"
            color="secondary"
            @click="emit('show-number')"
            >Show
          </v-btn></v-row
        >
      </v-col>
    </v-row>
    <v-divider class="my-5"></v-divider>
    <v-row no-gutters class="d-flex flex-column ga-5 my-5">
      <v-col
        cols="12"
        class="text-subtitle-2 text-lg-subtitle-1 font-weight-black"
        >{{ enquiry.type }} for {{ enquiry.guests }} guests</v-col
      >

      <v-row no-gutters>
        <v-col
          cols="12"
          class="text-subtitle-2 text-lg-subtitle-1 font-weight-black"
          style="line-height: 1.2"
          >Date and Time</v-col
        >
        <!-- <v-col cols="12" class="text-subtitle-2">{{ formatDate(enquiry.date) }}</v-col> -->
        <v-col
          cols="12"
          class="text-subtitle-2 text-lg-subtitle-1 font-weight-regular"
          style="line-height: 1.2"
          >{{ longDateFormat(enquiry.date.date) }} at
          {{ convertTimeToAMPM(enquiry.date.from) }}-{{
            convertTimeToAMPM(enquiry.date.to)
          }}</v-col
        >
      </v-row>
      <v-divider class="my-2"></v-divider>

      <v-row no-gutters>
        <v-col cols="1">
          <v-icon>mdi-shield-alert</v-icon>
        </v-col>
        <v-col>
          <span style="font-size: 13px"
            ><span class="font-weight-bold"
              >Always communicate through Venue4use</span
            ><br />To protect your payment, never transfer money or communicate
            outside of the Venue4use website.</span
          >
        </v-col>
      </v-row>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { smAndUp, lgAndUp, mdAndDown } = useDisplay();
const { currentUser } = useLocalAuth();
const { convertTimeToAMPM, longDateFormat, timeStampDate } = useUtils();

const props = defineProps({
  enquiry: {
    type: Object as TEnquiry,
    required: true,
  },
  ownerFullName: {
    type: String,
    required: true,
  },
  closeButton: {
    type: Boolean,
    required: false,
  },
  space: {
    type: Object as TVenueSpace,
    required: false,
  },
});

const emit = defineEmits(["close", "show-number", "go-to-space"]);

const spaceImageArray = computed(() => {
  if (props.space.space_photo) {
    return props.space.space_photo.map((x: TVenueSpace) => x.path);
  } else {
    return [];
  }
});

const isAdmin = computed(() => {
  return currentUser.value?.role === "ADMIN";
});
</script>

<style scoped></style>
