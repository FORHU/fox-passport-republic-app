<template>
  <v-card
    color="primary"
    variant="outlined"
    :height="mdAndUp ? 276 : 200"
    :width="mdAndUp ? 220 : 140"
    position="relative"
    elevation="3"
    rounded="lg"
    @click="handleClick"
  >
    <!-- <pre>{{ files }}</pre> -->
    <v-sheet
      height="67%"
      color="grey-lighten-1"
      class="d-flex justify-center align-center"
    >
      <v-icon
        icon="mdi-plus"
        color="primary"
        :size="mdAndUp ? 75 : 50"
      ></v-icon>
    </v-sheet>
    <v-card-text
      class="mx-lg-2 text-grey-darken-2 text-center d-flex align-center justify-center"
    >
      <p class="text-subtitle-2 text-lg-subtitle-1" style="line-height: 1">
        {{ label }}
      </p>
    </v-card-text>
  </v-card>
  <input
    type="file"
    class="d-none"
    id="file-input-space"
    accept="image/jpeg, image/png, image/gif, video/mp4, video/quicktime"
    @change="handleFileChange"
    multiple
  />
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { xs, mdAndUp } = useDisplay();

defineProps<{
  label?: string;
}>();

const model = defineModel();

const handleClick = () => {
  document.getElementById("file-input-space")?.click();
};

const handleFileChange = async (e: any) => {
  const input = e.target as HTMLInputElement;
  if (input.files) {
    const filesArr = Array.from(input.files);
    model.value = filesArr;
  }
};

const emit = defineEmits(["update:modelValue"]);
</script>

<style scoped></style>
