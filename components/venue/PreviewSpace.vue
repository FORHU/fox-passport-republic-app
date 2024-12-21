<template>
  <v-dialog
    v-model="overlay"
    transition="dialog-bottom-transition"
    fullscreen
    scrollable
  >
    <v-row no-gutters>
      <v-toolbar class="bg-secondary" style="position: sticky; top: 2%">
        <v-toolbar-title class="text-h6 text-md-h5"
          >Preview Space</v-toolbar-title
        >

        <v-spacer></v-spacer>

        <v-toolbar-items>
          <v-btn
            text="Close"
            prepend-icon="mdi-close"
            variant="text"
            @click="overlay = false"
          ></v-btn>
        </v-toolbar-items>
      </v-toolbar>
    </v-row>
    <v-card class="pa-5" color="white">
      <v-row no-gutters justify="center">
        <v-form
          @submit.prevent
          :disabled="true"
          readonly
          no-gutters
          style="max-width: 1300px"
        >
          <PageTitle title="Details" class="py-15"  />
          <VenueFormSpaceDetails v-model="space" preview />
          <PageTitle title="Photos" class="py-15" />
          <VenueFormSpacePhotos v-model="space" preview />
          <PageTitle title="Capacity & Layout" class="py-15"  />
          <VenueFormSpaceCapacityAndLayouts v-model="space" preview />
          <PageTitle title="Features" class="py-15"  />
          <VenueFormSpaceFeatures v-model="space" preview />
          <PageTitle title="Keywords" class="py-15" />
          <VenueFormSpaceKeywords v-model="space" preview />
          <PageTitle title="Pricing" class="py-15"  />
          <VenueFormSpacePriceAndOpeningHours v-model="space" preview />
        </v-form>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  preview: boolean;
}>();

const overlay = defineModel("show", { required: true, default: false });
const space = defineModel("space", { required: true });
</script>

<style scoped></style>
