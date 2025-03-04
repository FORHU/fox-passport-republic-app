<template>
  <v-row no-gutters class="w-100 text-secondary">
    <v-row class="w-100">
      <v-col cols="12" xs="12" sm="12" md="6" lg="6">
        <span class="w-100 text-18px font-500">Space Name</span>
        <v-text-field v-model="space.name" class="w-100 mt-1 custom-hint" placeholder="Space Name" color="charcoal"
          base-color="charcoal" border="secondary sm" rounded="lg" :rules="nameRules"
          density="comfortable" hide-details></v-text-field>
          <p class="text-red text-14px mt-1 ml-2" style="line-height: 1.2;">* Please note that only the space name will be visible on the search page, while the venue name will not be displayed.</p>
      </v-col>

      <v-col cols="12" xs="12" sm="12" md="6" lg="6">
        <span class="w-100 text-18px font-500">Space Type</span>
        <v-autocomplete v-model="space.type" class="w-100 mt-1" variant="outlined" placeholder="Space Type"
          :items="spaceTypesArray" item-title="label" item-value="label" color="charcoal" base-color="charcoal"
          border="secondary sm" rounded="lg" :rules="typeRules" density="comfortable"></v-autocomplete>
      </v-col>
    </v-row>

    <v-row class="">
      <v-col cols="12">
        <p class="w-100 text-18px font-500">Space Description</p>
        <v-textarea v-model="space.description" variant="outlined" rounded="lg" base-color="charcoal" color="charcoal"
          counter :rows="smAndUp ? 5 : 10" class="mt-1" :rules="textCountRules" no-resize auto-grow></v-textarea>
      </v-col>
    </v-row>

    <v-row no-gutters class="mt-3">
      <v-col cols="12" class="text-18px font-500">Which section of the venue does this function correspond
        to?</v-col>
      <v-col cols="12" class="text-16px text-charcoal">Inform customers whether the space is exclusive or will be
        shared with
        other guests.</v-col>

      <v-row class="mt-1">
        <template v-for="x in areaTypeOptions" :key="x.key">
          <v-col cols="12" v-if="x.key">
            <v-card flat  width="100%" min-height="67px" rounded="lg" class="cursor-pointer" @click="selectType(x.key)" :style="{border: x.key == space.representation ? '1px solid rgba(var(--v-theme-secondary)' : '1px solid #DEDFE3'}">
              <v-row no-gutters class="pa-3" align="center">
                <v-col class="d-flex ga-2 align-center">
                  <span><v-img :src="x.imagePath" height="30" width="auto" class="icon" alt="Space Details Image"></v-img></span>
                  <div class="d-flex flex-column">
                    <span class="w-100 font-500 text-16px">{{ x.name }}</span>
                    <span class="w-100 text-14px">{{ x.subtitle }}</span>
                  </div>
                </v-col>
                <span>
                  <v-checkbox color="secondary" base-color="light_gray_secondary" hide-details readonly :model-value="x.key == space.representation"></v-checkbox>
                </span>
              </v-row>
            </v-card>
          </v-col>
        </template>
      </v-row>
    </v-row>

  </v-row>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: TVenueSpace;
  preview?: boolean;
}>();

import { useDisplay } from "vuetify";
const { smAndUp } = useDisplay();

const { countries } = useVenueData();
const { spaceTypesObj, areaTypeOptions } = useSpaceData();
const { mode } = useVenue();

const space = defineModel<TVenueSpace>({ required: true });
const emit = defineEmits(["save-draft"]);

const searchTerm = ref("");

const spaceTypesArray = computed(() => {
  return Object.values(spaceTypesObj);
});

const textCountRules = computed(() => [
  (v: string) => v?.length >= 300 || "Minimum of 300 characters",
  (v: string) => v?.length <= 2000 || "Maximum of 2000 characters",
]);

const nameRules = computed(() => [
  (v: string) => !!v || "Space name is required",
]);

const typeRules = computed(() => [
  (v: string) => !!v || "Space type is required",
]);

const selectType = (key: string) => {
  if (mode.value === "view" || props.preview) return;
  if (space.value.representation !== key) {
    space.value.representation = key;
  }
};


</script>

<style scoped>

/* .v-input :deep(.mdi-checkbox-blank-outline){
  opacity: 1 !important;
  color: #DEDFE3 !important;
} */

</style>
