<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    :max-width="mdAndDown ? '100%' : '700px'"
    :fullscreen="smAndDown"
    scrollable
    persistent
  >
    <v-card v-if="venue" class="venue-dialog-card">
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        class="dialog-close-btn"
        @click="$emit('update:modelValue', false)"
      ></v-btn>

      <v-carousel
        v-if="venue.images && venue.images.length > 0"
        :height="smAndDown ? 250 : 350"
        show-arrows="hover"
        hide-delimiter-background
        cycle
        :interval="5000"
      >
        <v-carousel-item
          v-for="(img, i) in venue.images"
          :key="i"
          :src="img"
          cover
        >
          <template v-slot:placeholder>
            <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
          </template>
        </v-carousel-item>
      </v-carousel>
      
      <v-img
        v-else
        :src="venue.image || 'https://via.placeholder.com/700x350?text=No+Image'"
        :height="smAndDown ? 250 : 350"
        cover
      ></v-img>

      <v-card-text class="pa-5">
        <h2 class="text-h5 font-weight-bold mb-2">{{ venue.name }}</h2>

        <div class="d-flex align-center mb-4" v-if="venue.rating">
          <v-rating
            :model-value="venue.rating"
            color="amber"
            density="compact"
            half-increments
            readonly
            size="small"
          ></v-rating>
          <span class="font-weight-bold ml-2">{{ venue.rating }}</span>
          <span class="text-grey ml-1">({{ venue.reviewCount || 0 }} reviews)</span>
        </div>

        <v-chip color="primary" variant="tonal" class="mb-4" v-if="venue.type">
          <v-icon start size="small">mdi-tag</v-icon>
          {{ venue.type }}
        </v-chip>

        <v-row class="mb-4">
          <v-col cols="12">
            <div class="d-flex align-start">
              <v-icon color="primary" class="mr-3 mt-1">mdi-map-marker</v-icon>
              <div>
                <p class="text-caption text-grey mb-1">Address</p>
                <p class="text-body-1">{{ venue.address }}</p>
              </div>
            </div>
          </v-col>

          <v-col cols="6" v-if="venue.capacity">
            <div class="d-flex align-start">
              <v-icon color="primary" class="mr-3 mt-1">mdi-account-group</v-icon>
              <div>
                <p class="text-caption text-grey mb-1">Capacity</p>
                <p class="text-body-1 font-weight-medium">Up to {{ venue.capacity }} guests</p>
              </div>
            </div>
          </v-col>

          <v-col cols="6" v-if="venue.price">
            <div class="d-flex align-start">
              <v-icon color="success" class="mr-3 mt-1">mdi-cash</v-icon>
              <div>
                <p class="text-caption text-grey mb-1">Price</p>
                <p class="text-h6 font-weight-bold text-success">
                  ₱{{ venue.price.toLocaleString() }}
                  <span class="text-body-2 font-weight-regular text-grey">/ hour</span>
                </p>
              </div>
            </div>
          </v-col>
        </v-row>

        <div v-if="venue.amenities && venue.amenities.length > 0" class="mb-4">
          <p class="text-subtitle-2 font-weight-bold mb-3">
            <v-icon size="small" class="mr-1">mdi-check-circle</v-icon> Amenities
          </p>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="amenity in venue.amenities"
              :key="amenity"
              size="small"
              variant="outlined"
              color="primary"
            >
              {{ amenity }}
            </v-chip>
          </div>
        </div>

        <div v-if="venue.description" class="mb-4">
          <p class="text-subtitle-2 font-weight-bold mb-2">
            <v-icon size="small" class="mr-1">mdi-information</v-icon> About this venue
          </p>
          <p class="text-body-2 text-grey-darken-1">{{ venue.description }}</p>
        </div>

        <v-alert
          v-if="checkInDate && checkOutDate"
          type="info"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          <div class="d-flex align-center justify-space-between flex-wrap">
            <div><strong>Check-in:</strong> {{ checkInDate }} at {{ checkInTime }}</div>
            <div><strong>Check-out:</strong> {{ checkOutDate }} at {{ checkOutTime }}</div>
          </div>
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-5 pt-0">
        <v-row>
          <v-col cols="12">
            <v-btn
              color="primary"
              variant="flat"
              block
              size="large"
              class="mb-3"
              @click="$emit('book', venue)"
            >
              <v-icon start>mdi-calendar-check</v-icon> Book This Venue
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn variant="outlined" block @click="$emit('directions', venue)">
              <v-icon start>mdi-directions</v-icon> Directions
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn variant="outlined" block @click="$emit('share', venue)">
              <v-icon start>mdi-share-variant</v-icon> Share
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
import type { Venue } from "~/composables/useVenueMapLogic";

const props = defineProps<{
  modelValue: boolean;
  venue: Venue | null;
  checkInDate?: string;
  checkOutDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
}>();

const emit = defineEmits(["update:modelValue", "book", "directions", "share"]);
const { mdAndDown, smAndDown } = useDisplay();
</script>

<style scoped>
.venue-dialog-card {
  position: relative;
  border-radius: 16px !important;
  overflow: hidden;
}

.dialog-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.5) !important;
  color: white !important;
  backdrop-filter: blur(4px);
}

.venue-dialog-card :deep(.v-carousel__controls) {
  background: transparent;
}

.venue-dialog-card :deep(.v-carousel__controls__item) {
  color: white;
}
.gap-2 {
  gap: 8px;
}
</style>