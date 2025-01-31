<template>
  <v-card class="d-flex flex-column mx-auto py-8 mx-auto" width="100%" elevation="0">
    <div class="d-flex justify-center text-h5">Rating overview</div>

    <div class="d-flex align-center flex-column">
      <div class="text-h2 mt-5">
        {{ ratingAverage }}
        <span class="text-h6 ml-n3">/5</span>
      </div>

      <v-rating
        :model-value="ratingAverage"
        color="yellow-darken-3"
        half-increments
        readonly
      ></v-rating>
      <div
        class="px-3"
        :class="
          totalRatings > 0 && isShowUnderline ? 'text-decoration-underline' : ''
        "
        v-if="isShowReviews"
        @click="showReviewsClicked()"
      >
        {{ totalRatings }} reviews
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
defineProps({
  ratingAverage: {
    type: Number,
    required: false,
  },
  totalRatings: {
    type: Number,
    required: false,
    default: 0,
  },
  isShowReviews: {
    type: Boolean,
    required: false,
  },
  isShowUnderline: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const emit = defineEmits(["showReviewsClicked"]);

const showReviewsClicked = () => {
  emit("showReviewsClicked");
};
</script>
