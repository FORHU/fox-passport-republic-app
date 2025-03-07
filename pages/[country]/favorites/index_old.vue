<template>
  <v-skeleton-loader type="card" v-if="loader"></v-skeleton-loader>
  <v-row
    no-gutters
    class="py-8 px-15 bg-primaryBG"
    justify="center"
    style="height: 100%"
    v-else
  >
    <v-col cols="12" xxl="11" xl="10" lg="10">
      <v-row no-gutters>
        <v-col
          cols="12"
          class="font-weight-bold text-h4 text-capitalize"
          :class="mobile ? 'text-center' : ''"
        >
          favorites
        </v-col>
        <CardEmptyState v-if="spaceArray.length == 0" :showButton="false" />
        <v-col
          cols="12"
          class="mt-6"
          v-for="(space, index) in spaceArray"
          :key="index"
          v-else
        >
          <v-card
            variant="elevated"
            class="rounded-lg"
            elevation="5"
            height="100%"
            width="100%"
          >
            <div class="close-icon-container">
              <v-icon
                @click="handleFavorite(space)"
                :color="xs ? 'white' : 'black'"
                >mdi-close</v-icon
              >
            </div>
            <v-row no-gutters>
              <v-col cols="12" xs="12" sm="4" md="4" lg="4" xl="4" xxl="4">
                <NuxtLink
                  class="text-decoration-none"
                  :to="{
                    name: 'country-venues-venue',
                    params: { country: country, venue: space._id },
                  }"
                  target="_blank"
                >
                  <v-img
                    :src="getImage(space.space_photo)"
                    cover
                    :height="sm ? '100%' : '212'"
                    class="rounded-lg"
                    alt="Space featured image"
                  ></v-img>
                </NuxtLink>
              </v-col>
              <v-col cols="12" xs="12" sm="6" md="6" lg="6" xl="6" xxl="6">
                <NuxtLink
                  class="text-decoration-none text-black"
                  :to="{
                    name: 'country-venues-venue',
                    params: { country: country, venue: space._id },
                  }"
                  target="_blank"
                >
                  <v-row no-gutters class="px-5" :class="!xs ? 'py-8' : 'py-3'">
                    <v-col
                      cols="12"
                      :class="mobile ? 'd-flex justify-center' : ''"
                    >
                      <v-icon class="mr-2" color="primary"
                        >mdi-compass-rose</v-icon
                      >
                      <span class="font-weight-bold text-primary">
                        {{ space.name + " at " + space.venue.name }}</span
                      >
                    </v-col>
                    <v-col
                      cols="12"
                      :class="mobile ? 'd-flex justify-center' : ''"
                    >
                      <span
                        class="text-caption text-primary ml-8"
                        :class="mobile ? 'd-flex justify-center' : ''"
                        >{{ formatAddress(space.venue.address) }}</span
                      >
                    </v-col>
                    <v-col
                      cols="12"
                      v-if="
                        space.capacity_layout.find(
                          (layout: any) =>
                            layout.question === 'Seating' &&
                            layout.answer === true,
                        )
                      "
                    >
                      <v-icon class="mr-1 ml-8" color="primary" size="x-small"
                        >mdi-seat-passenger</v-icon
                      >
                      <span class="text-caption"
                        >{{
                          space.capacity_layout.filter(
                            (layout: any) =>
                              layout.question === "Seating" &&
                              layout.answer === true,
                          )[0].max_capacity
                        }}
                        seats</span
                      >
                    </v-col>
                    <v-col
                      cols="12"
                      v-if="
                        space.capacity_layout.find(
                          (layout: any) =>
                            layout.question === 'Standing' &&
                            layout.answer === true,
                        )
                      "
                    >
                      <v-icon class="mr-1 ml-8" color="primary" size="x-small"
                        >mdi-human-male-male</v-icon
                      >
                      <span class="text-caption"
                        >{{
                          space.capacity_layout.filter(
                            (layout: any) =>
                              layout.question === "Standing" &&
                              layout.answer === true,
                          )[0].max_capacity
                        }}
                        standing</span
                      >
                    </v-col>
                    <v-col cols="12">
                      <v-icon
                        class="mr-1 ml-8"
                        color="primary"
                        size="x-small"
                        >{{
                          space.venue?.foods_and_beverages?.filter(
                            (food) =>
                              food.question ===
                              "The venue exclusively collaborates with an approved roster of external caterers",
                          )[0]?.answer
                            ? "mdi-food-outline"
                            : "mdi-food-off-outline"
                        }}</v-icon
                      >
                      <span class="text-caption">{{
                        space.venue?.foods_and_beverages?.filter(
                          (food) =>
                            food.question ===
                            "The venue exclusively collaborates with an approved roster of external caterers",
                        )[0]?.answer
                          ? "External catering allowed"
                          : "External catering not allowed"
                      }}</span>
                    </v-col>
                    <v-col cols="12">
                      <v-icon
                        class="mr-1 ml-8"
                        color="primary"
                        size="x-small"
                        >{{
                          space.venue?.foods_and_beverages?.filter(
                            (food) =>
                              food.question ===
                              "The venue offers in-house catering services",
                          )[0]?.answer
                            ? "mdi-food-variant"
                            : "mdi-food-variant-off"
                        }}</v-icon
                      >
                      <span class="text-caption">{{
                        space.venue?.foods_and_beverages?.filter(
                          (food) =>
                            food.question ===
                            "The venue offers in-house catering services",
                        )[0]?.answer
                          ? "Venue offers catering"
                          : "Venue doesn't offers catering"
                      }}</span>
                    </v-col>
                  </v-row>
                </NuxtLink>
              </v-col>
              <v-col cols="12" xs="12" sm="2" md="2" lg="2" xl="2" xxl="2">
                <v-row no-gutters class="px-4" :class="!xs ? 'py-6' : 'py-2'">
                  <v-col
                    cols="12"
                    class="font-weight-bold text-caption d-flex mt-2"
                    :class="xs ? 'justify-center' : 'justify-end'"
                  >
                    <span>from: S${{ getRate(space, true) }}</span>
                  </v-col>
                  <v-col
                    cols="12"
                    class="text-caption d-flex"
                    :class="xs ? 'justify-center' : 'justify-end'"
                  >
                    <span
                      >{{
                        space.pricing.selected_pricing === "CUSTOM_PRICE"
                          ? "custom price"
                          : "hire fee"
                      }}
                      / {{ getRate(space, false) }}</span
                    >
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
import { useDisplay } from "vuetify";
const { mobile, xs, sm } = useDisplay();
const { country } = useLocal();
const { fetchVenues } = useVenue();
const { formatAddress } = useUtils();
const { setSnackbar } = useLocal();
const loader = ref(false);
const spaceArray = ref<TVenueSpace[]>([]);
const currentPage = ref(0);
const totalItems = ref(0);
const totalPages = ref(0);

const loadInitialData = async () => {
  const params = {
    mark_as_favorite: true,
    status: "PUBLISHED",
    limit: 10,
  };

  const { data }: { data: any } = await fetchVenues(params);
  if (data) {
    spaceArray.value = data.value.data.data;
    currentPage.value = data.value.data.current_page;
    totalItems.value = data.value.data.total_items;
    totalPages.value = data.value.data.total_pages;
  }
};

const getImage = (spaces: any) => {
  const images = spaces.filter((file: any) =>
    file.contentType.startsWith("image/"),
  );
  return images.length ? images[0].path : "/images/venue/sample_venue.jpg";
};

const getRate = (venue: any, option: boolean) => {
  const pricing = venue.pricing;
  const selectedPricing = venue.pricing.selected_pricing;
  let hourly = false;
  let duration = "";
  let lowestRate = Infinity;
  if (selectedPricing === "HIRE_FEE") {
    pricing.hire_fee.days.forEach((day) => {
      if (day.slots.rate < lowestRate) {
        hourly = day.hourlyCheckBox;
        lowestRate = hourly ? day.slots.rate : day.full_day_rate;
      }
    });
    if (option) {
      return lowestRate === Infinity ? null : lowestRate;
    } else {
      return hourly ? "per hour" : "per day";
    }
  } else {
    pricing.custom_price.prices.forEach((price) => {
      if (price.price < lowestRate) {
        lowestRate = price.price;
        duration = price.duration;
      }
    });
    if (option) {
      return lowestRate === Infinity ? null : lowestRate;
    } else {
      return duration.toLowerCase();
    }
  }
};

const handleFavorite = async (space: any) => {
  await useAPI(`/v1/favorite/${space.marked_as_favorite._id}`, {
    method: "PATCH",
    body: JSON.stringify({
      marked_as_favorite: false,
    }),
  });
  setSnackbar({
    color: "success",
    text: "Removed from your favorites list",
    modal: true,
  });

  await loadInitialData();
};

onMounted(async () => {
  loader.value = true;
  await loadInitialData();
  loader.value = false;
});
</script>
<style scoped>
.close-icon-container {
  position: absolute;
  right: 8px;
  top: 4px;
  z-index: 10;
}
</style>
