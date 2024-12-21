<template>
  <v-container class="my-5">
    <AddVenueFormTemplateSheet>
      <v-row class="pa-5 d-flex ga-5">
        <CardSpace
          v-for="x in venue.venue_spaces"
          :key="venue.name"
          :card-data="{
            name: x.name,
            imageUrl: 'https://placehold.co/276x220',
            status: x.status,
          }"
          @click-card="emit('click-card', x._id)"
          @delete-space="emit('delete-space', x._id)"
        />
        <CardSpace add-function-card @click="$emit('add-space')" />
        <v-text-field v-model="venue.venue_spaces" class="d-none" />
      </v-row>
    </AddVenueFormTemplateSheet>
  </v-container>
</template>

<script setup lang="ts">
const { venueId } = useRoute().params;
const { countries } = useVenueData();

const venue = defineModel<TVenue>({ required: true });

const emit = defineEmits<{
  (e: "add-space"): void;
  (e: "delete-space", value?: any): void;
  (e: "click-card", value?: any): void;
  (e: "save-draft"): void;
}>();
</script>

<style scoped></style>
