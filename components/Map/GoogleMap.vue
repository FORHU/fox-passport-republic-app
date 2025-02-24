<template>
  <GoogleMap
    :api-key="config.public.GOOGLE_API"
    style="width: 100%; height: 100%"
    :center="props.showDetails ? showCenter : props.coordinates[0]"
    :zoom="checkZoom"
    :draggable="props.showDetails"
  >
    <Marker
      v-for="(coordinate, index) in props.coordinates"
      :key="index"
      :options="{ position: coordinate }"
      @click="selectMarker(index, coordinate)"
    >
      <InfoWindow
        v-if="selectedMarker === index"
        @closeclick="selectedMarker = null"
      >
        <div class="bg-white rounded-xl" style="width: 350px">
          <div class="position-relative">
            <v-carousel
              hide-delimiter-background
              cycle
              :show-arrows="true"
              height="200"
              transition="fade-transition"
              class="rounded-xl"
            >
              <v-carousel-item
                v-for="(photo, photoIndex) in coordinate.photo || []"
                :key="photoIndex"
              >
                <img
                  :src="photo.path"
                  alt="Marker Photo"
                  style="width: 100%; height: auto; object-fit: cover"
                  class="rounded-xl"
                />
              </v-carousel-item>
            </v-carousel>
          </div>
          <div class="px-4 py-1 pb-4" @click="navigateToVenue(coordinate)">
            <h3>{{ coordinate.title }}, {{ props.country }}</h3>
            <p class="text-body-2 text-grey">{{ coordinate.location }}</p>
            <div class="d-flex align-center justify-space-between pt-2">
              <span
                class="bg-primary px-2 py-1 d-flex align-center justify-center rounded-lg text-caption"
              >
                <v-icon size="small" class="mr-1">mdi-star</v-icon>
                {{ coordinate.rating }}
              </span>
              <span class="d-flex align-center">
                <CardPricingChips :space="props.selectedSpace" />
              </span>
            </div>
          </div>
        </div>
      </InfoWindow>
    </Marker>
  </GoogleMap>

  <v-icon v-if="props.mobile" class="close-icon" @click="emit('closeMap')">
    mdi-close
  </v-icon>
</template>

<script setup lang="ts">
import { GoogleMap, Marker, InfoWindow } from "vue3-google-map";
import countryCoordinates from "~/data/country-coordinates.json";

const props = defineProps<{
  country: string;
  coordinates: {
    lat: number;
    lng: number;
    title: string;
    location?: string;
    rating?: number;
    photo?: { path: string }[];
    space?: any;
  }[];
  showDetails: boolean;
  selectedSpace: any;
  mobile?: boolean;
}>();

const router = useRouter();
const config = useRuntimeConfig();
const emit = defineEmits(["closeMap", "marker-selected"]);

const selectedMarker = ref<number | null>(null);

const selectMarker = (index: number, coordinate: any) => {
  selectedMarker.value = index;
  emit("marker-selected", coordinate);
};

const navigateToVenue = (coordinate: any) => {
  const url = router.resolve({
    name: "country-venues-venue",
    params: { country: props.country, venue: coordinate.id },
  }).href;

  router.push(url);
};

const checkZoom = computed(() => {
  if (!props.showDetails) return 15;
  return props.country === "SG" ? 10 : 7;
});

const showCenter = computed(() => {
  const location = countryCoordinates.find(
    (x: any) => x.alpha2 === props.country
  );
  return location
    ? { lat: location.latitude, lng: location.longitude }
    : { lat: 0, lng: 0 };
});
</script>

<style scoped>
.close-icon {
  position: absolute;
  top: 60px;
  right: 15px;
  cursor: pointer;
  z-index: 1001;
  font-size: 24px;
  color: black;
}
</style>
