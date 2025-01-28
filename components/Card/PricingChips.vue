<template>
   <span class="d-flex ga-1 flex-wrap">
    <template v-for="(item, index) in getRate(space?.pricing,  date_calendar || null, priceFilter || [null, null])" :key="item?.type">
              <v-chip variant="tonal" color="charcoal" class="" size="small">
                <span class="d-flex align-center text-14px font-600">
                  {{ currencySymbol(space?.pricing?.currency as string) }}
                  {{ item?.rate }}
                  <span class="text-subtitle-2 font-400">{{formatPricingType(item.type)}}</span>
                </span>
              </v-chip>
    </template>
   </span>
  </template>
  
  <script setup lang="ts">
  const { formatPricingType } = useUtils();
  const { getCurrencySymbol } = useLocal();
  const { getRate } = useSpace();

const props = defineProps<({
    space: TVenueSpace,
    priceFilter?: [string | null, string | null],
    date_calendar?: string | null;
    
})>()

const currencySymbol = (currency: string) => {
  if (!currency) return "";
  return getCurrencySymbol(currency.toUpperCase());
};
  </script>
  