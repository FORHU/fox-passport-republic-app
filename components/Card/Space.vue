<template>
  <v-card
    rounded="md"
    elevation="0"
    width="100%"
    class="pa-3"
    style="border-width: thin"
  >
    <v-row no-gutters class="w-100" justify="space-between" align="center">
      <v-col md="6">
        <v-row no-gutters align="center">
          <v-col cols="3">
            <v-img
              :src="imageSrc || '/images/space/space-avatar.png'"
              height="50"
              width="50"
              cover
              alt="Space Card"
            ></v-img>
          </v-col>
          <v-col cols="8">
            <v-row
              no-gutters
              class="font-weight-bold text-subtitle-1 text-primary"
              :style="{ width: `${smAndUp ? '' : '220px'}` }"
            >
              <v-col class="truncate-text">{{ cardData?.name }}</v-col>
            </v-row>
            <v-row no-gutters class="d-md-none" align="end"
              ><v-chip
                :text="status"
                size="x-small"
                readonly
                :class="`bg-${statusColor}`"
              ></v-chip
            ></v-row>
          </v-col>
        </v-row>
      </v-col>
      <v-col md="2" class="d-none d-md-flex" align="end" v-if="status">
        <v-row no-gutters align="center">
          <v-col cols="3">
            <v-icon :color="statusColor ? statusColor : 'primary'" class="mr-2"
              >mdi-circle-medium</v-icon
            >
          </v-col>
          <v-col cols="9" class="text-caption text-start">{{ status }}</v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { smAndUp } = useDisplay();
const props = defineProps<{
  cardData: {
    name: string;
    imageUrl: string | any[];
    status?: string;
  };
  addFunctionCard?: boolean;
  status?: string;
  statusColor?: string;
}>();

const emit = defineEmits(["preview"]);

const imageSrc = computed(() => {
  if (typeof props.cardData.imageUrl === "string") {
    return props.cardData.imageUrl;
  } else {
    // get the first image file not video in the array
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg"];
    const imageObj = props.cardData.imageUrl.find((obj) => {
      const extension = obj.path
        .substring(obj.path.lastIndexOf("."))
        .toLowerCase();
      if (imageExtensions.includes(extension)) {
        return true;
      }
    });

    return imageObj?.path || null;
  }
});

const spaceStatus = computed(() => {
  if (props.cardData?.status === "DRAFT") {
    return "Finish Space Profile";
  } else if (props.cardData?.status === "PUBLISHED") {
    return "Edit Space Profile";
  } else {
    return "Pending Space Approval";
  }
});
</script>

<style scoped>
.truncate-text {
  display: inline-block;
  /* Adjust width as needed */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
