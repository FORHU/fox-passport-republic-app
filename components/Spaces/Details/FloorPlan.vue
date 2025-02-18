<template>
    <v-container v-if="primaryImage">
      <v-row>
        <v-col cols="12" md="6">
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
            :alt="image.description"
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
        See All Floor Plans
      </v-btn>
    </v-container>
  
    <v-container v-else>
      <v-alert type="warning">No floor plans available for this space.</v-alert>
    </v-container>
  
    <v-dialog v-model="showCarousel" max-width="800px">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>Floor Plans</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="showCarousel = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
  
        <v-carousel v-model="selectedIndex" hide-delimiter-background>
          <v-carousel-item
            v-for="(image, index) in images"
            :key="index"
            class="d-flex justify-center align-center"
          >
            <v-img
              :src="image.path"
              :alt="image.description"
              height="100%"
            ></v-img>
          </v-carousel-item>
        </v-carousel>
      </v-card>
    </v-dialog>
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
    if (!props.specificSpace?.floor_plan) return [];
    if (!Array.isArray(props.specificSpace.floor_plan)) return [];
    return (props.specificSpace.floor_plan as FloorPlanImage[]).filter(
      (img) => img.path
    );
  });
  
  const primaryImage = computed(() => images.value[0] || null);
  const otherImages = computed(() => images.value.slice(1, 3));
  
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
  