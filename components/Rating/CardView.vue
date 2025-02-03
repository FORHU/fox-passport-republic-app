<template>
  <v-chip v-bind="$attrs" no-gutters style="width: max-content;" color="white"
    class="text-12px d-flex items-center align-center border px-2" variant="flat" rounded="lg"
    @click="isShowAllReviewsDialog = true">
    <template v-if="rating">
      <v-icon icon="mdi-star" color="#FBBC05" class="mr-1" :size="size ? size : 'small'"></v-icon>
      <span class="text-secondary">{{ rating }}</span>
      <span v-if="totalReviews" class="pl-2 text-secondary hover-underlined">({{ totalReviews }} {{ totalReviews > 1 ?
        "reviews" : "review" }})</span>
    </template>
    <template v-else>
      <v-icon icon="mdi-star-outline" color="#FBBC05" class="mr-1" :size="size ? size : 'small'"></v-icon>
      <span class="text-secondary">No ratings yet</span>
    </template>
  </v-chip>
  <RatingOverallReviews v-model="isShowAllReviewsDialog" :userReviews="ratingDetails?.details"
    :ratingAverage="ratingDetails?.averageRating" :totalRatings="ratingDetails?.totalReviews" />
</template>

<script setup lang="ts">
const props = defineProps<{
  enquiry: TEnquiry;
  size?: string
}>();

const { getOverallSpaceRating } = useRatings();

const bookingReviewed = ref(false);
const showChatTemplateModal = ref(false);
const ratingDetails = ref<any>(null);
const privateNote = ref<string | null>(null);
const publicNote = ref<string | null>(null);
const isShowAllReviewsDialog = ref(false);
const rating = ref('')
const totalReviews = ref(0)
const totalRatings = ref(0)




const fetchOverallSpaceRating = async () => {
  const spaceId = props.enquiry.space._id;
  if (!spaceId) return;
  try {
    const res = await getOverallSpaceRating(spaceId as string);
    if (!res) return;
    const ratingObj = res?.[0]
    ratingDetails.value = ratingObj
    rating.value = ratingObj?.averageRating
    totalReviews.value = ratingObj?.totalReviews
    totalRatings.value = ratingObj?.totalRatings

  } catch (error) {
    console.error("Error fetching rating and reviews:", error);
  }
};

onMounted(() => {
  fetchOverallSpaceRating();
})
</script>
