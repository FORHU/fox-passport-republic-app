<template>
  <v-bottom-sheet v-model="showDialog">
    <v-card class="text-center" height="300" style="border-top-left-radius: 15px; border-top-right-radius: 15px;"
      @touchstart="onTouchStart" @touchend="onTouchEnd">
      <v-row no-gutters class="mt-3 d-flex justify-center">
        <v-divider thickness="3" style="max-width: 80px;"></v-divider>
      </v-row>
      <v-row no-gutters class="fill-height w-100 pa-5">
        <v-col cols="12" class="text-secondary font-600 text-20px" style="line-height: 1.2;">{{ promptTitle }}</v-col>
        <v-col v-if="promptText" cols="12" class="text-charcoal text-16px mt-2" style="line-height: 1.2;">{{ promptText
          }}</v-col>
        <v-col cols="12" align="end" class="mt-10">
          <v-btn type="submit" block rounded="lg" size="large" text="Save" color="secondary" border="secondary md"
            variant="outlined" class="mb-2" :loading="updatingSpace" @click.stop="emit('save'); showDialog = false" />
          <v-btn v-if="isForApproval" block color="rejected" text="Reject" size="large" rounded="lg" class="mb-2"
            @click="emit('reject'); showDialog = false"></v-btn>

          <v-btn v-if="isAllowSuspend" block color="rejected" text="Suspend" size="large" rounded="lg" class="mb-2"
            @click="emit('suspend'); showDialog = false"></v-btn>

          <v-btn v-if="isForDeletion" color="rejected" variant="flat" text="Approve Delete" size="large" rounded="lg"
            class="mb-2" @click="emit('delete');" block></v-btn>

          <v-btn :disabled="!isForApproval" block color="secondary" text="Approve" size="large" rounded="lg"
            @click="emit('publish'); showDialog = false"></v-btn>

        </v-col>
      </v-row>
    </v-card>
  </v-bottom-sheet>
</template>
<script setup lang="ts">
import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp } = useDisplay();

const props = defineProps({
  promptTitle: {
    type: String,
    required: false,
  },
  promptText: {
    type: String,
    required: false
  },
  updatingSpace: {
    type: Boolean,
    default: false,
    required: false
  },
  isForApproval: {
    type: Boolean,
    default: false,
    required: false
  },
  isAllowSuspend: {
    type: Boolean,
    default: false,
    required: false
  },
  isForDeletion: {
    type: Boolean,
    default: false,
    required: false
  },
  ownerVerified: {
    type: Boolean,
    default: false,
    required: false
  },

})

const showDialog = defineModel({ default: false });


const emit = defineEmits(["publish", "reject", "save", "suspend", 'delete']);


let startY = 0;
let endY = 0;
let minSwipeValue = 10;

const onTouchStart = (event: any) => {
  startY = event.touches[0].clientY;

}

const onTouchEnd = (event: any) => {
  endY = event.changedTouches[0].clientY;

  if ((endY - startY) > minSwipeValue) {
    showDialog.value = false;
  }
}

const handleDisagree = () => {
  showDialog.value = false;
  emit('disagree');
}

</script>
