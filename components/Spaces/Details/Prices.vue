<template>
  <v-row no-gutters>
    <!-- Custom Price Section -->
    <v-divider class="my-5 hidden-lg-and-up"></v-divider>
    <v-col cols="12" v-if="
      props.specificSpace.pricing.selected_pricing === 'CUSTOM_PRICE' &&
      hasCustomPrices
    ">
      <v-expansion-panels flat >
        <v-expansion-panel v-for="(dayData, day) in groupByUniqueDays">
          <v-expansion-panel-title>
            <template v-slot:default="{ expanded }">
              <v-row no-gutters>
                <v-col cols="4" xs="3">
                  <strong class="text-caption">{{ day }}</strong>
                </v-col>
                <v-col cols="4" xs="4" class="text-caption">
                  <template v-for="(slot, index) in dayData.slot" :key="index">
                    <p v-if="index == 0">{{ slot.time.from }} - {{ slot.time.to }}</p>
                  </template>
                </v-col>
                <v-col cols="4" xs="4">
                  <v-row no-gutters>
                    <v-col cols="12" v-for="(slot, index) in dayData.slot" :key="index" class="d-flex flex-column">
                      <span v-if="index == 0" class="font-weight-bold mx-0 text-caption">
                        {{ getSymbol(props.specificSpace?.pricing?.currency) }}{{ slot.price }}&nbsp;
                        <span class="font-400">{{ slot.duration }}</span>
                        <template v-if="slot?.minimum_spend">
                          / <br /> {{ getSymbol(props.specificSpace?.pricing?.currency) }} {{ slot?.minimum_spend
                          }}&nbsp;
                          <span class="font-400">{{ 'per min spend' }}</span>
                        </template>
                        <template v-if="slot?.package_per_person">
                          / <br /> {{ getSymbol(props.specificSpace?.pricing?.currency) }} {{ slot?.package_per_person
                          }}&nbsp;
                          <span class="font-400">{{ 'per person' }}</span>
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
            </template>
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <v-row v-if="dayData?.slot?.length > 1" no-gutters style="width: 95%;">
              <v-col cols="4" xs="3">
              </v-col>
              <v-col cols="4" xs="4" class="text-caption">
                <template v-for="(slot, index) in dayData.slot" :key="index">
                  <p v-if="index != 0">{{ slot.time.from }} - {{ slot.time.to }}</p>
                </template>
              </v-col>
              <v-col cols="4" xs="4">
                <v-row no-gutters>
                  <v-col cols="12" v-for="(slot, index) in dayData.slot" :key="index" class="d-flex flex-column">
                    <span v-if="index != 0" class="font-weight-bold mx-0 text-caption">
                      {{ getSymbol(props.specificSpace?.pricing?.currency) }}{{ slot.price }}&nbsp;
                      <span class="font-400">{{ slot.duration }}</span>
                      <template v-if="slot?.minimum_spend">
                        / <br /> {{ getSymbol(props.specificSpace?.pricing?.currency) }} {{ slot?.minimum_spend
                        }}&nbsp;
                        <span class="font-400">{{ 'per min spend' }}</span>
                      </template>
                      <template v-if="slot?.package_per_person">
                        / <br /> {{ getSymbol(props.specificSpace?.pricing?.currency) }} {{ slot?.package_per_person
                        }}&nbsp;
                        <span class="font-400">{{ 'per person' }}</span>
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
            <v-row v-else no-gutters justify="center" class="text-12px">No additional information.</v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>

    <!-- Hire Fee Section -->
    <v-col cols="12" v-if="
      props.specificSpace.pricing.selected_pricing === 'HIRE_FEE' &&
      hasHireFees
    ">
      <v-expansion-panels flat>
        <v-expansion-panel v-for="(day, index) in props.specificSpace.pricing.hire_fee.days" :key="index">
          <v-expansion-panel-title>
            <template v-slot:default="{ expanded }">
              <v-row no-gutters>
                <v-col cols="4">
                  <p class="text-14px font-500">{{ day.name }}</p>
                </v-col>
                <v-col cols="4">
                  {{ day.slots.start }} - {{ day.slots.end }}
                </v-col>
                <v-col cols="4">
                  <span class="text-14px font-500">
                    {{ getSymbol(props.specificSpace.pricing.currency) }}
                    {{
                      day.hourlyCheckBox ? day.slots.rate : day.full_day_rate
                    }}&nbsp;
                  </span>
                  <span class="text-12px font-400">
                    {{ day.hourlyCheckBox ? "Per hour" : `Per day (${day?.full_day_hours && day?.full_day_hours > 1 ?
                      `${day?.full_day_hours}hrs` : `${day.full_day_hours}hr`})` }}
                  </span>
                </v-col>
              </v-row>
            </template>
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <v-row no-gutters>
              <v-col cols="12">
                <v-row no-gutters v-if="day?.fullRateCheckkBox && day?.hourlyCheckBox" justify="end"
                  style="width: 96%;">
                  <v-col cols="4"></v-col>
                  <v-col cols="4"></v-col>
                  <v-col cols="4">
                    <p class="font-500 text-14px">
                      {{ getSymbol(props.specificSpace.pricing.currency)
                      }}{{ day?.full_day_rate }}
                      <span class="text-12px font-400">{{ `Per day (${day?.full_day_hours && day?.full_day_hours > 1 ?
                        `${day?.full_day_hours}hrs`
                        :
                        `${day.full_day_hours}hr`})` }}</span>
                    </p>
                  </v-col>
                </v-row>
                <v-row no-gutters v-else justify="center">
                  <span class="text-14px">No additional information.</span>
                </v-row>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>

    <!-- Minimum Hours Section -->
    <v-col class="my-4" cols="12" v-if="minimumHours">
      <v-icon icon="mdi-clock-outline" size="small" class="mr-2"></v-icon>
      <span class="text-14px mr-1">Minimum booking duration:</span>
      <span class="text-14px font-500">
        {{ minimumHours }} {{ minimumHours > 1 ? "hours" : "hour" }}
      </span>
    </v-col>

    <!-- Cleaning Fee Section -->
    <v-col class="my-4" cols="12" v-if="
      props.specificSpace.pricing.cleaning_fee !== undefined &&
      props.specificSpace.pricing.cleaning_fee !== null
    ">
      <v-icon icon="mdi-broom" size="small" class="mr-2"></v-icon>
      <span class="text-14px mr-1">Cleaning Fee:</span>
      <span class="text-14px font-500">
        {{ getSymbol(props.specificSpace.pricing.currency)
        }}{{ props.specificSpace.pricing.cleaning_fee }}
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
          full_day_hours?: number;
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
  
    props.specificSpace?.pricing?.custom_price?.prices?.forEach((entry) => {
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
  
   
    // Sort the dayMap by the correct order of days
  const sortedDayMap = Object.keys(dayMap)
    .sort((a, b) => {
      return daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b);
    })
    .reduce((acc, key) => {
      acc[key] = dayMap[key];
      return acc;
    }, {} as Record<string, { day: string; slot: any[] }>);

    return sortedDayMap;
  });

  // Days of the week in correct order (Sunday - Saturday)
  const daysOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
</script>
