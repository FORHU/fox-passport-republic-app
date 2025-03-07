<template>
  <v-row no-gutters>
    <v-col cols="12" class="mb-5">
      <span class="text-h6 font-weight-bold">Outside The City Specials</span>
    </v-col>
    <v-divider></v-divider>
    <v-col cols="12" class="mt-4 d-flex justify-space-between">
      <v-chip
        color="primary"
        variant="flat"
        class="text-uppercase font-weight-medium"
      >
        water activities
      </v-chip>
      <div class="d-flex flex-row align-center justify-center">
        <v-img
          class="ml-1"
          src="/images/venue/suggested/left-arrow.svg"
          max-width="50"
          height="50"
          contain
          alt="Suggested Left Arrow Icon"
        >
          <v-btn class="ms-2" variant="text"></v-btn>
        </v-img>
        <v-img
          class="ml-1"
          src="/images/venue/suggested/right-arrow.svg"
          max-width="50"
          height="50"
          contain
           alt="Suggested Right Arrow Icon"
        >
          <v-btn class="ms-2" variant="text"></v-btn>
        </v-img>
      </div>
    </v-col>
    <template v-for="n in 4" :key="n">
      <v-col cols="3">
        <v-card class="px-3" rounded="0" height="380px" width="270">
          <v-img
            src="https://picsum.photos/500/300?image=232"
            min-width="250"
            height="165"
            contain
            alt="Image of a dummy"
          ></v-img>
          <p class="text-h7">Alaska: Westminster to Greenwich River Thames</p>
          <div class="d-flex flex-column ga-1 mb-2">
            <span
              ><v-icon icon="mdi-clock" size="small"></v-icon> Duration 2 hours
            </span>
            <span
              ><v-icon icon="mdi-car-hatchback" size="small"></v-icon> Transport
              Facility</span
            >
            <span
              ><v-icon icon="mdi-account-multiple" size="small"></v-icon> Family
              Plan
            </span>
          </div>
          <v-divider></v-divider>
          <v-row no-gutters class="d-flex justify-space-between">
            <v-col cols="5" class="text-start mt-1">
              <span class="text-green text-h5 font-weight-bold">$35.00</span>
              <p class="text-caption">per person</p>
            </v-col>
            <v-col cols="7" class="text-end">
              <v-rating
                model-value="4"
                active-color="rate"
                size="x-small"
                readonly
              ></v-rating>
              <p class="text-caption">(584 reviews)</p>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </template>
  </v-row>
</template>
