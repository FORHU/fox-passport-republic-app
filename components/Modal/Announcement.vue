<template>
  <v-dialog v-model="showPromoteDialog" max-width="700" persistent>
    <v-card min-height="450">
      <v-row no-gutters class="px-5 py-3 py-sm-5 ga-5 ga-sm-7">
        <v-icon
            class="close-icon"
            @click="emit('closeAnnouncementDialog', dontShowAgain)"
          >
            mdi-close
          </v-icon>
        <v-col
          cols="12"
          class="d-flex justify-space-between align-center w-100"
        >
          <span class="font-weight-bold text-20px" style="line-height: 1.5rem;">{{
            props.announcement.title
          }}</span>
        </v-col>
        <v-col cols="12">
          <v-img
            :src="props.announcement?.attachment?.path"
            alt="Venue4use announcement"
            height="auto"
            class="w-100"
            contain
            style="border-color: black !important"
          ></v-img>
        </v-col>
        <v-col cols="12">
          <v-row no-gutters>
            <v-col cols="12" class="font-weight-bold"><span>Description</span></v-col>
            <v-col cols="12"
              ><span
                >"{{ props.announcement.description }}"</span
              ></v-col
            >
          </v-row>
        </v-col>
        <v-col cols="12" class="d-flex align-center">
          <v-checkbox
            v-if="!route.path.includes('/announcements/list')"
            v-model="dontShowAgain"
            label="Don't show me this again"
            density="compact"
            hide-details
          ></v-checkbox>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>
<script setup>
const props = defineProps({
  announcement: Object,
});

const emit = defineEmits(["closeAnnouncementDialog"]);
const showPromoteDialog = defineModel({ default: false });
const route = useRoute();
const dontShowAgain = ref(false);
</script>
<style scoped>
.close-icon {
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
  color: #000; 
}
</style>
