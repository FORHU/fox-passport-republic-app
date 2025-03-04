<template>
  <v-row no-gutters class="fill-height" justify="center" align-content="center">
    <v-col cols="12">
      <span class="text-h5 text-teal-darken-4 font-weight-bold">
        ASIA POPULAR EVENT PLACES
      </span>
    </v-col>
    <v-col cols="12">
      <div class="spanBorder"></div>
      <div class="mt-3">
        <span class="text-h6 font-weight-bold">
          Lorem Ipsum dolor sit omet
        </span>
      </div>
    </v-col>
    <v-col cols="3" v-for="(data, index) in spaces" :key="index">
      <v-card class="mx-auto rounded-xl mr-5" max-width="264">
        <v-img
          :src="data.imageLink"
          height="338"
          class="align-end text-white"
          cover
          alt="Event Listing Image"
        >
          <v-card-title>{{ data.name }}</v-card-title>
          <v-row class="ml-1">
            <v-col cols="2">
              <v-avatar size="40">
                <v-img :src="data.avatar" aspect-ratio="1" alt="Avatar Image"></v-img>
              </v-avatar>
            </v-col>
            <v-col cols="10">
              <p class="text-h6">{{ data.place }}</p>
            </v-col>
          </v-row>
        </v-img>
      </v-card>
    </v-col>
  </v-row>
</template>
<script setup>
import eventplace from "/images/event-listing/sample-event.png";
import avatar from "/images/event-listing/avatar.png";
const spaces = ref([
  {
    name: "OnlyUSpace",
    avatar: avatar,
    imageLink: eventplace,
    place: "International Plaza Singapore",
  },
  {
    name: "OnlyUSpace",
    avatar: avatar,
    imageLink: eventplace,
    place: "International Plaza Singapore",
  },
  {
    name: "OnlyUSpace",
    avatar: avatar,
    imageLink: eventplace,
    place: "International Plaza Singapore",
  },
  {
    name: "OnlyUSpace",
    avatar: avatar,
    imageLink: eventplace,
    place: "International Plaza Singapore",
  },
]);
</script>
<style scoped>
.spanBorder {
  border-top: 5px solid #315545 !important;
  width: 270px;
}
</style>
