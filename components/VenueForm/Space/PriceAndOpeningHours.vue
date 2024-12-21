<template>
  <v-row no-gutters class="w-100">
    <v-row no-gutters class="w-100">
      <v-col cols="12">
          <v-row no-gutters class="w-100">
            <v-col cols="12">
              <template v-for="item in optionsArray" :key="item?.title">
                <v-card flat width="100%" min-height="67px" rounded="lg" class="cursor-pointer my-2"
                  @click="!isViewMode && (space.pricing.selected_pricing = item.key as 'HIRE_FEE' | 'CUSTOM_PRICE')"
                  :style="{ border: item?.key == space?.pricing?.selected_pricing ? '1px solid rgba(var(--v-theme-secondary)' : '1px solid #DEDFE3' }">
                  <v-row no-gutters class="pa-3" align="center">
                    <span class="mr-2">
                      <v-checkbox color="secondary" base-color="light_gray_secondary" hide-details readonly
                        :model-value="item.key == space?.pricing?.selected_pricing"></v-checkbox>
                    </span>
                    <v-col class="d-flex ga-2 align-center">
                      <div class="d-flex flex-column">
                        <span class="w-100 font-500 text-16px">{{ item?.title }}</span>
                        <span class="w-100 text-14px">{{item?.subtitle}}</span>
                      </div>
                    </v-col>
                  </v-row>
                </v-card>
              </template>
            </v-col>

          </v-row>
      </v-col>
    </v-row>
    <VenueFormSpacePricingHiringOnly v-if="space.pricing.selected_pricing == 'HIRE_FEE'" v-model="space" />
    <VenueFormSpacePricingCustomOnly v-if="space.pricing.selected_pricing == 'CUSTOM_PRICE'" v-model="space" />
  </v-row>
</template>

<script setup lang="ts">
//IMPORT
import { useDisplay } from "vuetify";
const { smAndUp, smAndDown, mdAndUp } = useDisplay();
const { requiredInput } = useUtils();

const space = defineModel<TVenueSpace>({ required: true });

const { mode } = useVenue();

const props = defineProps<{
  preview?: boolean;
}>();

const isViewMode = computed(() => {
  return mode.value == "view" || props.preview;
});

//DATA
const customPricing = ref(false);

const optionsArray = [
  {
    title: 'Hire fee only',
    subtitle: 'We charge based on hire fee per hour or per day.',
    key: 'HIRE_FEE'
  },
  {
    title: 'Custom Pricing',
    subtitle: 'We charge based on minimum spend, price per person or hire fee.',
    key: 'CUSTOM_PRICE'
  }
]

//WATCHERS

//COMPUTED

//METHODS

//CREATED
</script>

<style scoped></style>
