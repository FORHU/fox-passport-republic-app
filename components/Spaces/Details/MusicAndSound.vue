<template>
  <v-row no-gutters class="ml-2">
    <v-col
      v-for="(music, index) in filteredMusicSound"
      :key="index"
      :cols="xs ? '12' : '6'"
      class="mb-1"
    >
      <v-icon :icon="music.icon" size="small" class="mr-1"></v-icon>
      <span>{{ music.question }}</span>
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
import { useDisplay } from "vuetify";
const { xs } = useDisplay();
const props = defineProps<{
  specificSpace: any;
}>();

const musicSoundIconMap = {
  "Customers can enjoy their own music.": "mdi-music",
  "Customers can bring their own DJ.": "mdi-account-music-outline",
  "The space is subject to noise limitations.": "mdi-volume-off",
};

const filteredMusicSound = computed(() => {
  return props.specificSpace.features
    .filter((item) => item.reference === "music_sound" && item.answer === true)
    .map((item) => ({
      ...item,
      icon: musicSoundIconMap[item.question] || "mdi-information-outline",
    }));
});
</script>
