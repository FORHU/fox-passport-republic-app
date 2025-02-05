<template>
  <v-dialog
    v-model="overallReviewDialog"
    :retain-focus="false"
    opacity="40%"
    scroll-strategy="none"
    class="rounded-12px"
    max-height="90vh"
    max-width="600px"
    @click="overallReviewDialog = true"
  >
    <v-card class="overflow-y-auto">
      <v-row no-gutters>
        <v-col cols="12" justify="center">
          <RatingDetails
            :ratingAverage="ratingAverage"
            :totalRatings="totalRatings"
            :isShowReviews="true"
            :isShowUnderline="false"
          />
        </v-col>
        <v-divider></v-divider>
        <v-col cols="12" class="px-6 my-4">
          <v-row no-gutters align="center" justify="space-between">
            <!-- <span class="text-20px font-weight-medium pr-10">{{ totalRatings }} Reviews</span> -->
              <!-- <v-select
                :items="['Most Recent', 'Most Helpful', 'Highest Rated', 'Lowest Rated']"
                label="Sort by"
                hide-details
                dense
                clearable
                density="compact"
                rounded="lg"
                class="pl-10"
              ></v-select> -->
          </v-row>
        </v-col>
        <!-- <v-col cols="12" class="px-6 mb-2">
          <v-text-field
            prepend-inner-icon="mdi-magnify"
            rounded="lg"
            label="Search Reviews"
            single-line
            hide-details
            dense
            clearable
          ></v-text-field>
        </v-col> -->
        <v-col cols="12" class="px-6 my-4 mb-10">
          <RatingUserReviews :userReviews="userReviews" />
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
interface UserReview {
  _id: string;
  userId: string;
  spaceId: string;
  privateNote: string;
  publicNote: string;
  rating: number;
  updatedAt: string; 
}

const overallReviewDialog = defineModel({ required: true, default: false });

defineProps({
  userReviews: {
    type: Array as () => UserReview[],
    required: true,
    default: () => [],
  },
  ratingAverage: {
    type: Number,
    required: true,
    default: 0,
  },
  totalRatings: {
    type: Number,
    required: true,
    default: 0,
  },
});
</script>
