<template>
  <v-dialog class="d-none d-sm-flex" v-model="showDialog" max-width="500" opacity="80%" @click="showDialog = false">
    <v-card rounded="lg" color="white" class="text-secondary" @click.stop>
      <v-row no-gutters class="fill-height w-100 pa-5">
        <v-col cols="12" class="text-secondary font-600 text-20px" style="line-height: 1.2;">{{ promptTitle }}</v-col>
        <v-col v-if="promptText" cols="12" class="text-charcoal text-16px mt-2" style="line-height: 1.2;">{{ promptText
          }}</v-col>
        <v-col cols="12" align="end" class="mt-10">
          <v-btn variant="outlined" border="secondary md" rounded="lg" class="text-secondary mr-2"
            @click="handleDisagree">{{ disagreeButtonText }}</v-btn>
          <v-btn variant="flat" :color="agreeButtonColor" rounded="lg" @click="emit('agree')" :loading="loading">{{
            agreeButtonText }}</v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
  <v-bottom-sheet class="d-sm-none" v-model="showDialog" >
    <v-card class="text-center" height="300" style="border-top-left-radius: 15px; border-top-right-radius: 15px;" @touchstart="onTouchStart"
    @touchend="onTouchEnd">
      <v-row no-gutters  class="mt-3 d-flex justify-center" >
        <v-divider thickness="3" style="max-width: 80px;"></v-divider>
      </v-row>
      <v-row no-gutters class="fill-height w-100 pa-5">
        <v-col cols="12" class="text-secondary font-600 text-20px" style="line-height: 1.2;">{{ promptTitle }}</v-col>
        <v-col v-if="promptText" cols="12" class="text-charcoal text-16px mt-2" style="line-height: 1.2;">{{ promptText
          }}</v-col>
        <v-col cols="12" align="end" class="mt-10">
          <v-btn variant="flat" :color="agreeButtonColor" rounded="lg" @click="emit('agree')" :loading="loading" block height="45">{{
            agreeButtonText }}</v-btn>
          <v-btn variant="outlined" border="secondary md" rounded="lg" class="text-secondary mt-3"
            @click="handleDisagree" block height="45">{{ disagreeButtonText }}</v-btn>
         
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
    required: true,
  },
  promptText: {
    type: String,
    required: false
  },
  disagreeButtonText: {
    type: String,
    required: false,
    default: "No"
  },
  agreeButtonText: {
    type: String,
    required: true,
    default: "Yes"
  },
  loading: {
    type: Boolean,
    default: false,
    required: false
  },
  agreeButtonColor: {
    type: String,
    default: "secondary",
    required: false
  }
})

const showDialog = defineModel({ default: false });


const emit = defineEmits(["agree", "disagree"]);


let startY = 0;
let endY = 0;
let minSwipeValue = 10;

const onTouchStart = (event: any) => {
  startY = event.touches[0].clientY;

}

const onTouchEnd = (event: any) => {
  endY = event.changedTouches[0].clientY;

  if((endY - startY) > minSwipeValue){
    showDialog.value = false;
  } 
}

const handleDisagree = () => {
  showDialog.value = false;
  emit('disagree');
}

</script>
