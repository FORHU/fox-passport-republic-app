<template>
  <v-overlay v-model="overlay" width="100%" height="100%">
    <v-row
      align="center"
      justify="center"
      class="fill-height"
      @click="overlay = false"
      style="position: relative"
    >
      <v-col v-if="urlFormat === 'image'" cols="auto" style="z-index: 1">
        <v-img width="auto" height="auto" :src="src" alt="Full Screen Image"></v-img>
      </v-col>
      <v-col
        v-else-if="urlFormat === 'video'"
        cols="auto"
        style="z-index: 1"
        align="center"
      >
        <video width="80%" height="80%" controls>
          <source :src="src" />
        </video>
      </v-col>
      <v-icon
        icon="mdi-close"
        size="40"
        color="white"
        style="position: absolute; top: 2%; right: 2%; z-index: 2"
        class="cursor-pointer"
        @click="overlay = false"
      ></v-icon>
    </v-row>
  </v-overlay>
</template>

<script setup lang="ts">
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});

const overlay = defineModel<boolean>("show", { default: false });

const urlFormat = computed(() => {
  const imageExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".bmp",
    ".svg",
    ".webp",
  ];
  const videoExtensions = [".mp4", ".mov"];

  const extension = props.src
    .substring(props.src.lastIndexOf("."))
    .toLowerCase();

  if (imageExtensions.includes(extension)) {
    return "image";
  } else if (videoExtensions.includes(extension)) {
    return "video";
  } else {
    return "unknown";
  }
});
</script>

<style scoped></style>
