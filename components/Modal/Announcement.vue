<template>
  <v-dialog v-model="showPromoteDialog" max-width="800" persistent rounded="md" scrollable="false" opacity="50%">
    <v-card max-height="90dvh" class="px-5 py-3 py-sm-5 ga-5 ga-sm-5" >        
        <v-row no-gutters class="w-100">
          <!-- Title (Fixed) -->
        <span class="d-flex justify-space-between align-center w-100 pr-5">
          <span class="font-weight-bold text-20px" style="line-height: 1.5rem;">{{ props.announcement.title }}</span>
        </span>

        <!-- Close Icon -->
        <v-btn icon="mdi-close" class="close-icon" size="small" @click="emit('closeAnnouncementDialog', dontShowAgain)">
        </v-btn>
        </v-row>
        
        <!-- Image (Scrollable) -->
        <v-row no-gutters class="w-100 scrollable-content">
          <v-col cols="12">
            <v-img
              :src="props.announcement?.attachment?.path"
              alt="Venue4use announcement"
              height="auto"
              class="w-100"
              contain
              cover
              max-height="650px"
              style="border-color: black !important"
            ></v-img>
          </v-col>
          <!-- Description (Scrollable) -->
        <v-col cols="12" class="pt-5">
          <v-row no-gutters>
            <v-col cols="12" class="font-weight-bold">
              <!-- <span>Description</span> -->
            </v-col>
            <v-col cols="12">
              <span style="font-style: italic;">{{ props.announcement?.description }}</span>
            </v-col>
          </v-row>
        </v-col>
        </v-row>
        
        

        <!-- Checkbox (Fixed) -->
        <v-row no-gutters class="w-100 d-flex align-center">
          <v-checkbox
            v-if="!route.path.includes('/announcements/list')"
            v-model="dontShowAgain"
            label="Don't show me this again"
            density="compact"
            hide-details
          ></v-checkbox>
        </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  announcement: Object,
});

const { isAdmin } = useAccess();

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

/* Fixed height for the dialog content */
.scrollable-content {
  overflow-y: auto; /* Enable scrolling for this content */
  max-height: auto; /* Adjust based on your layout and design */
}

</style>