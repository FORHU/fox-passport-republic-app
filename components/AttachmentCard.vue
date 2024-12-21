<template>
  <!-- <v-card
    class="ma-1 px-3 py-1 py-sm-2 cursor-pointer"
    elevation="0"
    style="border: solid 1px gray"
    width="250px"
    color="transparent"
    min-height="70"
  >
    <v-row no-gutters align="center" class="fill-height">
      <v-col cols="2" class="mr-3">
        <v-icon :icon="iconType" ></v-icon>
      </v-col>
      <v-col cols="7">
        <v-row
          no-gutters
          class="truncate-text text-caption"
          style="line-height: 1"
          >{{ fileData?.filename || "File" }}
        </v-row>

        <v-row no-gutters class="text-caption text-grey" style="line-height: 1"
          >{{ fileData?.contentType || "format" }}, {{ fileSize }}
        </v-row>
      </v-col>
    </v-row>
  </v-card> -->
  <v-chip class="cursor-pointer ma-1" size="x-large" label rounded="lg" :color="color" variant="flat">
    <v-row
      class="pa-2"
      justify="start"
      align="center"
    >
    <span class="mr-1">
      <v-icon :icon="iconType"></v-icon>
    </span>
      <span class="truncate-text text-16px">{{ fileData?.filename }} </span>
    </v-row>
  </v-chip>
</template>

<script setup lang="ts">
const props = defineProps<{
  fileData: TFile;
  color: string
}>();

const emit = defineEmits(["remove-attachment"]);

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
  width: 120px;
  /* Adjust width as needed */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
