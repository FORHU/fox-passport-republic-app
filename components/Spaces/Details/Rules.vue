<template>
  <v-row no-gutters>
    <!-- Allowed Events Header -->
    <v-col
      cols="12"
      class="font-weight-bold"
      v-if="
        (props.specificSpace.venue.venue_details.some(
          (space: any) => space.key === '5'
        )?.answer ||
          props.specificSpace.features.some(
            (space: any) => space.reference === 'wedding'
          )?.answer) &&
        !hideEvents
      "
    >
      Allowed Events
    </v-col>

    <!-- Promoted and Ticket Events -->
    <v-col
      v-if="
        props.specificSpace.venue.venue_details.some(
          (space: any) => space.key === '5'
        )?.answer && !hideEvents
      "
      cols="6"
    >
      <v-icon icon="mdi-check" size="small" class="mr-1"></v-icon>
      <span>Promoted and ticket events</span>
    </v-col>

    <!-- Wedding License -->
    <v-col
      v-if="
        props.specificSpace.features.some(
          (space: any) => space.reference === 'wedding'
        )?.answer && !hideEvents
      "
      cols="6"
    >
      <v-icon icon="mdi-check" size="small" class="mr-1"></v-icon>
      <span>Wedding license</span>
    </v-col>

    <!-- Cancellation Policy Header -->
    <v-col cols="12" class="font-weight-bold mt-0">
      {{ showPolicy }}
    </v-col>

    <!-- Cancellation Policy Cards -->
    <v-col
      cols="12"
      v-if="
        props.specificSpace.venue.cancellation_policy.policy.cancellation_range
      "
    >
      <!-- Very Flexible Cancellation -->
      <v-card
        variant="text"
        v-if="
          props.specificSpace.venue.cancellation_policy.policy
            .cancellation_range === 'VERY_FLEXIBLE'
        "
      >
        <div class="mt-5">
          Cancellations made
          <span class="font-weight-bold">within 24 hours</span> of the event
          start time will be refunded in full.
        </div>
      </v-card>

      <!-- Flexible Cancellation -->
      <v-card
        variant="text"
        v-if="
          props.specificSpace.venue.cancellation_policy.policy
            .cancellation_range === 'FLEXIBLE'
        "
      >
        <div class="mt-5">
          Cancellations
          <span class="font-weight-bold">7 days in advance</span> will receive a
          full refund.
        </div>
        <div class="mt-5">
          Cancellations
          <span class="font-weight-bold">7 days to 24 hours in advance</span>
          will receive a 50% refund.
        </div>
        <div class="mt-5">
          Cancellations
          <span class="font-weight-bold">for events starting within 24 hours</span>
          are non-refundable.
        </div>
      </v-card>

      <!-- Standard 30-Day Cancellation -->
      <v-card
        variant="text"
        v-if="
          props.specificSpace.venue.cancellation_policy.policy
            .cancellation_range === 'STANDARD_30'
        "
      >
        <div class="mt-5">
          Cancellations made
          <span class="font-weight-bold">30 days in advance</span>
          will be refunded in full.
        </div>
        <div class="mt-5">
          Cancellations
          <span class="font-weight-bold">30 days to 7 days in advance</span>
          will receive a 50% refund.
        </div>
        <div class="mt-5">
          Cancellations
          <span class="font-weight-bold">for events starting within 7 days</span>
          are non-refundable.
        </div>
      </v-card>

      <!-- Standard 60-Day Cancellation -->
      <v-card
        variant="text"
        v-if="
          props.specificSpace.venue.cancellation_policy.policy
            .cancellation_range === 'STANDARD_60'
        "
      >
        <div class="mt-5">
          Cancellations
          <span class="font-weight-bold">60 days in advance</span>
          will be refunded in full.
        </div>
        <div class="mt-5">
          Cancellations
          <span class="font-weight-bold">60 days to 30 days in advance</span>
          will receive a 50% refund.
        </div>
        <div class="mt-5">
          Cancellations
          <span class="font-weight-bold">for events starting within 30 days</span>
          are non-refundable.
        </div>
      </v-card>

      <!-- Custom Cancellation -->
      <v-card
        variant="text"
        v-if="
          props.specificSpace.venue.cancellation_policy.policy
            .cancellation_range === 'CUSTOM' &&
          !props.specificSpace.venue.cancellation_policy.policy.no_cancellation
        "
      >
        <div>
          At least
          <span class="font-weight-bold">
            {{
              props.specificSpace.venue.cancellation_policy.policy.custom
                .days_at_least.number_of_days
            }}
            days
          </span>
          will receive
          {{
            100 -
            Number(
              props.specificSpace.venue.cancellation_policy.policy.custom
                .days_at_least.total_price
            )
          }}% refund.
        </div>
        <div
          v-if="
            props.specificSpace.venue.cancellation_policy.policy.custom
              .days_less_than_but_at_least.length > 0
          "
          v-for="(data, index) in props.specificSpace.venue.cancellation_policy
            .policy.custom.days_less_than_but_at_least"
          :key="index"
        >
          At least
          <span class="font-weight-bold">{{ data.days_at_least }} days</span>
          and less than
          <span class="font-weight-bold">{{ data.days_less_than }} days</span>
          will receive {{ 100 - Number(data.total_price) }}% refund.
        </div>
        <div>
          Less than
          <span class="font-weight-bold">
            {{
              props.specificSpace.venue.cancellation_policy.policy.custom
                .days_less_than.number_of_days
            }}
            days
          </span>
          will receive
          {{
            100 -
            Number(
              props.specificSpace.venue.cancellation_policy.policy.custom
                .days_less_than.total_price
            )
          }}% refund.
        </div>
      </v-card>
    </v-col>

    <!-- Rescheduling Policy -->
    <v-col
      cols="12"
      class="mt-0"
      v-if="
        props.specificSpace.venue.cancellation_policy.allow_rescheduling.answer
      "
    >
      Guests may move the event date of a confirmed booking to another date
      within
      {{
        props.specificSpace.venue.cancellation_policy.allow_rescheduling.months
      }}
      months from the original date at no cost.
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const props = defineProps<{
  specificSpace: any;
  hideEvents?: boolean;
}>();

const showPolicy = computed(() => {
  const policy = props.specificSpace.venue.cancellation_policy.policy;

  if (policy.cancellation_range == 'OTHER' && policy.no_cancellation) return "No cancellation";
  if (policy.cancellation_range === "VERY_FLEXIBLE") return "Highly adaptable";
  if (policy.cancellation_range === "FLEXIBLE") return "Adaptable";
  if (policy.cancellation_range === "STANDARD_30") return "Typical 30-day";
  if (policy.cancellation_range === "STANDARD_60") return "Typical 60-day";
  if (policy.cancellation_range === "CUSTOM")
    return "Custom policy";
});
</script>
