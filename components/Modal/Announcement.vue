<template>
  <v-dialog v-model="showPromoteDialog" max-width="490" persistent>
    <v-card min-height="450">
      <v-row no-gutters class="pa-5 ga-5">
        <v-col
          cols="12"
          class="d-flex justify-space-between align-center w-100"
        >
          <span class="font-weight-bold text-20px">{{
            props.announcement.title
          }}</span>
          <v-icon @click="emit('closeAnnouncementDialog')">mdi-close</v-icon>
        </v-col>
        <v-col
          cols="12"
          class="border-md"
          style="border-color: black !important"
        >
          <v-row no-gutters>
            <v-col cols="12">
              <v-img
                :src="props.announcement?.attachment?.path"
                alt="Venue4use announcement"
                height="300"
                class="w-100"
              ></v-img>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12">
          <v-row no-gutters>
            <v-col cols="12"><span>Description</span></v-col>
            <v-col cols="12"
              ><span class="font-weight-bold"
                >"{{ props.announcement.description }}"</span
              ></v-col
            >
          </v-row>
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
</script>
<style scoped></style>
