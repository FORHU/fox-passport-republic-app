<template>
  <v-card flat class="review-card">
    <div class="review-header">
      <v-avatar size="40">
        <ProfileAvatar :img-src="currentUser?.profile_picture" />
      </v-avatar>
      <div class="user-info">
        <h3 class="user-name">{{ userName }}</h3>
        <p class="user-details">{{ userDetails }}</p>
      </div>
    </div>
    <div class="review-content">
      <div class="rating-date">
        <v-rating
          :model-value="rating"
          readonly
          dense
          size="small"
          color="amber"
          density="compact"
        ></v-rating>
        <p class="review-date">{{ reviewDate }}</p>
      </div>
      <p class="review-text">{{ reviewText }}</p>
      <NuxtLink to="/some-path" class="read-more-link">Read more</NuxtLink>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
const { currentUser } = useLocalAuth();
const props = defineProps<{
  avatarSrc: string;
  userName: string;
  userDetails: string;
  rating: number;
  reviewDate: string;
  reviewText: string;
}>();
</script>

<style scoped>
.review-card {
  margin-bottom: 16px;
  padding: 16px;
}
.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.user-info {
  margin-left: 12px;
}
.user-name {
  font-weight: bold;
  margin-bottom: 0;
}
.user-details {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 0;
}
.review-content {
  display: flex;
  flex-direction: column;
}
.rating-date {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.custom-rating {
  margin-right: 8px;
}
.review-date {
  font-size: 0.9em;
  color: #666;
  margin: 0;
}
.review-text {
  margin-top: 8px;
  margin-bottom: 8px;
}
.read-more-link {
  color: #373941;
  text-decoration: underline;
  font-weight: 500;
}
.read-more-link:hover {
  text-decoration: underline;
}
</style>
