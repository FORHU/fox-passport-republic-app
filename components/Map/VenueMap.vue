<template>
  <GoogleMap
    :api-key="config.public.GOOGLE_API"
    style="width: 100%; height: 400px"
    :center="mapData"
    :zoom="country === 'PH' ? 5 : 10"
  >
    <Marker :options="{ position: mapData }" />
    <!-- <Marker
      v-for="(coordinate, index) in props.coordinates"
      :key="index"
      :options="{ position: coordinate }"
      @click="selectMarker(index)"
    >
      <InfoWindow v-if="selectedMarker === index">
        <div class="d-flex flex-column align-center">
          <img
            :src="coordinate.photo"
            alt="Photo"
            style="width: 100px; height: auto"
          />
          <span class="text-center font-weight-bold mt-2">{{
            coordinate.title
          }}</span>
        </div>
      </InfoWindow>
    </Marker> -->
  </GoogleMap>
</template>

<script setup lang="ts">
import { GoogleMap, Marker, InfoWindow } from "vue3-google-map";

const props = defineProps<{
  country: string;
  coordinates: object[];
}>();
const config = useRuntimeConfig();

const selectedMarker = ref<number | null>(null);

const selectMarker = (index: number) => {
  selectedMarker.value = index;
};

const showCenter = computed(() => {
  if (props.country === "MY")
    return { lat: 3.6883498977076763, lng: 101.97322483862095 };
  if (props.country === "PH")
    return { lat: 12.565208981456458, lng: 122.7353274268776 };
  if (props.country === "SG")
    return { lat: 1.283210402144479, lng: 103.84207359115506 };
  return { lat: 0, lng: 0 };
});

const mapData = computed(() => {
  return {
    lat: parseFloat(props.coordinates.latitude),
    lng: parseFloat(props.coordinates.longitude),
  };
});
</script>
