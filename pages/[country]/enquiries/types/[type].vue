<template>
  <v-row class="pa-4" justify="center">
    <v-col cols="12" class="mt-10">
      <span class="text-h5 font-weight-bold">Manage your enquiries here</span>
    </v-col>
    <v-col cols="12">
      <v-btn
        @click="selected('current')"
        :class="selectedType === 'current' ? 'bg-primary' : ''"
        class="rounded-lg"
        size="x-large"
        >Current (1)</v-btn
      >
      <v-btn
        @click="selected('past')"
        :class="selectedType === 'past' ? 'bg-primary' : ''"
        class="rounded-lg ml-5"
        size="x-large"
        >Past (1)</v-btn
      >
    </v-col>
    <v-col cols="12">
      <v-row>
        <v-col cols="12">
          <v-card
            class="py-6 px-3"
            variant="outlined"
            width="1070"
            height="111"
          >
            <v-row style="width: 1150px">
              <v-col cols="2">
                <v-img
                  src="https://picsum.photos/500/300?image=232"
                  height="70"
                  width="178"
                  cover
                  alt="Inquiry Type image alt"
                ></v-img>
              </v-col>
              <v-col cols="8">
                <v-row no-gutters>
                  <v-col cols="12">
                    <span class="text-subtitle-2 font-weight-bold"
                      >Event Space for 70 people</span
                    >
                  </v-col>
                  <v-col cols="12">
                    <span class="text-caption text-disabled"
                      >Entire Venue at Social Space</span
                    >
                  </v-col>
                  <v-col cols="12" class="d-flex flex-row">
                    <v-icon icon="mdi-calendar-blank" size="small"></v-icon>
                    <span class="text-caption text-disabled ml-2"
                      >Thursday, 30 May 2024 at 10:00 - 14:00</span
                    >
                  </v-col>
                </v-row>
              </v-col>
              <v-col
                cols="2"
                class="d-flex flex-column text-caption text-disabled justify-center"
              >
                <span class="ml-9 text-ongoing">Ongoing</span>
                <span>Today at 11:50</span>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="12" class="font-weight-bold">
      Browse your last searches
    </v-col>
    <v-col cols="12">
      <v-card
        class="rounded-lg bg-gradient d-flex justify-center align-end text-white"
        variant="text"
        height="364px"
        width="268px"
        image="https://brideandbreakfast.ph/wp-content/uploads/2020/06/Garden-Venue-Intimate-Wedding-04.jpg"
      >
        <div>
          <v-card-title class="text-center text-caption pb-0 font-weight-bold"
            >Event Space for 70 people</v-card-title
          >
          <v-card-text class="text-center text-caption mb-3"
            >Entire Venue at Social Space</v-card-text
          >
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const { country } = useLocal();
const selectedType = ref("current");
const pageRoute = "country-user-enquiries-types-type";

const types = [
  {
    title: "Current",
    value: 10,
    color: "transparent",
    to: pageRoute,
    params: { country, type: "current" },
  },
  {
    title: "Past",
    value: 1,
    color: "red",
    to: pageRoute,
    params: { country, type: "past" },
  },
];

function selected(value) {
  selectedType.value = value;
}
</script>
<style scoped>
.bg-gradient {
  opacity: 0.8;
}
</style>
