<template>
  <v-dialog v-model="overlay" width="100%" height="100%" opacity="50">
    <v-row align="center" justify="center" class="fill-height" style="position: relative;">
      <v-carousel hide-delimiters width="100%" height="100%" :show-arrows="images.length > 1 ? 'hover' : false"
        v-model="activeIndex">
        <template v-for="x, index in images" :key="x._id">
          <v-carousel-item v-if="x.contentType.includes('image')" height="100%" width="100%" rounded="lg">
            <v-row no-gutters class="w-100 h-100" align="center">
              <v-img :lazy-src="x.path" :src="x.path" width="70%" height="70%" :alt="'Image Viewer Card -' + index"></v-img>
            </v-row>
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
              </div>
            </template>
          </v-carousel-item>
          <v-carousel-item v-else-if="x.contentType.includes('video')">
            <v-row no-gutters class="h-100 w-100" align="center" justify="center">
              <video width="80%" height="80%" controls>
                <source :src="x.path" />
              </video>
            </v-row>
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
              </div>
            </template>
          </v-carousel-item>
        </template>

        <template v-slot:prev="{ props }">
          <v-btn color="white" variant="outlined" class="text-white" icon="mdi-chevron-left"
            @click="props.onClick"></v-btn>
        </template>
        <template v-slot:next="{ props }">
          <v-btn color="white" class="text-white" variant="outlined" icon="mdi-chevron-right"
            @click="props.onClick"></v-btn>
        </template>
      </v-carousel>
      <div style="position: absolute; top: 2%; left: 0%; right: 0%; z-index: 2"
        class="cursor-pointer text-white text-h6 custom-shadow d-flex justify-space-between" @click="overlay = false">
        <!-- <v-icon icon="mdi-close" size="30" color="white"></v-icon>Close -->
        <v-row no-gutters style="position: relative">
          <v-col cols="8" xs="6" sm="2" md="2" lg="2">
          <v-btn prepend-icon="mdi-close" text="Close" rounded="lg" color="secondary" class="ml-2"
            style="position: absolute;"></v-btn>
            </v-col>
            <!-- <v-col cols="4" xs="6" sm="10" md="10" lg="10">
          <span class="text-white text-16px d-flex w-100 mt-2 justify-center">{{ `${activeIndex + 1}/${images.length}`
            }}</span>
            </v-col> -->
        </v-row>
        <span v-if="showExtraButtons">
          <v-btn class="" variant="text" prepend-icon="mdi-export-variant"
            @click.stop="handleShare">
            Share
          </v-btn>

          <v-btn class="" variant="text" :prepend-icon="isFavorite
            ? 'mdi-heart'
            : 'mdi-heart-outline'
            " @click.stop="handleLike" :disabled="loggedIn && currentUser?.role !== 'USER'">
            {{
              isFavorite ? "Liked" : "Like"
            }}
          </v-btn>
        </span>
        <span v-else>
        <div style="visibility: hidden; width: 200px; display: inline-block;"></div>
        </span>
      </div>
      <span class="text-white text-16px d-flex w-100 mt-2 justify-center" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);">{{ `${activeIndex + 1}/${images.length}`
            }}</span>
    </v-row>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps({
  activeImageId: {
    type: String,
    required: false,
  },
  showExtraButtons: {
    type: Boolean,
    default: false,
    required: false
  },
  isFavorite: {
    type: Boolean,
    default: false,
    required: false
  }
});
const images = defineModel<any[]>("images", { required: true });
const overlay = defineModel("show", { required: true });
const activeIndex = ref(0);
const { loggedIn, currentUser} = useLocalAuth();

const emit = defineEmits(['share', 'like'])

watchEffect(() => {
  if (props.activeImageId && images.value.length > 0) {
    const index =
      images.value?.findIndex((x) => x._id == props.activeImageId) || 0;
    if (index !== -1) {
      activeIndex.value = index;
    } else activeIndex.value = 0;
  } else {
    return (activeIndex.value = 0);
  }
});


const handleShare = () => {
  overlay.value = false;
  emit('share')
}

const handleLike = () => {
  emit('like')
}
</script>

<style scoped>
.custom-shadow {
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}
</style>
