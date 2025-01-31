<template>
  <GoogleMap
    :api-key="config.public.GOOGLE_API"
    style="width: 100%; height: 100%"
    :center="props.showDetails ? showCenter : props.coordinates[0]"
    :zoom="checkZoom"
    :draggable="!props.showDetails ? false : true"
  >
    <Marker
      v-for="(coordinate, index) in props.coordinates"
      :key="index"
      :options="{ position: coordinate }"
      @click="selectMarker(index, coordinate)"
    >
    </Marker>
  </GoogleMap>
  <v-icon v-if="props.mobile" class="close-icon" @click="emit('closeMap')">
    mdi-close
  </v-icon>
</template>

<script setup lang="ts">
import { GoogleMap, Marker, InfoWindow } from "vue3-google-map";
import countryCoordinates from "~/data/country-coordinates.json";

interface Coordinate {
  lat: number;
  lng: number;
  title: string;
  photo: string;
}

const props = defineProps<{
  country: string;
  coordinates: Coordinate[];
  showDetails: boolean;
  mobile?: boolean;
}>();
const config = useRuntimeConfig();

const emit = defineEmits(["closeMap", "marker-selected"]);

const selectedMarker = ref<number | null>(null);

const selectMarker = (index: number, coordinate: Coordinate) => {
  selectedMarker.value = index;
  emit("marker-selected", coordinate);
};

const checkZoom = computed(() => {
  if (!props.showDetails) return 15;
  if (props.country == "SG") return 10;
  return 7;
});

const showCenter = computed(() => {
  const obj = countryCoordinates.find((x: any) => x.alpha2 == props.country);
  if (obj) {
    return { lat: obj?.latitude, lng: obj.longitude };
  } else {
    return { lat: 0, lng: 0 };
  }
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
