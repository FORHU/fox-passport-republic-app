<template>
  <v-chip class="cursor-pointer ma-1" size="large" label rounded="lg" color="light_gray" variant="flat">
    <v-row
      class="pa-2 flex-nowrap"
      justify="start"
      align="center"
    >
    <span class="mr-1">
      <v-icon :icon="iconType"></v-icon>
    </span>
      <span>{{  smAndUp ? fileData?.filename : sliceContent(fileData?.filename, 10) }} </span>
      <span class="">
        <v-icon class="ml-3" icon="mdi-close" @click="emit('remove-attachment')"></v-icon>
      </span>
    </v-row>
  </v-chip>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp } = useDisplay();

const props = defineProps<{
  fileData: TFile;
}>();

const emit = defineEmits(["remove-attachment"]);
const chip = ref(true);

const sliceContent = (content: string, max?: number) => {
  const maxNum = max || 30
  if (content.length > maxNum) {
    return content.slice(0, maxNum) + '...';
  } else return content;
}



const iconType = computed(() => {
  const type = props.fileData?.contentType;

  if (type) {
    if (type.includes("image")) {
      return "mdi-image-outline";
    } else if (type.includes("video")) {
      return "mdi-video-outline";
    } else {
      return "mdi-file";
    }
  } else {
    return "mdi-file";
  }
});

const fileSize = computed(() => {
  if (props.fileData) {
    if (props.fileData.size <= 1000000) {
      return (props.fileData?.size / 1000).toFixed(2) + "KB";
    } else {
      return (props.fileData?.size / 1000000).toFixed(2) + "MB";
    }
  }
  return "";
});
</script>

<style scoped>
.truncate-text {
  display: inline-block;
  width: 200px;
  /* Adjust width as needed */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
