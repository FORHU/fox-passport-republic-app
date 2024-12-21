<template>
  <v-row>
    <!-- <v-col cols="12" class="d-flex justify-center">
      <v-img
        src="public/images/space/rafiki.png"
        :width="smAndUp ? 479 : 350"
        :height="smAndUp ? 354 : 200"
      ></v-img>
    </v-col> -->
    <v-col cols="12" class="mt-16 pt-16">
      <p class="font-weight-bold text-center">
        {{ search ? "No Public Listing Yet" : "No List Shown" }}
      </p>
      <p class="text-center">
        We will let you know if there’s already available
      </p>
    </v-col>

    <v-col
      cols="12"
      class="d-flex justify-center text-disabled"
      v-if="showButton"
    >
      <span>Click "Add New Space" to add new item.</span>
    </v-col>
    <v-col cols="12" class="d-flex justify-center" v-if="showButton">
      <ButtonFlatLooseButton
        label="add new space"
        @click="emit('add-space')"
        variant="outlined"
      />
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
import { useDisplay } from "vuetify";
const { smAndUp } = useDisplay();
defineProps({
  showButton: Boolean,
  search: Boolean,
});
const emit = defineEmits(["add-space"]);
</script>
