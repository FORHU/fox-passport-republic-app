<template>
  <v-card :class="deleteIcon ? 'image-card' : ''" :height="height || '100%'" :width="width || '100%'" flat rounded="lg" position="relative"
    style="position: relative">
    <template v-slot:image>
      <v-img :src="urlFormat == 'image' ? src : ''" :lazy-src="urlFormat == 'image' ? src : ''" cover :alt=" 'src-image'">
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
          </div>
        </template>
      </v-img>

    </template>
    <v-row v-if="urlFormat == 'image'" class="fill-height" justify="center" no-gutters>
      <v-col v-if="deleteIcon || disabled" cols="12" align="end">
        <div class="delete-icon rounded-circle bg-white d-flex align-center justify-center cursor-pointer"
          style="height: 30px; width: 30px">
          <v-icon v-if="deleteIcon" icon="mdi-trash-can-outline" size="20" color="black"
            @click.stop="emit('delete')"></v-icon>
        </div>
      </v-col>

      <v-col cols="12" style="position: absolute; bottom: 0%">
        <v-select v-if="withSelect" variant="solo-filled" width="100%" hide-details class="pa-2"
          :items="['Building Exterior', 'Building Interior']"></v-select>
      </v-col>
    </v-row>
    <v-row no-gutters v-else-if="urlFormat == 'video'" class="fill-height" style="position: relative">
      <v-col cols="12">
        <video width="100%" height="100%" cover controls style="object-fit: cover">
          <source :src="src" />
        </video>
      </v-col>
      <v-col v-if="deleteIcon || disabled" cols="12" align="end">
        <div class="delete-icon rounded-circle bg-white d-flex align-center justify-center cursor-pointer"
          style="height: 30px; width: 30px">
          <v-icon v-if="deleteIcon" icon="mdi-trash-can-outline" size="20" color="black"
            @click.stop="emit('delete')"></v-icon>
        </div>
      </v-col>

      <!-- <v-col v-if="deleteIcon" cols="12" align="end" style="position: absolute">
        <div
          class="delete-icon rounded-circle bg-black d-flex align-center justify-center cursor-pointer"
          style="height: 30px; width: 30px"
        >
          <v-icon
            icon="mdi-delete"
            size="20"
            color="black"
            class="cursor-pointer"
            @click.stop="emit('delete')"
          ></v-icon>
        </div>
      </v-col>
    </v-row> -->
    </v-row>
    <v-row v-else class="fill-height" justify="center" no-gutters>
      <v-col cols="12" align="end">
        <div class="delete-icon rounded-circle bg-black d-flex align-center justify-center cursor-pointer"
          style="height: 30px; width: 30px">
          <v-icon v-if="deleteIcon" icon="mdi-delete" size="20" color="black" @click.stop="emit('delete')"></v-icon>
        </div>
      </v-col>

      <v-col cols="12" align="center">
        <v-row no-gutters justify="center"><v-icon icon="mdi-alert" color="yellow" size="40"></v-icon></v-row>
        <v-row no-gutters class="text-center" justify="center">Image Not Supported</v-row>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{
  height?: number | string;
  width?: number | string;
  deleteIcon?: boolean;
  src: string;
  withSelect?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "delete", value?: any): void;
}>();

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

<style scoped>
.delete-icon {
  position: absolute;
  top: 2%;
  right: 2%;
  opacity: 0.8;
}

/* .delete-icon:hover {
    opacity: 1;
} */

.image-card:hover {
  .delete-icon {
    opacity: 1;
  }
}
</style>
