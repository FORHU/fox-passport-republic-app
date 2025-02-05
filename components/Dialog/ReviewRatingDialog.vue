<template>
  <v-dialog
    class="d-none d-sm-flex"
    v-model="showDialog"
    max-width="500"
    opacity="80%"
    @click="showDialog = false"
  >
    <v-card rounded="lg" color="white" class="text-secondary" @click.stop>
      <v-row no-gutters class="fill-height w-100 pa-5">
        <v-col cols="12">
          <v-row no-gutters>
            <v-col
              cols="11"
              class="text-secondary font-600 text-20px d-flex justify-center"
              style="line-height: 1.2"
              >{{ promptTitle }}</v-col
            >
            <v-col cols="1" class="d-flex justify-start">
              <v-btn
                icon="mdi-close"
                density="compact"
                variant="text"
                @click="showDialog = false"
              ></v-btn>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" class="my-3">
          <v-row no-gutters>
            <v-col cols="6">
              <div class="d-flex align-center">
                <span>
                  <ProfileAvatar
                    :first_name="specificRating.user.first_name"
                    :img-src="specificRating?.profile_picture"
                    :last_name="specificRating.user.last_name"
                    class="mr-2"
                  />
                </span>
                <span>{{
                  specificRating.user.first_name +
                  " " +
                  specificRating.user.last_name
                }}</span>
              </div>
            </v-col>
            <v-col cols="6" class="d-flex align-center justify-end mb-3">
              <v-rating
                readonly
                :length="specificRating.rating"
                :size="16"
                :model-value="specificRating.rating"
                :color="specificRating.rating >= 2 ? 'amber' : 'warning'"
                :active-color="specificRating.rating > 2 ? 'amber' : 'warning'"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-divider class="my-1 border-opacity-75"></v-divider>
        <v-col cols="12" class="my-2">
          <p class="font-italic">{{ specificRating.publicNote }}</p>
        </v-col>
        <v-col cols="12" class="mt-10">
          {{ new Date(specificRating.createdAt).toLocaleString() }}
        </v-col>
        <v-col cols="12" align="end" class="mt-10">
          <v-btn
            variant="outlined"
            border="secondary md"
            rounded="lg"
            class="text-secondary mr-2 bg-red"
            @click="emit('disagree')"
            :disabled="specificRating.status === 'REJECTED'"
            :readonly="specificRating.status === 'REJECTED'"
            >{{ disagreeButtonText }}</v-btn
          >
          <v-btn
            variant="flat"
            :color="agreeButtonColor"
            rounded="lg"
            @click="emit('agree')"
            :loading="loading"
            :disabled="specificRating.status === 'APPROVED'"
            :readonly="specificRating.status === 'APPROVED'"
            >{{ agreeButtonText }}</v-btn
          >
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
  <v-bottom-sheet class="d-sm-none" v-model="showDialog">
    <v-card
      class="text-center"
      min-height="360"
      max-height="465"
      style="border-top-left-radius: 15px; border-top-right-radius: 15px"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <v-row no-gutters class="mt-3 d-flex justify-center">
        <v-divider thickness="3" style="max-width: 80px"></v-divider>
      </v-row>
      <v-row no-gutters class="fill-height w-100 pa-5">
        <v-col cols="12">
          <v-row no-gutters>
            <v-col
              cols="11"
              class="text-secondary font-600 text-20px d-flex justify-center"
              style="line-height: 1.2"
              >{{ promptTitle }}</v-col
            >
            <v-col cols="1" class="d-flex justify-start">
              <v-btn
                icon="mdi-close"
                density="compact"
                variant="text"
                @click="showDialog = false"
              ></v-btn>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" class="my-3">
          <v-row no-gutters>
            <v-col cols="6">
              <div class="d-flex align-center">
                <span>
                  <ProfileAvatar
                    :first_name="specificRating.user.first_name"
                    :img-src="specificRating?.profile_picture"
                    :last_name="specificRating.user.last_name"
                    class="mr-2"
                  />
                </span>
                <span>{{
                  specificRating.user.first_name +
                  " " +
                  specificRating.user.last_name
                }}</span>
              </div>
            </v-col>
            <v-col cols="6" class="d-flex align-center justify-end mb-3">
              <v-rating
                readonly
                :length="specificRating.rating"
                :size="16"
                :model-value="specificRating.rating"
                :color="specificRating.rating >= 2 ? 'amber' : 'warning'"
                :active-color="specificRating.rating > 2 ? 'amber' : 'warning'"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-divider class="my-1 border-opacity-75"></v-divider>
        <v-col cols="12" class="my-2">
          <p class="font-italic">{{ specificRating.publicNote }}</p>
        </v-col>
        <v-col cols="12" class="mt-10">
          {{ new Date(specificRating.createdAt).toLocaleString() }}
        </v-col>
        <v-col cols="12" align="end" class="mt-10">
          <v-btn
            variant="outlined"
            border="secondary md"
            rounded="lg"
            class="text-secondary mr-2 bg-red"
            @click="emit('disagree')"
            :disabled="specificRating.status === 'REJECTED'"
            :readonly="specificRating.status === 'REJECTED'"
            >{{ disagreeButtonText }}</v-btn
          >
          <v-btn
            variant="flat"
            :color="agreeButtonColor"
            rounded="lg"
            @click="emit('agree')"
            :loading="loading"
            :disabled="specificRating.status === 'APPROVED'"
            :readonly="specificRating.status === 'APPROVED'"
            >{{ agreeButtonText }}</v-btn
          >
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
    required: false,
  },
  disagreeButtonText: {
    type: String,
    required: false,
    default: "No",
  },
  agreeButtonText: {
    type: String,
    required: true,
    default: "Yes",
  },
  specificRating: {
    type: Object,
    required: true,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
    required: false,
  },
  agreeButtonColor: {
    type: String,
    default: "secondary",
    required: false,
  },
});

const showDialog = defineModel({ default: false });

const emit = defineEmits(["agree", "disagree"]);

let startY = 0;
let endY = 0;
let minSwipeValue = 10;

const onTouchStart = (event: any) => {
  startY = event.touches[0].clientY;
};

const onTouchEnd = (event: any) => {
  endY = event.changedTouches[0].clientY;

  if (endY - startY > minSwipeValue) {
    showDialog.value = false;
  }
};
</script>
