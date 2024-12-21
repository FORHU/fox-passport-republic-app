<template>
  <v-row>
    <!-- Custom Price Section -->
    <v-col cols="12" v-if="
      props.specificSpace.pricing.selected_pricing === 'CUSTOM_PRICE' &&
      hasCustomPrices
    ">
      <!-- Iterate over grouped custom price data by day -->
      <v-row no-gutters justify="space-between" v-for="(dayData, day) in groupByUniqueDays" :key="day" class="my-2">
        <v-col cols="4" xs="3">
          <strong class="text-caption">{{ day }}</strong>
        </v-col>
        <v-col  cols="4" xs="4" class="text-caption">
          <template v-for="(slot, index) in dayData.slot" :key="index">
            <p>{{ slot.time.from }} - {{ slot.time.to }}</p>
          </template>
        </v-col>
        <v-col cols="4" xs="4">
          <v-row no-gutters>
            <v-col cols="12" v-for="(slot, index) in dayData.slot" :key="index" class="d-flex flex-column">
              <span class="font-weight-bold mx-0 text-caption">
                {{ getSymbol(props.specificSpace?.pricing?.currency) }}{{ slot.price }}&nbsp;
                <span class="font-400">{{ slot.duration }}</span> 
                <template v-if="slot?.minimum_spend">
                 /  <br/> {{ getSymbol(props.specificSpace?.pricing?.currency) }} {{ slot?.minimum_spend }}&nbsp;
                <span class="font-400">{{ 'per min spend'}}</span>
                </template>
                <template v-if="slot?.package_per_person">
                 /  <br/> {{ getSymbol(props.specificSpace?.pricing?.currency) }} {{ slot?.package_per_person }}&nbsp;
                <span class="font-400">{{ 'per person'}}</span>
                </template>
              </span>

              <span class="text-caption">
                {{ slot.description }}
              </span>
              <!-- <v-divider class="my-2"></v-divider> -->
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-col>

    <!-- Hire Fee Section -->
    <v-col cols="12" v-if="
      props.specificSpace.pricing.selected_pricing === 'HIRE_FEE' &&
      hasHireFees
    " v-for="(day, index) in props.specificSpace.pricing.hire_fee.days" :key="index">
      <v-row no-gutters justify="space-between" class="w-100">
        <v-row no-gutters v-if="day.hourlyCheckBox">
          <v-col cols="4" xs="3">
            <strong class="text-caption">{{ day.name }}</strong>
          </v-col>
          <v-col cols="4" xs="4" class="text-caption">
            {{ day?.slots.start }} - {{ day.slots.end }}
          </v-col>
          <v-col cols="4" xs="5" :class="mobile ? 'text-caption' : ''">
            <span class="d-flex flex-row">
              <span class="font-weight-bold mx-0 text-caption">
                {{ getSymbol(props.specificSpace?.pricing?.currency) }}{{ day.slots.rate }}&nbsp;
              </span>
              <span class="text-caption">Per hour</span>
            </span>
          </v-col>
        </v-row>
        <v-row no-gutters v-if="day.fullRateCheckkBox" class="w-100">
          <v-col cols="4" xs="3">
            <strong v-if="!day?.hourlyCheckBox" class="text-caption">{{ day.name }}</strong>
          </v-col>
          <v-col cols="4" xs="4" class="text-caption">
            <span v-if="!day?.hourlyCheckBox"> {{ day?.slots.start }} - {{ day.slots.end }}</span>
          </v-col>
          <v-col cols="4" xs="5" :class="mobile ? 'text-caption' : ''">
            <span class="d-flex flex-row">
              <span class="font-weight-bold mx-0 text-caption">
                {{ getSymbol(props.specificSpace?.pricing?.currency) }}{{ day.full_day_rate }}&nbsp;
              </span>
              <span class="text-caption">Per day ({{ day?.full_day_hours }}{{ day?.full_day_hours > 1 ? 'hrs' : 'hr' }})
              </span>
            </span>
          </v-col>
        </v-row>
      </v-row>
    </v-col>

    <!-- Minimum Hours Section -->
    <v-col cols="12" v-if="minimumHours">
      <v-icon icon="mdi-clock-outline" size="small" class="mr-2"></v-icon>
      <span class="text-caption">Minimum booking duration:</span>
      <span class="font-weight-bold text-caption">
        {{ minimumHours }} hours
      </span>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";

const { mobile } = useDisplay();
const { getCurrencySymbol } = useLocal();

const props = defineProps<{
  specificSpace: {
    pricing: {
      selected_pricing: string;
      custom_price?: {
        prices: Array<{
          weekdays: string[];
          price: number;
          duration: string;
          time: {
            from: string;
            to: string;
          };
          package_per_person?: number;
          minimum_spend?: number;
          type?: string;
          description?: string;
        }>;
      };
      hire_fee: {
        days: Array<{
          name: string;
          slots: {
            start: string;
            end: string;
            rate: number;
          };
          fullRateCheckkBox: boolean;
          full_day_rate?: number;
          hourlyCheckBox: boolean;
        }>;
        minimum_booking_hours?: string | number;
        cleaning_fee?: number;
      };
      currency: string; // Add currency to pricing
    };
  };
}>();

const minimumHours = computed(() => {
  const minHours =
    props.specificSpace?.pricing?.hire_fee?.minimum_booking_hours;

  if (minHours) {
    if (typeof minHours === "string") {
      let pattern = /\d+/;
      let num = parseInt(minHours.match(pattern)[0]);
      return num;
    } else if (typeof minHours === "number") {
      return minHours;
    }
  }
  return null;
});

const customPriceData = computed(() => {
  const priceMap: Record<
    string,
    {
      price: number;
      duration: string;
      time: {
        from: string;
        to: string;
      };

      package_per_person?: string;
      type?: string;
      description?: string;
    }
  > = {};

  if (props.specificSpace.pricing.custom_price) {
    props.specificSpace.pricing.custom_price.prices.forEach((entry) => {
      entry.weekdays.forEach((day) => {
        if (!priceMap[day]) {
          priceMap[day] = [];
        }
        priceMap[day].push({
          price: entry.price,
          duration: entry.duration,
          time: entry.time,
          package_per_person: entry.package_per_person,
          type: entry.type,
          description: entry.description,
        });
      });
    });
  }
  return priceMap;
});

// Helper function to get currency symbol
const getSymbol = (currencyCode: string) => {
  return getCurrencySymbol(currencyCode) || "₱";
};

const hasCustomPrices = computed(() => {
  return Object.keys(customPriceData.value).length > 0;
});

const hasHireFees = computed(() => {
  return props.specificSpace.pricing.hire_fee.days.length > 0;
});

const groupByUniqueDays = computed(() => {
  const dayMap: Record<string, { day: string; slot: any[] }> = {};

  props.specificSpace.pricing.custom_price.prices.forEach((entry) => {
    entry.weekdays.forEach((day) => {
      if (!dayMap[day]) {
        dayMap[day] = { day: day, slot: [] };
      }
      dayMap[day].slot.push({
        duration: entry.duration,
        price: entry.price,
        minimum_spend: entry?.minimum_spend,
        time: entry.time,
        package_per_person: entry?.package_per_person,
        type: entry.type,
        description: entry.description,
      });
    });
  });

  // Sort slots by start time
  Object.values(dayMap).forEach((day) => {
    day.slot.sort((a, b) => {
      const [hourA, minuteA] = a.time.from.split(":").map(Number);
      const [hourB, minuteB] = b.time.from.split(":").map(Number);
      return hourA - hourB || minuteA - minuteB;
    });
  });

  return dayMap;
});
</script>
<style scoped>
.text-16px {
  font-size: 16px;
  color: #373941;
}

.mb-1 {
  margin-bottom: 0.2rem;
}
</style>
