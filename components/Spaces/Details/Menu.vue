<template>
  <v-container>
    <v-row>
      <v-col v-if="primaryImage" cols="12" md="6">
        <v-img
          :src="primaryImage.path"
          :alt="primaryImage.description"
          height="200"
          cover
          @click="openCarousel(0)"
          class="clickable-image"
        ></v-img>
      </v-col>

      <v-col
        v-for="(image, index) in otherImages"
        :key="image._id"
        cols="12"
        sm="6"
      >
        <v-img
          :src="image.path"
          :alt="'Floor Plan Image -' + image.description"
          height="200"
          cover
          @click="openCarousel(index + 1)"
          class="clickable-image"
        ></v-img>
      </v-col>
    </v-row>

    <v-btn
      v-if="images.length > 3"
      block
      class="mt-2"
      variant="outlined"
      @click="openCarousel(0)"
    >
      <v-icon left>mdi-grid</v-icon>
      See All Menu
    </v-btn>
  </v-container>

  <CarouselImageViewer
    v-model:show="showCarousel"
    v-model:images="images"
    :activeImageId="images[selectedIndex]?._id"
    :showExtraButtons="false"
    :showDownloadButton="true"
  />
</template>

<script setup lang="ts">
interface FloorPlanImage {
  _id: string;
  filename: string;
  path: string;
  description: string;
}

const props = defineProps<{
  specificSpace?: {
    floor_plan?: string[] | FloorPlanImage[];
  };
}>();

const images = computed<FloorPlanImage[]>(() => {
  if (!props.specificSpace?.menu_photo) return [];
  if (!Array.isArray(props.specificSpace.menu_photo)) return [];
  return (props.specificSpace.menu_photo as FloorPlanImage[]).filter(
    (img) => img.path
  );
});

const primaryImage = computed(() => images.value.length >= 3 ? images.value[0] : null);
const otherImages = computed(() => {
 return images.value.length >= 3 ? images.value.slice(1, 3) : images.value
});

const showCarousel = ref(false);
const selectedIndex = ref(0);

const openCarousel = (index: number) => {
  selectedIndex.value = index;
  showCarousel.value = true;
};
</script>

<style scoped>
.clickable-image {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.clickable-image:hover {
  transform: scale(1.05);
}

.v-btn {
  text-transform: none;
  font-weight: 600;
}
</style>
