<template>
  <v-skeleton-loader type="card" v-if="loader"></v-skeleton-loader>
  <div v-else>
    <div class="pa-4 ml-10">
      <v-btn
        variant="text"
        color="primary"
        @click="$router.go(-1)"
        prepend-icon="mdi-less-than"
        >Back</v-btn
      >
    </div>
    <v-row no-gutters class="pa-4" justify="center">
      <v-col md="7" sm="0">
        <!-- <template v-for="n in 5" :key="n"> -->
        <template v-for="n in 1" :key="n">
          <v-col>
            <div v-for="(item, i) in specificVenue.space_photo" :key="i">
              <v-img
                @click="
                  (overlay = true), loadImages(specificVenue.space_photo, i)
                "
                class="cursor-pointer"
                :src="specificVenue.space_photo[i].path"
                width="100%"
                cover
                :alt="'Space Photos - ' + i"
              ></v-img>
              <br />
            </div>
          </v-col>
          <v-row class="pa-3">
            <v-col>
              <div v-for="(item, i) in specificVenue.venue_photo" :key="i">
                <v-img
                  @click="
                    (overlay = true), loadImages(specificVenue.venue_photo, i)
                  "
                  class="cursor-pointer"
                  :src="specificVenue.venue_photo[i].path"
                  width="100%"
                  cover
                  :alt="'Space Photos - ' + i"
                ></v-img>
                <br />
              </div>
            </v-col>
            <!-- <v-col>
            <v-img
              @click="overlay = true"
              class="cursor-pointer"
              :src="specificVenue.venue_photo[0].path"
              width="100%"
              cover
            ></v-img>
          </v-col> -->
          </v-row>
        </template>
      </v-col>
    </v-row>
    <v-dialog v-model="overlay" width="800px">
      <v-card max-width="800">
        <v-carousel v-model="carouselItem">
          <v-carousel-item
            v-for="(item, n) in overlayImagesArr"
            :key="n"
            :src="overlayImagesArr[n].path"
            cover
          ></v-carousel-item>
        </v-carousel>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
const overlay = ref(false);
const loader = ref(false);
const { venue, country } = useRoute().params;
const specificVenue = ref({});
const overlayImagesArr = ref([]);
let carouselItem = ref("");
async function loadVenueData() {
  try {
    const params = {
      space_id: venue,
    };
    const queryString = new URLSearchParams(params).toString();
    const { data, error } = await useAPI(`v1/space/?${queryString}`, {
      method: "GET",
    });
    if (data) {
      specificVenue.value = data.value.data.data[0];
      console.log(specificVenue.value);
    }
  } catch (error) {
    console.log(error);
    return { data: null, error };
  }
}
async function loadImages(photo, val) {
  overlayImagesArr.value = [];
  overlayImagesArr.value = photo;
  carouselItem.value = val;
}
onBeforeMount(async () => {
  loader.value = true;
  await loadVenueData();
  loader.value = false;
});
</script>
